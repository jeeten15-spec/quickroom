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
  databaseDelete,
  databaseGet,
  databasePatch,
  databasePut,
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

const rateLimitState = new Map<string, number>();

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
  room.stats.messageCount = 1;

  const participant: Participant = {
    nick: nickname,
    joinedAt: now,
    lastActive: now,
    isMutedUntil: null
  };
  const welcomeMessage = systemMessage(
    ROOM_TEMPLATES[template].welcomeMessage,
    user.uid,
    nickname,
    now
  );
  const userRecord: User = { nick: nickname, createdAt: now, lastSeen: now };

  // A root PATCH makes room creation, the creator's presence, welcome message,
  // and user record a single Realtime Database multi-location update.
  await databasePatch(env, '/', {
    [`rooms/${roomId}`]: {
      ...room,
      participants: { [user.uid]: participant },
      messages: { [createId()]: welcomeMessage }
    },
    [`users/${user.uid}`]: userRecord
  });

  // Expiry cleanup will be scheduled here (Cron Trigger or Durable Object).
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
  const existingParticipant = room.participants?.[user.uid];
  const participants = room.participants ?? {};
  const participant: Participant = existingParticipant
    ? { ...existingParticipant, nick: nickname, lastActive: now }
    : { nick: nickname, joinedAt: now, lastActive: now, isMutedUntil: null };
  const current = existingParticipant
    ? room.stats.participantsCurrent
    : room.stats.participantsCurrent + 1;

  // The opaque, high-entropy room ID in the shared room URL is the MVP invite
  // capability. The locked data model has no separate invite-token field.
  await databasePatch(env, `rooms/${roomId}`, {
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
    await databasePut(env, `${privateMessagePath(user.uid, recipientId)}/${messageId}`, message);
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
    await databasePatch(env, `rooms/${roomId}`, { health: 'good' });
    // The locked data model has no participant-report collection. Future
    // moderation can persist an internal report ledger outside this model.
    return { reported: true };
  }

  const messageId = validateRoomId(input.messageId);
  const recipientId = input.recipientId === undefined ? undefined : validateUid(input.recipientId);
  const path = recipientId
    ? `${privateMessagePath(user.uid, recipientId)}/${messageId}`
    : `rooms/${roomId}/messages/${messageId}`;
  const message = await databaseGet<Message>(env, path);
  if (!message) throw new HttpError(404, 'Message not found.');

  await databasePatch(env, path, { reported: true });
  if (!recipientId && room.health === 'excellent') {
    await databasePatch(env, `rooms/${roomId}`, { health: 'good' });
  }

  // Future report scoring can escalate good → warning → restricted and add a
  // subtle system message. The V1 data model intentionally keeps no reporter list.
  return { reported: true };
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

  if (room.type !== 'public' && !participant) {
    throw new HttpError(403, 'Join this room before viewing it.');
  }

  if (privateWithInput) {
    const privateWith = validateUid(privateWithInput);
    if (!room.allowPrivateChat || !participant || !room.participants?.[privateWith]) {
      throw new HttpError(403, 'Private chat is unavailable.');
    }
    const messages = (await databaseGet<Record<string, Message>>(
      env,
      privateMessagePath(user.uid, privateWith)
    )) ?? {};
    return {
      room,
      privateWith,
      messages: await withDownloadUrls(messages, env)
    };
  }

  return {
    room: {
      ...room,
      messages: undefined
    },
    messages: await withDownloadUrls(room.messages ?? {}, env),
    participants: room.participants ?? {}
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
  if (!room) throw new HttpError(404, 'Room not found.');

  if (room.expiresAt !== null && room.expiresAt <= Date.now()) {
    // Expired rooms and their storage objects are cleaned asynchronously by the
    // future Worker cleanup job. They are unavailable immediately.
    throw new HttpError(410, 'This room has expired.');
  }
  return room;
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

export class HttpError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
  }
}
