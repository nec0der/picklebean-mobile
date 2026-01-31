/**
 * Chat Service - Firestore operations for messaging
 */

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { firestore } from '@/config/firebase';
import type {
  Chat,
  Message,
  CreateChatData,
  CreateMessageData,
  ChatParticipant,
  LastMessage,
} from '@/types/chat';

const CHATS_COLLECTION = 'chats';
const MESSAGES_SUBCOLLECTION = 'messages';

/**
 * Create a new chat (individual or group)
 */
export const createChat = async (data: CreateChatData): Promise<string> => {
  const chatData = {
    type: data.type,
    name: data.name || null,
    participantIds: data.participantIds,
    participantInfo: data.participantInfo,
    lastMessage: null,
    unreadCount: data.participantIds.reduce((acc, id) => ({ ...acc, [id]: 0 }), {}),
    deletedFor: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(firestore, CHATS_COLLECTION), chatData);
  return docRef.id;
};

/**
 * Find existing individual chat between two users
 */
export const findIndividualChat = async (
  userId1: string,
  userId2: string
): Promise<Chat | null> => {
  const q = query(
    collection(firestore, CHATS_COLLECTION),
    where('type', '==', 'individual'),
    where('participantIds', 'array-contains', userId1)
  );

  const snapshot = await getDocs(q);
  
  for (const docSnap of snapshot.docs) {
    const chat = { id: docSnap.id, ...docSnap.data() } as Chat;
    if (chat.participantIds.includes(userId2)) {
      return chat;
    }
  }

  return null;
};

/**
 * Get or create individual chat between two users
 */
export const getOrCreateIndividualChat = async (
  currentUser: ChatParticipant,
  otherUser: ChatParticipant
): Promise<string> => {
  // Check if chat already exists
  const existingChat = await findIndividualChat(currentUser.userId, otherUser.userId);
  
  if (existingChat) {
    // If current user had "deleted" this chat, restore it
    if (existingChat.deletedFor.includes(currentUser.userId)) {
      await updateDoc(doc(firestore, CHATS_COLLECTION, existingChat.id), {
        deletedFor: arrayRemove(currentUser.userId),
      });
    }
    return existingChat.id;
  }

  // Create new chat
  const chatId = await createChat({
    type: 'individual',
    participantIds: [currentUser.userId, otherUser.userId],
    participantInfo: {
      [currentUser.userId]: currentUser,
      [otherUser.userId]: otherUser,
    },
  });

  return chatId;
};

/**
 * Create a group chat
 */
export const createGroupChat = async (
  name: string,
  participants: ChatParticipant[]
): Promise<string> => {
  const participantIds = participants.map(p => p.userId);
  const participantInfo = participants.reduce(
    (acc, p) => ({ ...acc, [p.userId]: p }),
    {}
  );

  const chatId = await createChat({
    type: 'group',
    name,
    participantIds,
    participantInfo,
  });

  return chatId;
};

/**
 * Send a message to a chat
 * Supports text, image, and location message types
 * Supports reply-to functionality
 */
export const sendMessage = async (data: CreateMessageData): Promise<string> => {
  const { chatId, senderId, senderName, text, type = 'text', image, location, replyTo } = data;
  
  const batch = writeBatch(firestore);

  // Add message to subcollection
  const messageRef = doc(collection(firestore, CHATS_COLLECTION, chatId, MESSAGES_SUBCOLLECTION));
  const messageData: Record<string, any> = {
    senderId,
    senderName,
    text,
    type,
    createdAt: serverTimestamp(),
    readBy: [senderId],
  };
  
  // Add image data if present
  if (type === 'image' && image) {
    messageData.image = {
      url: image.url,
      width: image.width,
      height: image.height,
      ...(image.thumbnailUrl && { thumbnailUrl: image.thumbnailUrl }),
    };
  }
  
  // Add location data if present
  if (type === 'location' && location) {
    messageData.location = {
      latitude: location.latitude,
      longitude: location.longitude,
      ...(location.address && { address: location.address }),
    };
  }

  // Add replyTo data if present (for reply-to-message feature)
  if (replyTo) {
    messageData.replyTo = {
      messageId: replyTo.messageId,
      text: replyTo.text,
      senderName: replyTo.senderName,
      senderId: replyTo.senderId,
      type: replyTo.type,
    };
  }
  
  batch.set(messageRef, messageData);

  // Update chat with last message and increment unread counts
  const chatRef = doc(firestore, CHATS_COLLECTION, chatId);
  const chatDoc = await getDoc(chatRef);
  
  if (chatDoc.exists()) {
    const chat = chatDoc.data() as Chat;
    
    // Build unread count updates for all participants except sender
    const unreadUpdates: Record<string, number> = {};
    chat.participantIds.forEach(id => {
      if (id !== senderId) {
        unreadUpdates[`unreadCount.${id}`] = increment(1) as unknown as number;
      }
    });

    // Determine display text for last message preview
    let lastMessageText = text;
    if (type === 'image') {
      lastMessageText = '📷 Photo';
    } else if (type === 'location') {
      lastMessageText = location?.address || '📍 Location';
    }

    batch.update(chatRef, {
      lastMessage: {
        text: lastMessageText,
        senderId,
        senderName,
        timestamp: serverTimestamp(),
      },
      updatedAt: serverTimestamp(),
      // Restore chat for anyone who "deleted" it
      deletedFor: [],
      ...unreadUpdates,
    });
  }

  await batch.commit();
  return messageRef.id;
};

