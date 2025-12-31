import { memo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicatorWrapper,
  ActionsheetDragIndicator,
} from '@gluestack-ui/themed';

interface CloseLobbySheetProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export const CloseLobbySheet = memo(({
  visible,
  onClose,
  onConfirm,
}: CloseLobbySheetProps) => {
  const handleConfirm = async (): Promise<void> => {
    onClose();
    await onConfirm();
  };

  return (
    <Actionsheet isOpen={visible} onClose={onClose}>
      <ActionsheetBackdrop />
      <ActionsheetContent className="px-0 pb-8">
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator />
        </ActionsheetDragIndicatorWrapper>
        
        <View className="w-full py-6">
          {/* Icon */}
          <View className="items-center mb-4">
            <View className="items-center justify-center w-16 h-16 bg-red-100 rounded-full">
              <AlertCircle size={32} color="#EF4444" />
            </View>
          </View>
          
          {/* Title */}
          <Text className="px-4 mb-6 text-xl font-bold text-center !text-gray-900">
            Close This Lobby?
          </Text>
          
          {/* Helper Text */}
          <Text className="px-4 mb-2 text-center !text-gray-600">
            This will end the lobby immediately.
          </Text>
          <Text className="px-4 mb-8 text-center font-medium !text-gray-600">
            All players will be removed.
          </Text>
          
          {/* Buttons */}
          <View className="flex-row gap-3 px-4">
            {/* Secondary Action */}
            <Pressable 
              onPress={onClose}
              className="flex-1 py-4 bg-gray-100 rounded-lg active:bg-gray-200"
            >
              <Text className="font-medium text-center !text-gray-700">
                No, Keep Open
              </Text>
            </Pressable>
            
            <Pressable 
              onPress={handleConfirm}
              className="flex-1 py-4 bg-red-500 rounded-lg active:bg-red-600"
            >
              <Text className="font-bold text-center !text-white">
                Yes, Close
              </Text>
            </Pressable>
          </View>
        </View>
      </ActionsheetContent>
    </Actionsheet>
  );
});

CloseLobbySheet.displayName = 'CloseLobbySheet';

export type { CloseLobbySheetProps };
