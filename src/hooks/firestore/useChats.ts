/**
 * useChats - Real-time subscription to user's chats
 */

import { useState, useEffect, useMemo } from 'react';
import { subscribeToChats, subscribeToUnreadCount } from '@/services/chatService';
import { useAuth } from '@/contexts/AuthContext';
import type { Chat, ChatListItem } from '@/types/chat';

interface UseChatsReturn {
  chats: ChatListItem[];
  loading: boolean;
  error: Error | null;
  totalUnread: number;
}

/**
 * Transform raw chat to ChatListItem with display properties
 */
const transformToChatListItem = (chat: Chat, currentUserId: string): ChatListItem => {
  let displayName: string;
  let displayPhotoURL: string | null = null;

  if (chat.type === 'group') {
    // Group chat - use group name and group photo
    displayName = chat.name || 'Group Chat';
    displayPhotoURL = chat.photoURL || null;
  } else {
    // Individual chat - find the other participant
    const otherUserId = chat.participantIds.find(id => id !== currentUserId);
    const otherUser = otherUserId ? chat.participantInfo[otherUserId] : null;
    
    displayName = otherUser?.displayName || otherUser?.username || 'Unknown User';
    displayPhotoURL = otherUser?.photoURL || null;
  }

  return {
    ...chat,
    displayName,
    displayPhotoURL,
    unreadMessages: chat.unreadCount[currentUserId] || 0,
    isDeleted: chat.deletedFor.includes(currentUserId),
  };
};

export const useChats = (): UseChatsReturn => {
  const { userDocument } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [totalUnread, setTotalUnread] = useState(0);

  const userId = userDocument?.uid;

  useEffect(() => {
    if (!userId) {
      setChats([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribeChats = subscribeToChats(
      userId,
      (updatedChats) => {
        setChats(updatedChats);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error subscribing to chats:', err);
        setError(err);
        setLoading(false);
      }
    );

    const unsubscribeUnread = subscribeToUnreadCount(
      userId,
      (count) => {
        setTotalUnread(count);
      },
      (err) => {
        console.error('Error subscribing to unread count:', err);
      }
    );

    return () => {
      unsubscribeChats();
      unsubscribeUnread();
    };
  }, [userId]);

  // Transform chats to ChatListItems with display properties
  const chatListItems = useMemo(() => {
    if (!userId) return [];
    return chats.map(chat => transformToChatListItem(chat, userId));
  }, [chats, userId]);

  return {
    chats: chatListItems,
    loading,
    error,
    totalUnread,
  };
};

/**
 * Filter chats by search query (Telegram-style)
 */
export const filterChats = (chats: ChatListItem[], query: string): ChatListItem[] => {
  if (!query.trim()) return chats;
  
  const lowerQuery = query.toLowerCase().trim();
  
  return chats.filter(chat => {
    // Search in display name
    if (chat.displayName.toLowerCase().includes(lowerQuery)) {
      return true;
    }
    
    // For individual chats, also search in username
    if (chat.type === 'individual') {
      const otherUserId = chat.participantIds.find(id => 
        chat.participantInfo[id]?.username?.toLowerCase().includes(lowerQuery)
      );
      if (otherUserId) return true;
    }
    
    // Search in last message
    if (chat.lastMessage?.text.toLowerCase().includes(lowerQuery)) {
      return true;
    }
    
    return false;
  });
};