/**
 * Mark messages as read for a user
 */
export const markChatAsRead = async (chatId: string, userId: string): Promise<void> => {
  const chatRef = doc(firestore, CHATS_COLLECTION, chatId);
  
  await updateDoc(chatRef, {
    [`unreadCount.${userId}`]: 0,
  });
};

/**
 * Mark chat as deleted for a user (soft delete - hides from list)
 */
export const markChatAsDeleted = async (chatId: string, userId: string): Promise<void> => {
  const chatRef = doc(firestore, CHATS_COLLECTION, chatId);
  
  await updateDoc(chatRef, {
    deletedFor: arrayUnion(userId),
  });
};

/**
 * Subscribe to user's chats (real-time)
 */
export const subscribeToChats = (
  userId: string,
  onChatsUpdate: (chats: Chat[]) => void,
  onError: (error: Error) => void
): (() => void) => {
  const q = query(
    collection(firestore, CHATS_COLLECTION),
    where('participantIds', 'array-contains', userId),
    orderBy('updatedAt', 'desc'),
    limit(50)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const chats: Chat[] = [];
      snapshot.forEach((docSnap) => {
        const chat = { id: docSnap.id, ...docSnap.data() } as Chat;
        // Filter out chats that user has "deleted"
        if (!chat.deletedFor.includes(userId)) {
          chats.push(chat);
        }
      });
      onChatsUpdate(chats);
    },
    onError
  );
};

/**
 * Subscribe to messages in a chat (real-time)
 */
export const subscribeToMessages = (
  chatId: string,
  onMessagesUpdate: (messages: Message[]) => void,
  onError: (error: Error) => void,
  messageLimit = 50
): (() => void) => {
  const q = query(
    collection(firestore, CHATS_COLLECTION, chatId, MESSAGES_SUBCOLLECTION),
    orderBy('createdAt', 'desc'),
    limit(messageLimit)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const messages: Message[] = [];
      snapshot.forEach((docSnap) => {
        messages.push({ id: docSnap.id, chatId, ...docSnap.data() } as Message);
      });
      // Reverse to get chronological order (oldest first)
      onMessagesUpdate(messages.reverse());
    },
    onError
  );
};

/**
 * Get a single chat by ID
 */
export const getChat = async (chatId: string): Promise<Chat | null> => {
  const docSnap = await getDoc(doc(firestore, CHATS_COLLECTION, chatId));
  
  if (!docSnap.exists()) {
    return null;
  }

  return { id: docSnap.id, ...docSnap.data() } as Chat;
};

/**
 * Add participant to group chat
 */
export const addParticipant = async (
  chatId: string,
  participant: ChatParticipant
): Promise<void> => {
  const chatRef = doc(firestore, CHATS_COLLECTION, chatId);
  
  await updateDoc(chatRef, {
    participantIds: arrayUnion(participant.userId),
    [`participantInfo.${participant.userId}`]: participant,
    [`unreadCount.${participant.userId}`]: 0,
    updatedAt: serverTimestamp(),
  });
};

/**
 * Remove participant from group chat
 */
export const removeParticipant = async (
  chatId: string,
  userId: string
): Promise<void> => {
  const chatRef = doc(firestore, CHATS_COLLECTION, chatId);
  
  await updateDoc(chatRef, {
    participantIds: arrayRemove(userId),
    updatedAt: serverTimestamp(),
  });
};

/**
 * Update group chat name
 */
export const updateGroupName = async (
  chatId: string,
  name: string
): Promise<void> => {
  const chatRef = doc(firestore, CHATS_COLLECTION, chatId);
  
  await updateDoc(chatRef, {
    name,
    updatedAt: serverTimestamp(),
  });
};

/**
 * Get total unread count for a user across all chats
 */
export const getTotalUnreadCount = async (userId: string): Promise<number> => {
  const q = query(
    collection(firestore, CHATS_COLLECTION),
    where('participantIds', 'array-contains', userId)
  );

  const snapshot = await getDocs(q);
  let total = 0;

  snapshot.forEach((docSnap) => {
    const chat = docSnap.data() as Chat;
    if (!chat.deletedFor.includes(userId)) {
      total += chat.unreadCount[userId] || 0;
    }
  });

  return total;
};

/**
 * Subscribe to total unread count (real-time)
 */
export const subscribeToUnreadCount = (
  userId: string,
  onUpdate: (count: number) => void,
  onError: (error: Error) => void
): (() => void) => {
  const q = query(
    collection(firestore, CHATS_COLLECTION),
    where('participantIds', 'array-contains', userId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      let total = 0;
      snapshot.forEach((docSnap) => {
        const chat = docSnap.data() as Chat;
        if (!chat.deletedFor.includes(userId)) {
          total += chat.unreadCount[userId] || 0;
        }
      });
      onUpdate(total);
    },
    onError
  );
};
