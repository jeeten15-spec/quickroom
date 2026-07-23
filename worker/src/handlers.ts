import {
  ROOM_TEMPLATES,
  createRoomRecord,
  privateMessagePath,
  roomImagePath,
  type Message,
  type Participant,
  type Room,
  type User
} from '../../shared/src/models';
import {
  databaseGet,
  databasePatch,
  databasePut,
  deleteStorageObjectsByPrefix,
  getStorageObjectMetadata,
  signStorageDownloadUrl,
  signStorageUploadUrl,
  type AuthenticatedUser,
  type Env
} from './firebase';
import {
  ValidationError,
  isRecord,
  validateBoolean,
  validateExpiry,
  validateImage,
  validateImagePath,
  validateNickname,
  validateRoomId,
  validateRoomName,
  validateRoomType,
  validateTemplate,
  validateText,
  validateUid
} from './validation';

type StoredRoom = Room & {
  messages?: Record<string, Message>;
  participants?: Record<string, Participant>;
};

interface ExpiredRoomTombstone {
  expiredAt: number;
  storageCleanupPending: boolean;
  cleanedAt?: number;
}

const rateLimitState = new Map<string, number>();
const PRESENCE_TTL_MS = 15_000;

export async function createRoom(
  body: unknown,
  user: AuthenticatedUser,
  env: Env
): Promise<Record<string, unknown>> {
  const input = expectRecord(body);
  enforceRateLimit(`create:${user.uid}`, 5_000);

  const template = validateTemplate(input.template);
  const now = Date.now();
  const roomId = createId();
  const nickname = validateNickname(input.nickname);
  const room = createRoomRecord(
    {
      name: validateRoomName(input.name),
      template,
      type: validateRoomType(input.type),
      allowPrivateChat: validateBoolean(input.allowPrivateChat, 'allowPrivateChat'),
      expiresAt: validateExpiry(input.expiry),
      createdBy: user.uid
    },
    now
  );
  room.stats.participantsCurrent = 1;
  room.stats.participantsPeak = 1;
  room.stats.messageCount = 2;

  const participant: Participant = {
    nick: nickname,
    joinedAt: now,
    lastActive: now,
    isMutedUntil: null
  };
  const welcomeMessage = systemMessage(
    ROOM_TEMPLATES[template].welcomeMessage,
    'system',
    'QuickRoom',
    now
  );
  const roomCreatedMessage = systemMessage('Room created.', 'system', 'QuickRoom', now);
  const roomCreatedMessageId = createId();
  const welcomeMessageId = createId();
  const userRecord: User = { nick: nickname, createdAt: now, lastSeen: now };

  // A root PATCH makes room creation, the creator's presence, welcome message,
  // and user record a single Realtime Database multi-location update.
  await databasePatch(env, '/', {
    [`rooms/${roomId}`]: {
      ...room,
      participants: { [user.uid]: participant },
      messages: {
        [roomCreatedMessageId]: roomCreatedMessage,
        [welcomeMessageId]: welcomeMessage
      }
    },
    [`users/${user.uid}`]: userRecord
  });

  // The hourly Cron Trigger and lazy access checks remove this room at expiry.
  return {
    roomId,
    room,
    shareUrl: `https://quickroom.org/room/${roomId}`
  };
}

