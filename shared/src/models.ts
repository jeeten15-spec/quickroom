/** Exact Firebase Realtime Database records used by QuickRoom. */

export type RoomTemplate =
  | 'study'
  | 'coding'
  | 'gaming'
  | 'business'
  | 'bookclub'
  | 'family'
  | 'event'
  | 'brainstorm'
  | 'interview'
  | 'blank';

export type RoomType = 'public' | 'private' | 'invite';
export type RoomHealth = 'excellent' | 'good' | 'warning' | 'restricted';
export type MessageType = 'text' | 'image' | 'system';

export interface RoomStats {
  participantsCurrent: number;
  participantsPeak: number;
  messageCount: number;
  imageCount: number;
}

export interface RoomSettings {
  AI_ENABLED: false;
}

export interface Room {
  name: string;
  template: RoomTemplate;
  icon: string;
  type: RoomType;
  allowPrivateChat: boolean;
  createdAt: number;
  expiresAt: number | null;
  createdBy: string;
  health: RoomHealth;
  stats: RoomStats;
  settings: RoomSettings;
  metadata: Record<string, unknown>;
}

export interface Message {
  type: MessageType;
  text: string | null;
  imageUrl: string | null;
  imageSize: number | null;
  senderId: string;
  senderNick: string;
  timestamp: number;
  reported: boolean;
  moderated: boolean;
}

export interface Participant {
  nick: string;
  joinedAt: number;
  lastActive: number;
  isMutedUntil: number | null;
}

export interface User {
  nick: string;
  createdAt: number;
  lastSeen: number;
  isPro?: boolean;
}

export interface RoomTemplateConfig {
  icon: string;
  suggestedTitle: string;
  welcomeMessage: string;
}

export const ROOM_TEMPLATES: Record<RoomTemplate, RoomTemplateConfig> = {
  study: {
    icon: '📚',
    suggestedTitle: 'Study Room',
    welcomeMessage: 'Welcome to the study room.'
  },
  coding: {
    icon: '💻',
    suggestedTitle: 'Coding Room',
    welcomeMessage: 'Welcome to the coding room.'
  },
  gaming: {
    icon: '🎮',
    suggestedTitle: 'Gaming Room',
    welcomeMessage: 'Welcome to the gaming room.'
  },
  business: {
    icon: '💼',
    suggestedTitle: 'Business Room',
    welcomeMessage: 'Welcome to the business room.'
  },
  bookclub: {
    icon: '📖',
    suggestedTitle: 'Book Club',
    welcomeMessage: 'Welcome to the book club.'
  },
  family: {
    icon: '👨‍👩‍👧',
    suggestedTitle: 'Family Room',
    welcomeMessage: 'Welcome to the family room.'
  },
  event: {
    icon: '🎉',
    suggestedTitle: 'Event Room',
    welcomeMessage: 'Welcome to the event room.'
  },
  brainstorm: {
    icon: '💡',
    suggestedTitle: 'Brainstorm',
    welcomeMessage: 'Welcome to the brainstorm room.'
  },
  interview: {
    icon: '📋',
    suggestedTitle: 'Interview Room',
    welcomeMessage: 'Welcome to the interview room.'
  },
  blank: {
    icon: '✨',
    suggestedTitle: 'Untitled Room',
    welcomeMessage: 'Welcome to the room.'
  }
};

export function createRoomRecord(
  input: Pick<Room, 'name' | 'template' | 'type' | 'allowPrivateChat' | 'expiresAt' | 'createdBy'>,
  createdAt: number
): Room {
  const template = ROOM_TEMPLATES[input.template];

  return {
    ...input,
    icon: template.icon,
    createdAt,
    health: 'excellent',
    stats: {
      participantsCurrent: 0,
      participantsPeak: 0,
      messageCount: 0,
      imageCount: 0
    },
    settings: { AI_ENABLED: false },
    metadata: {}
  };
}

export function privateMessagePath(uidA: string, uidB: string): string {
  const [firstUid, secondUid] = [uidA, uidB].sort();
  return `/private/${firstUid}_${secondUid}/messages`;
}

export function roomImagePath(roomId: string, messageId: string, extension: string): string {
  return `/rooms/${roomId}/${messageId}.${extension}`;
}
