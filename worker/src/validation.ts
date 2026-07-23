import { ROOM_TEMPLATES, type RoomTemplate, type RoomType } from '../../shared/src/models';

export const EXPIRY_OPTIONS = {
  '1h': 60 * 60 * 1000,
  '6h': 6 * 60 * 60 * 1000,
  '24h': 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
  never: null
} as const;

export const IMAGE_TYPES = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif'
} as const;

export type ExpiryOption = keyof typeof EXPIRY_OPTIONS;
export type ImageType = keyof typeof IMAGE_TYPES;

export function validateNickname(value: unknown): string {
  if (typeof value !== 'string') throw new ValidationError('Nickname is required.');
  const nickname = value.trim();

  if (nickname.length < 3 || nickname.length > 20 || !/^[A-Za-z0-9 ]+$/.test(nickname)) {
    throw new ValidationError(
      'Nickname must be 3–20 letters, numbers, or spaces.'
    );
  }
  return nickname;
}

export function validateRoomName(value: unknown): string {
  if (typeof value !== 'string') throw new ValidationError('Room name is required.');
  const name = value.trim();

  if (name.length < 3 || name.length > 40 || /[\u0000-\u001F\u007F]/.test(name)) {
    throw new ValidationError('Room name must be 3–40 characters.');
  }
  return name;
}

export function validateTemplate(value: unknown): RoomTemplate {
  if (typeof value !== 'string' || !Object.hasOwn(ROOM_TEMPLATES, value)) {
    throw new ValidationError('Template is invalid.');
  }
  return value as RoomTemplate;
}

export function validateRoomType(value: unknown): RoomType {
  if (value !== 'public' && value !== 'private' && value !== 'invite') {
    throw new ValidationError('Room type is invalid.');
  }
  return value;
}

export function validateBoolean(value: unknown, fieldName: string): boolean {
  if (typeof value !== 'boolean') {
    throw new ValidationError(`${fieldName} must be true or false.`);
  }
  return value;
}

export function validateExpiry(value: unknown): number | null {
  if (typeof value !== 'string' || !Object.hasOwn(EXPIRY_OPTIONS, value)) {
    throw new ValidationError('Expiry must be 1h, 6h, 24h, 7d, or never.');
  }
  const duration = EXPIRY_OPTIONS[value as ExpiryOption];
  return duration === null ? null : Date.now() + duration;
}

export function validateRoomId(value: unknown): string {
  if (typeof value !== 'string' || !/^[A-Za-z0-9_-]{16,64}$/.test(value)) {
    throw new ValidationError('Room ID is invalid.');
  }
  return value;
}

export function validateText(value: unknown): string {
  if (typeof value !== 'string') throw new ValidationError('Message text is required.');
  const text = value.trim();

  if (!text || text.length > 500) {
    throw new ValidationError('Message text must be 1–500 characters.');
  }
  return text;
}

export function validateImage(value: unknown): {
  contentType: ImageType;
  size: number;
  extension: string;
} {
  if (!isRecord(value)) throw new ValidationError('Image metadata is required.');
  const { contentType, size } = value;

  if (typeof contentType !== 'string' || !Object.hasOwn(IMAGE_TYPES, contentType)) {
    throw new ValidationError('Images must be JPEG, PNG, WebP, or GIF.');
  }
  if (!Number.isInteger(size) || size <= 0 || size > 5 * 1024 * 1024) {
    throw new ValidationError('Images must be 5 MB or smaller.');
  }

  return {
    contentType: contentType as ImageType,
    size,
    extension: IMAGE_TYPES[contentType as ImageType]
  };
}

export function validateImagePath(value: unknown, roomId: string): string {
  if (typeof value !== 'string') throw new ValidationError('Image path is required.');
  const pattern = new RegExp(`^rooms/${escapeRegex(roomId)}/[A-Za-z0-9_-]{16,64}\\.(jpg|png|webp|gif)$`);

  if (!pattern.test(value)) {
    throw new ValidationError('Image path is invalid.');
  }
  return value;
}

export function validateUid(value: unknown): string {
  if (typeof value !== 'string' || value.length < 1 || value.length > 128) {
    throw new ValidationError('Participant ID is invalid.');
  }
  return value;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export class ValidationError extends Error {}