export async function joinRoom(
  body: unknown,
  user: AuthenticatedUser,
  env: Env
): Promise<Record<string, unknown>> {
  const input = expectRecord(body);
  enforceRateLimit(`join:${user.uid}`, 2_000);

  const roomId = validateRoomId(input.roomId);
  const nickname = validateNickname(input.nickname);
  const room = await getActiveRoom(env, roomId);
  const now = Date.now();
  const participants = room.participants ?? {};
  const staleParticipantIds = Object.entries(participants)
    .filter(([, participant]) => participant.lastActive < now - PRESENCE_TTL_MS)
    .map(([uid]) => uid);
  const activeParticipants = Object.fromEntries(
    Object.entries(participants).filter(([uid]) => !staleParticipantIds.includes(uid))
  );
  const existingParticipant = activeParticipants[user.uid];
  const participant: Participant = existingParticipant
    ? { ...existingParticipant, nick: nickname, lastActive: now }
    : { nick: nickname, joinedAt: now, lastActive: now, isMutedUntil: null };
  const current = Object.keys(activeParticipants).length + (existingParticipant ? 0 : 1);
  const participantUpdates = Object.fromEntries(
    staleParticipantIds.map((uid) => [`participants/${uid}`, null])
  );

  // Private and Invite Only both use the opaque room link as the MVP access
  // capability. A future invite-token model can add explicit invitees here.
  // Repeated joins act as a lightweight heartbeat. Every heartbeat removes
  // participants inactive for 15 seconds, keeping the list current without
  // adding a route outside the locked API surface.
  await databasePatch(env, `rooms/${roomId}`, {
    ...participantUpdates,
    [`participants/${user.uid}`]: participant,
    stats: {
      ...room.stats,
      participantsCurrent: current,
      participantsPeak: Math.max(room.stats.participantsPeak, current)
    }
  });
  await touchUser(env, user.uid, nickname, now);

  return { roomId, room: await getActiveRoom(env, roomId) };
}

export async function sendMessage(
  body: unknown,
  user: AuthenticatedUser,
  env: Env
): Promise<Record<string, unknown>> {
  const input = expectRecord(body);
  const roomId = validateRoomId(input.roomId);
  enforceRateLimit(`message:${user.uid}:${roomId}`, 1_500);

  const room = await getActiveRoom(env, roomId);
  const sender = requireParticipant(room, user.uid);
  if (room.health === 'restricted') {
    throw new HttpError(403, 'This room is currently read-only.');
  }
  if (sender.isMutedUntil && sender.isMutedUntil > Date.now()) {
    throw new HttpError(403, 'You are temporarily unable to send messages.');
  }

  const now = Date.now();
  const messageId = createId();
  const recipientId = input.recipientId === undefined ? undefined : validateUid(input.recipientId);
  const message = await buildMessage(input, user, sender.nick, now, env, roomId);

  if (recipientId) {
    if (!room.allowPrivateChat) {
      throw new HttpError(403, 'Private chat is disabled in this room.');
    }
    if (recipientId === user.uid || !room.participants?.[recipientId]) {
      throw new ValidationError('Private chat participant is invalid.');
    }
    await databasePut(
      env,
      `${privateMessagePath(roomId, user.uid, recipientId)}/${messageId}`,
      message
    );
    return { messageId, message, privateWith: recipientId };
  }

  await databasePatch(env, `rooms/${roomId}`, {
    [`messages/${messageId}`]: message,
    stats: {
      ...room.stats,
      messageCount: room.stats.messageCount + 1,
      imageCount: room.stats.imageCount + (message.type === 'image' ? 1 : 0)
    },
    [`participants/${user.uid}/lastActive`]: now
  });

  // Future moderation runs here before persistence; it can set moderated and
  // adjust room.health without changing the client-facing message model.
  return { messageId, message };
}

