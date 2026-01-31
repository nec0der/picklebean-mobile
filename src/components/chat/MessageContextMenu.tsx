/**
 * MessageContextMenu - WhatsApp-style context menu with blur background
 * Shows focused message with vertical action menu (Reply, Copy, Forward, Star)
 */

import { memo, useCallback } from 'react';
import { View, Text, Pressable, Modal, Dimensions, Clipboard } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Reply, Copy, Share2, Star } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import type { Message } from '@/types/chat';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface MessageContextMenuProps {
  visible: boolean;
  message: Message | null;
  messagePosition: { x: number; y: number; width: number; height: number } | null;
  isOwnMessage: boolean;
  onClose: () => void;
  onReply: (message: Message) => void;
  onCopy: (text: string) => void;
  onForward: (message: Message) => void;
  onStar: (message: Message) => void;
  renderMessageBubble?: (message: Message) => React.ReactNode;
}

interface MenuAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
  showForTypes?: ('text' | 'image' | 'location')[];
}

export const MessageContextMenu = memo(({
  visible,
  message,
  messagePosition,
  isOwnMessage,
  onClose,
  onReply,
  onCopy,
  onForward,
  onStar,
  renderMessageBubble,
}: MessageContextMenuProps) => {
  const insets = useSafeAreaInsets();

  const handleReply = useCallback(() => {
    if (message) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onReply(message);
      onClose();
    }
  }, [message, onReply, onClose]);

  const handleCopy = useCallback(() => {
    if (message?.text) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Clipboard.setString(message.text);
      onCopy(message.text);
      onClose();
    }
  }, [message, onCopy, onClose]);

  const handleForward = useCallback(() => {
    if (message) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onForward(message);
      onClose();
    }
  }, [message, onForward, onClose]);

  const handleStar = useCallback(() => {
    if (message) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onStar(message);
      onClose();
    }
  }, [message, onStar, onClose]);

  if (!message || !messagePosition) return null;

  // Define menu actions
  const actions: MenuAction[] = [
    {
      id: 'reply',
      label: 'Reply',
      icon: <Reply size={20} color="#374151" />,
      onPress: handleReply,
    },
    {
      id: 'copy',
      label: 'Copy',
      icon: <Copy size={20} color="#374151" />,
      onPress: handleCopy,
      showForTypes: ['text'],
    },
    {
      id: 'forward',
      label: 'Forward',
      icon: <Share2 size={20} color="#374151" />,
      onPress: handleForward,
    },
    {
      id: 'star',
      label: message.starred ? 'Unstar' : 'Star',
      icon: <Star size={20} color={message.starred ? '#F59E0B' : '#374151'} fill={message.starred ? '#F59E0B' : 'none'} />,
      onPress: handleStar,
    },
  ];

  // Filter actions based on message type
  const filteredActions = actions.filter((action) => {
    if (!action.showForTypes) return true;
    return action.showForTypes.includes(message.type);
  });

  // Calculate menu position
  const menuWidth = 160;
  const menuHeight = filteredActions.length * 48 + 16; // 48px per item + padding
  
  // Position menu next to the message bubble
  let menuX = isOwnMessage 
    ? messagePosition.x - menuWidth - 8 // Left of own message
    : messagePosition.x + messagePosition.width + 8; // Right of other's message
  
  // Keep menu on screen
  if (menuX < 16) menuX = 16;
  if (menuX + menuWidth > SCREEN_WIDTH - 16) menuX = SCREEN_WIDTH - menuWidth - 16;
  
  // Position menu vertically centered with message, but keep on screen
  let menuY = messagePosition.y + (messagePosition.height / 2) - (menuHeight / 2);
  if (menuY < insets.top + 16) menuY = insets.top + 16;
  if (menuY + menuHeight > SCREEN_HEIGHT - insets.bottom - 16) {
    menuY = SCREEN_HEIGHT - insets.bottom - menuHeight - 16;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Blur background - tap to dismiss */}
      <Pressable onPress={onClose} style={{ flex: 1 }}>
        <BlurView intensity={20} tint="dark" style={{ flex: 1 }}>
          {/* Semi-transparent overlay for extra darkness */}
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' }}>
            {/* Focused message bubble - rendered at its exact position */}
            {renderMessageBubble && (
              <View
                style={{
                  position: 'absolute',
                  left: messagePosition.x - 16, // Account for padding
                  top: messagePosition.y,
                }}
                pointerEvents="none"
              >
                {renderMessageBubble(message)}
              </View>
            )}

            {/* Action menu */}
            <View
              style={{
                position: 'absolute',
                left: menuX,
                top: menuY,
                width: menuWidth,
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 12,
                elevation: 8,
                overflow: 'hidden',
              }}
            >
              {filteredActions.map((action, index) => (
                <Pressable
                  key={action.id}
                  onPress={action.onPress}
                  className="flex-row items-center px-4 active:bg-gray-100"
                  style={{
                    height: 48,
                    borderBottomWidth: index < filteredActions.length - 1 ? 1 : 0,
                    borderBottomColor: '#F3F4F6',
                  }}
                >
                  <View className="w-6 mr-3">{action.icon}</View>
                  <Text className="text-base text-gray-800">{action.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </BlurView>
      </Pressable>
    </Modal>
  );
});

export type { MessageContextMenuProps };
