import { memo, type ReactNode } from 'react';
import { View, Text } from 'react-native';
import { Avatar } from '@/components/ui/Avatar';
import { LoadingSpinner } from '@/components/common';
import type { Player } from '@/types/lobby';

interface PlayerSlotProps {
  // Player data (optional for empty state)
  player?: Player;
  
  // Visual state
  isCurrentUser?: boolean;
  isHost?: boolean;
  
  // Right slot for icons/actions (e.g., drag handle)
  rightSlot?: ReactNode;
  
  // Optional className for additional styling
  className?: string;
}

export const PlayerSlot = memo(({ 
  player, 
  isCurrentUser = false, 
  isHost = false, 
  rightSlot,
  className = '',
}: PlayerSlotProps) => {
  // Empty state
  if (!player || !player.uid) {
    return (
      <View className={`flex-row items-center h-16 px-3 border-2 border-dashed border-gray-300 rounded-lg ${className}`}>
        <LoadingSpinner size="small" />
        <Text className="ml-3 text-gray-500">Waiting for player...</Text>
      </View>
    );
  }

  // Filled state
  return (
    <View
      className={`flex-row items-center h-16 px-3 rounded-lg border-2 ${
        isCurrentUser
          ? 'bg-blue-50 border-blue-200'
          : 'bg-gray-50 border-gray-200'
      } ${className}`}
    >
      <Avatar
        uri={player.photoURL || null}
        name={player.displayName}
        size="md"
      />
      <View className="flex-1 ml-3">
        <Text className="font-medium text-gray-900">{player.displayName}</Text>
        <View className="flex-row gap-2">
          {isHost && (
            <Text className="text-xs text-blue-600 font-medium">Host</Text>
          )}
          {isCurrentUser && (
            <Text className="text-xs text-green-600 font-medium">You</Text>
          )}
        </View>
      </View>
      {rightSlot && <View className="ml-2">{rightSlot}</View>}
    </View>
  );
});

PlayerSlot.displayName = 'PlayerSlot';
