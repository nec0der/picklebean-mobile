/**
 * useMessages - Real-time subscription to chat messages
 */

import { useState, useEffect, useCallback } from 'react';
import { subscribeToMessages, sendMessage, markChatAsRead } from '@/services/chatService';
import { useAuth } from '@/contexts/AuthContext';
import type { Message, CreateMessageData, ReplyTo } from '@/types/chat';

interface UseMessagesReturn {
  messages: Message[];
  loading: boolean;
  error: Error | null;
  sendMessage: (text: string, replyTo?: ReplyTo) => Promise<void>;
  sending: boolean;
}

export const useMessages = (chatId: string | null): UseMessagesReturn => {
  const { userDocument } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [sending, setSending] = useState(false);

  const userId = userDocument?.uid;
  const userName = userDocument?.displayName || userDocument?.username || 'User';

  // Subscribe to messages
  useEffect(() => {
    if (!chatId || !userId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = subscribeToMessages(
      chatId,
      (updatedMessages) => {
        setMessages(updatedMessages);
        setLoading(false);
        setError(null);
        
        // Mark chat as read when messages are received
        markChatAsRead(chatId, userId).catch(console.error);
      },
      (err) => {
        console.error('Error subscribing to messages:', err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [chatId, userId]);

  // Send a message (with optional reply-to support)
  const handleSendMessage = useCallback(async (text: string, replyTo?: ReplyTo): Promise<void> => {
    if (!chatId || !userId || !text.trim()) {
      return;
    }

    setSending(true);
    
    try {
      const messageData: CreateMessageData = {
        chatId,
        senderId: userId,
        senderName: userName,
        text: text.trim(),
        type: 'text',
        replyTo,
      };

      await sendMessage(messageData);
    } catch (err) {
      console.error('Error sending message:', err);
      throw err;
    } finally {
      setSending(false);
    }
  }, [chatId, userId, userName]);

  return {
    messages,
    loading,
    error,
    sendMessage: handleSendMessage,
    sending,
  };
};