export async function uploadImage(
  body: unknown,
  user: AuthenticatedUser,
  env: Env
): Promise<Record<string, unknown>> {
  const input = expectRecord(body);
  const roomId = validateRoomId(input.roomId);
  enforceRateLimit(`upload:${user.uid}:${roomId}`, 1_500);

  const room = await getActiveRoom(env, roomId);
  requireParticipant(room, user.uid);
  if (room.health === 'restricted') {
    throw new HttpError(403, 'This room is currently read-only.');
  }

  const image = validateImage(input);
  const messageId = createId();
  const imagePath = roomImagePath(roomId, messageId, image.extension).replace(/^\//, '');
  const signedUpload = await signStorageUploadUrl(env, imagePath, image.contentType);

  return {
    messageId,
    imagePath,
    contentType: image.contentType,
    uploadUrl: signedUpload.uploadUrl,
    expiresAt: signedUpload.expiresAt
  };
}

export async function reportMessage(
  body: unknown,
  user: AuthenticatedUser,
  env: Env
): Promise<Record<string, unknown>> {
  const input = expectRecord(body);
  const roomId = validateRoomId(input.roomId);
  enforceRateLimit(`report:${user.uid}`, 5_000);

  const room = await getActiveRoom(env, roomId);
  requireParticipant(room, user.uid);
  if (input.participantId !== undefined) {
    const participantId = validateUid(input.participantId);
    if (!room.participants?.[participantId]) {
      throw new HttpError(404, 'Participant not found.');
    }
    const health = degradeHealthToGood(room.health);
    await updateRoomHealth(env, roomId, room, health);
    // The locked data model has no participant-report collection. Future
    // moderation can persist an internal report ledger outside this model.
    return { reported: true, health };
  }

  const messageId = validateRoomId(input.messageId);
  const recipientId = input.recipientId === undefined ? undefined : validateUid(input.recipientId);
  const path = recipientId
    ? `${privateMessagePath(roomId, user.uid, recipientId)}/${messageId}`
    : `rooms/${roomId}/messages/${messageId}`;
  const message = await databaseGet<Message>(env, path);
  if (!message) throw new HttpError(404, 'Message not found.');

  await databasePatch(env, path, { reported: true });
  const reportedMessageCount = Object.values(room.messages ?? {}).filter(
    (roomMessage) => roomMessage.reported
  ).length + (message.reported ? 0 : 1);
  const health = recipientId
    ? room.health
    : healthForReportedMessageCount(reportedMessageCount, room.health);
  if (!recipientId && health !== room.health) {
    await updateRoomHealth(env, roomId, room, health);
  }

  // Future report scoring can escalate good → warning → restricted and add a
  // subtle system message. The V1 data model intentionally keeps no reporter list.
  return { reported: true, health };
}

export async function leaveRoom(
  body: unknown,
  user: AuthenticatedUser,
  env: Env
): Promise<Record<string, unknown>> {
  const input = expectRecord(body);
  const roomId = validateRoomId(input.roomId);
  const room = await getActiveRoom(env, roomId);
  const participant = room.participants?.[user.uid];
  const now = Date.now();

  if (participant) {
    await databasePatch(env, `rooms/${roomId}`, {
      [`participants/${user.uid}`]: null,
      stats: {
        ...room.stats,
        participantsCurrent: Math.max(0, room.stats.participantsCurrent - 1)
      }
    });
  }
  await touchUser(env, user.uid, participant?.nick ?? 'Anonymous', now);
  return { left: true };
}

export async function getRoom(
  roomIdInput: string,
  privateWithInput: string | null,
  user: AuthenticatedUser,
  env: Env
): Promise<Record<string, unknown>> {
  const roomId = validateRoomId(roomIdInput);
  const room = await getActiveRoom(env, roomId);
  const participant = room.participants?.[user.uid];

  if (!participant) {
    throw new HttpError(403, 'Join this room before viewing it.');
  }

  if (privateWithInput) {
    const privateWith = validateUid(privateWithInput);
    if (!room.allowPrivateChat || !participant || !room.participants?.[privateWith]) {
      throw new HttpError(403, 'Private chat is unavailable.');
    }
    const messages = (await databaseGet<Record<string, Message>>(
      env,
      privateMessagePath(roomId, user.uid, privateWith)
    )) ?? {};
    return {
      room: {
        ...room,
        messages: undefined
      },
      privateWith,
      messages: await withDownloadUrls(messages, env),
      participants: room.participants ?? {},
      viewerId: user.uid
    };
  }

  return {
    room: {
      ...room,
      messages: undefined
    },
    messages: await withDownloadUrls(room.messages ?? {}, env),
    participants: room.participants ?? {},
    viewerId: user.uid
  };
}

function expectRecord(value: unknown): Record<string, unknown> {
  if (!isRecord(value)) throw new ValidationError('A JSON object is required.');
  return value;
}

async function buildMessage(
  input: Record<string, unknown>,
  user: AuthenticatedUser,
  senderNick: string,
  timestamp: number,
  env: Env,
  roomId: string
): Promise<Message> {
  if (input.type === 'text') {
    return {
      type: 'text',
      text: validateText(input.text),
      imageUrl: null,
      imageSize: null,
      senderId: user.uid,
      senderNick,
      timestamp,
      reported: false,
      moderated: false
    };
  }
  if (input.type === 'image') {
    const image = validateImage(input.image);
    const imagePath = validateImagePath(
      isRecord(input.image) ? input.image.path : undefined,
      roomId
    );
    const metadata = await getStorageObjectMetadata(env, imagePath);
    if (
      !metadata ||
      metadata.contentType !== image.contentType ||
      metadata.size !== image.size
    ) {
      throw new ValidationError('The uploaded image could not be verified.');
    }
    return {
      type: 'image',
      text: null,
      imageUrl: imagePath,
      imageSize: image.size,
      senderId: user.uid,
      senderNick,
      timestamp,
      reported: false,
      moderated: false
    };
  }
  throw new ValidationError('Message type must be text or image.');
}

async function getActiveRoom(env: Env, roomId: string): Promise<StoredRoom> {
  const room = await databaseGet<StoredRoom>(env, `rooms/${roomId}`);
  if (!room) {
    const tombstone = await databaseGet<ExpiredRoomTombstone>(env, `expiredRooms/${roomId}`);
    if (tombstone) {
      if (tombstone.storageCleanupPending) {
        await completeStorageCleanup(env, roomId, tombstone);
      }
      throw new HttpError(410, 'This room has expired.');
    }
    throw new HttpError(404, 'Room not found.');
  }

  if (room.expiresAt !== null && room.expiresAt <= Date.now()) {
    await cleanupExpiredRoom(env, roomId, room.expiresAt);
    throw new HttpError(410, 'This room has expired.');
  }
  await addExpiryWarningIfDue(env, roomId, room);
  return room;
}

/**
 * Invoked by the hourly Cloudflare Cron Trigger. Lazy cleanup on every expired
 * room access is the primary free-tier path; Cron also catches rooms nobody
 * revisits after expiry and retries any failed Storage deletion.
 */
export async function cleanupExpiredRooms(env: Env): Promise<void> {
  const now = Date.now();
  const rooms = (await databaseGet<Record<string, StoredRoom>>(env, 'rooms')) ?? {};
  for (const [roomId, room] of Object.entries(rooms)) {
    if (room.expiresAt !== null && room.expiresAt <= now) {
      await cleanupExpiredRoom(env, roomId, room.expiresAt);
    }
  }

  const tombstones =
    (await databaseGet<Record<string, ExpiredRoomTombstone>>(env, 'expiredRooms')) ?? {};
  for (const [roomId, tombstone] of Object.entries(tombstones)) {
    if (tombstone.storageCleanupPending) {
      await completeStorageCleanup(env, roomId, tombstone);
    } else if (tombstone.expiredAt < now - 7 * 24 * 60 * 60 * 1000) {
      await databasePatch(env, '/', { [`expiredRooms/${roomId}`]: null });
    }
  }
}

async function cleanupExpiredRoom(env: Env, roomId: string, expiredAt: number): Promise<void> {
  const tombstone: ExpiredRoomTombstone = {
    expiredAt,
    storageCleanupPending: true
  };

  // Remove all room-scoped database data first. The tombstone preserves the
  // calm expired response and makes Storage deletion retryable.
  await databasePatch(env, '/', {
    [`rooms/${roomId}`]: null,
    [`private/${roomId}`]: null,
    [`expiredRooms/${roomId}`]: tombstone
  });
  await completeStorageCleanup(env, roomId, tombstone);
}

async function completeStorageCleanup(
  env: Env,
  roomId: string,
  tombstone: ExpiredRoomTombstone
): Promise<void> {
  try {
    await deleteStorageObjectsByPrefix(env, `rooms/${roomId}/`);
    await databasePatch(env, `expiredRooms/${roomId}`, {
      ...tombstone,
      storageCleanupPending: false,
      cleanedAt: Date.now()
    });
  } catch (error) {
    // Leave the tombstone pending; the next access or hourly Cron retries it.
    console.error('QuickRoom storage cleanup will retry.', error);
  }
}

function requireParticipant(room: StoredRoom, uid: string): Participant {
  const participant = room.participants?.[uid];
  if (!participant) throw new HttpError(403, 'Join the room before taking this action.');
  return participant;
}

async function touchUser(env: Env, uid: string, nick: string, lastSeen: number): Promise<void> {
  const existing = await databaseGet<User>(env, `users/${uid}`);
  await databasePut(env, `users/${uid}`, {
    nick,
    createdAt: existing?.createdAt ?? lastSeen,
    lastSeen,
    ...(existing?.isPro === undefined ? {} : { isPro: existing.isPro })
  });
}

function systemMessage(text: string, senderId: string, senderNick: string, timestamp: number): Message {
  return {
    type: 'system',
    text,
    imageUrl: null,
    imageSize: null,
    senderId,
    senderNick,
    timestamp,
    reported: false,
    moderated: false
  };
}

async function updateRoomHealth(
  env: Env,
  roomId: string,
  room: StoredRoom,
  health: Room['health']
): Promise<void> {
  if (health === room.health) return;

  const message = systemMessage(
    `Room health is now ${health}.`,
    'system',
    'QuickRoom',
    Date.now()
  );
  await databasePatch(env, `rooms/${roomId}`, {
    health,
    [`messages/${createId()}`]: message,
    stats: {
      ...room.stats,
      messageCount: room.stats.messageCount + 1
    }
  });
}

async function addExpiryWarningIfDue(
  env: Env,
  roomId: string,
  room: StoredRoom
): Promise<void> {
  const remainingMs = room.expiresAt === null ? null : room.expiresAt - Date.now();
  const hasWarning = room.metadata?.expiryWarning15Minutes === true;
  if (remainingMs === null || remainingMs > 15 * 60 * 1000 || hasWarning) return;

  const messageId = createId();
  const message = systemMessage(
    'This room expires in less than 15 minutes.',
    'system',
    'QuickRoom',
    Date.now()
  );
  await databasePatch(env, `rooms/${roomId}`, {
    [`messages/${messageId}`]: message,
    stats: {
      ...room.stats,
      messageCount: room.stats.messageCount + 1
    },
    metadata: {
      ...room.metadata,
      expiryWarning15Minutes: true
    }
  });
  room.stats.messageCount += 1;
  room.metadata = { ...room.metadata, expiryWarning15Minutes: true };
  room.messages = { ...(room.messages ?? {}), [messageId]: message };
}

async function withDownloadUrls(
  messages: Record<string, Message>,
  env: Env
): Promise<Record<string, Message & { imageDownloadUrl?: string; imageDownloadExpiresAt?: number }>> {
  const entries = await Promise.all(
    Object.entries(messages).map(async ([messageId, message]) => {
      if (message.type !== 'image' || !message.imageUrl) return [messageId, message] as const;
      const signedUrl = await signStorageDownloadUrl(env, message.imageUrl);
      return [
        messageId,
        {
          ...message,
          imageDownloadUrl: signedUrl.downloadUrl,
          imageDownloadExpiresAt: signedUrl.expiresAt
        }
      ] as const;
    })
  );
  return Object.fromEntries(entries);
}

function enforceRateLimit(key: string, minimumIntervalMs: number): void {
  const now = Date.now();
  const lastAction = rateLimitState.get(key);
  if (lastAction && now - lastAction < minimumIntervalMs) {
    throw new HttpError(
      429,
      `Please wait ${Math.ceil((minimumIntervalMs - (now - lastAction)) / 1000)} seconds.`
    );
  }
  rateLimitState.set(key, now);

  if (rateLimitState.size > 10_000) {
    for (const [rateKey, timestamp] of rateLimitState) {
      if (timestamp < now - 60 * 60 * 1000) rateLimitState.delete(rateKey);
    }
  }
}

function createId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(18));
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function degradeHealthToGood(currentHealth: Room['health']): Room['health'] {
  return currentHealth === 'excellent' ? 'good' : currentHealth;
}

function healthForReportedMessageCount(
  reportedMessageCount: number,
  currentHealth: Room['health']
): Room['health'] {
  if (currentHealth === 'restricted' || reportedMessageCount >= 5) return 'restricted';
  if (currentHealth === 'warning' || reportedMessageCount >= 3) return 'warning';
  return degradeHealthToGood(currentHealth);
}

export class HttpError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
  }
}
