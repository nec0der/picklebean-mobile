/**
 * ChatListItem - Single chat row in the chat list
 * Shows avatar, name, last message preview, timestamp, and unread badge
 */

import { memo, useCallback } from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { Avatar } from '@/components/ui/Avatar';
import type { ChatListItem as ChatListItemType } from '@/types/chat';

interface ChatListItemProps {
  chat: ChatListItemType;
  onPress: (chatId: string) => void;
}

/**
 * Format timestamp for display (e.g., "2:30 PM", "Yesterday", "Mon")
 */
const formatTimestamp = (timestamp: { seconds: number } | null): string => {
  if (!timestamp) return '';

  const date = new Date(timestamp.seconds * 1000);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    // Today - show time
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    // Within a week - show day name
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  } else {
    // Older - show date
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }
};

/**
 * Truncate message preview
 */
const truncateMessage = (text: string, maxLength = 40): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

export const ChatListItem = memo(({ chat, onPress }: ChatListItemProps) => {
  const handlePress = useCallback(() => {
    onPress(chat.id);
  }, [chat.id, onPress]);

  const hasUnread = chat.unreadMessages > 0;

  return (
    <Pressable
      onPress={handlePress}
      className="flex-row items-center px-4 py-4 bg-white active:bg-gray-50"
    >
      {/* Avatar */}
      <View className="mr-4">
        {chat.type === 'group' ? (
          // Group chat avatar - photo or letter avatar
          <View className="items-center justify-center overflow-hidden bg-green-500 rounded-full w-14 h-14">
            {chat.displayPhotoURL ? (
              <Image
                source={{ uri: chat.displayPhotoURL }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <Text className="text-xl font-bold !text-white">
                {chat.displayName.charAt(0).toUpperCase()}
              </Text>
            )}
          </View>
        ) : (
          // Individual chat - uses Avatar with name-based colors
          <Avatar uri={chat.displayPhotoURL} name={chat.displayName} size="md" />
        )}
      </View>

      {/* Content */}
      <View className="flex-1 min-w-0">
        {/* Top row: Name and timestamp */}
        <View className="flex-row items-center justify-between mb-0.5">
          <Text
            className={`text-base flex-1 mr-2 ${
              hasUnread ? 'font-semibold text-gray-900' : 'font-medium text-gray-900'
            }`}
            numberOfLines={1}
          >
            {chat.displayName}
          </Text>
          <Text
            className={`text-xs ${
              hasUnread ? 'text-blue-500 font-medium' : 'text-gray-400'
            }`}
          >
            {chat.lastMessage ? formatTimestamp(chat.lastMessage.timestamp as any) : ''}
          </Text>
        </View>

        {/* Bottom row: Message preview and unread badge */}
        <View className="flex-row items-center justify-between">
          <Text
            className={`text-sm flex-1 mr-2 ${
              hasUnread ? 'text-gray-700' : 'text-gray-500'
            }`}
            numberOfLines={1}
          >
            {chat.lastMessage
              ? truncateMessage(chat.lastMessage.text)
              : 'No messages yet'}
          </Text>

          {/* Unread badge */}
          {hasUnread && (
            <View className="bg-blue-500 rounded-full min-w-[20px] h-5 px-1.5 items-center justify-center">
              <Text className="text-xs font-semibold !text-white">
                {chat.unreadMessages > 99 ? '99+' : chat.unreadMessages}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
});

ChatListItem.displayName = 'ChatListItem';

export type { ChatListItemProps };
