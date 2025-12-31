import { memo } from 'react';
import { View, Text, Pressable } from 'react-native';
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicatorWrapper,
  ActionsheetDragIndicator,
  Divider,
} from '@gluestack-ui/themed';
import { User, UserRoundX } from 'lucide-react-native';
import { Avatar } from '@/components/ui/Avatar';
import { useAlert } from '@/hooks/common/useAlert';
import type { Player } from '@/types/lobby';

interface PlayerActionSheetProps {
  visible: boolean;
  player: Player | null;
  isHost: boolean;
  isHostPlayer: boolean;
  onClose: () => void;
  onViewProfile: (userId: string) => void;
  onRemove: () => void;
}

export const PlayerActionSheet = memo(({
  visible,
  player,
  isHost,
  isHostPlayer,
  onClose,
  onViewProfile,
  onRemove,
}: PlayerActionSheetProps) => {
  const alert = useAlert();
  
  if (!player) return null;

  const handleViewProfile = () => {
    onClose();
    onViewProfile(player.uid);
  };

  const handleRemove = () => {
    // Show confirmation dialog on top of action sheet
    alert.confirm(
      `Remove ${player.displayName}?`,
      'They can rejoin anytime with the room code, QR, or NFC.',
      {
        onConfirm: () => {
          onClose(); // Close action sheet after confirmation
          onRemove();
        },
        confirmText: 'Remove',
        confirmStyle: 'destructive',
      }
    );
  };

  return (
    <Actionsheet isOpen={visible} onClose={onClose}>
      <ActionsheetBackdrop />
      <ActionsheetContent className="px-0 pb-8">
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator />
        </ActionsheetDragIndicatorWrapper>

        {/* Content Wrapper */}
        <View className="w-full py-6">
          {/* Player Info Header */}
          <View className="flex-row items-center gap-3 px-6 mb-6">
            <Avatar
              uri={player.photoURL}
              name={player.displayName}
              size="lg"
            />
            <View className="flex-1">
              <Text className="text-xl font-bold !text-gray-900">
                {player.displayName}
              </Text>
              
              {/* Host Badge */}
              {isHostPlayer && (
                <Text className="text-sm font-medium !text-blue-600 mt-1">
                  Host
                </Text>
              )}
            </View>
          </View>

          <Divider className="mb-4" />

          {/* Action Buttons */}
          <View className="px-2">
            {/* View Profile - Always visible */}
            <Pressable
              onPress={handleViewProfile}
              className="flex-row items-center gap-3 px-4 py-4 rounded-lg active:bg-gray-50"
            >
              <User size={20} color="#1F2937" />
              <Text className="text-base font-medium !text-gray-900">
                View Profile
              </Text>
            </Pressable>

            {/* Remove from Lobby - Host only, not for host player */}
            {isHost && !isHostPlayer && (
              <Pressable
                onPress={handleRemove}
                className="flex-row items-center gap-3 px-4 py-4 mt-2 rounded-lg active:bg-red-50"
              >
                <UserRoundX size={20} color="#DC2626" />
                <Text className="text-base font-medium !text-red-600">
                  Remove from Lobby
                </Text>
              </Pressable>
            )}
          </View>

          <Divider className="my-4" />

          {/* Close Button */}
          <Pressable
            onPress={onClose}
            className="px-4 py-3 active:bg-gray-50"
          >
            <Text className="text-center font-medium !text-gray-600">
              Close
            </Text>
          </Pressable>
        </View>
      </ActionsheetContent>
    </Actionsheet>
  );
});

PlayerActionSheet.displayName = 'PlayerActionSheet';

export type { PlayerActionSheetProps };
