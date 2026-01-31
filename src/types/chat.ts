import type { Timestamp } from 'firebase/firestore';

/**
 * Chat types for messaging feature
 */

export type ChatType = 'individual' | 'group';

export interface ChatParticipant {
  userId: string;
  username: string;
  displayName: string;
  photoURL: string | null;
}

export interface LastMessage {
  text: string;
  senderId: string;
  senderName: string;
  timestamp: Timestamp;
}

export interface Chat {
  id: string;
  type: ChatType;
  name: string | null; // Only for group chats
  photoURL?: string | null; // Group photo URL
  participantIds: string[];
  participantInfo: Record<string, ChatParticipant>;
  lastMessage: LastMessage | null;
  unreadCount: Record<string, number>; // { [userId]: count }
  deletedFor: string[]; // User IDs who "deleted" (hid) this chat
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type MessageType = 'text' | 'image' | 'location';

export interface LocationAttachment {
  latitude: number;
  longitude: number;
  address?: string; // Optional human-readable address
}

export interface ImageAttachment {
  url: string;
  width: number;
  height: number;
  thumbnailUrl?: string;
}

export interface ReplyTo {
  messageId: string;
  text: string;
  senderName: string;
  senderId: string;
  type: MessageType;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  text: string;
  type: MessageType; // Type of message
  image?: ImageAttachment; // Present for image messages
  location?: LocationAttachment; // Present for location messages
  replyTo?: ReplyTo; // Present when replying to another message
  starred?: boolean; // Whether message is starred/bookmarked
  createdAt: Timestamp;
  readBy: string[]; // User IDs who have read this message
}

export interface RecentSearch {
  id: string;
  type: 'chat' | 'user';
  displayName: string;
  username?: string;
  photoURL: string | null;
  timestamp: number;
}

// For creating a new chat
export interface CreateChatData {
  type: ChatType;
  name?: string; // Required for group chats
  participantIds: string[];
  participantInfo: Record<string, ChatParticipant>;
}

// For creating a new message
export interface CreateMessageData {
  chatId: string;
  senderId: string;
  senderName: string;
  text: string;
  type?: MessageType; // Defaults to 'text'
  image?: ImageAttachment;
  location?: LocationAttachment;
  replyTo?: ReplyTo; // For replies
}

// Chat list item with computed properties for display
export interface ChatListItem extends Chat {
  displayName: string; // For individual: other user's name, for group: group name
  displayPhotoURL: string | null; // For individual: other user's photo
  unreadMessages: number; // Current user's unread count
  isDeleted: boolean; // Whether current user "deleted" this chat
}
