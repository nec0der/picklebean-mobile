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

interface CancelMatchSheetProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export const CancelMatchSheet = memo(({
  visible,
  onClose,
  onConfirm,
}: CancelMatchSheetProps) => {
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
          <Text className="px-4 mb-3 text-xl font-bold text-center !text-gray-900">
            Cancel This Match?
          </Text>
          
          {/* Helper Text */}
          <Text className="px-4 mb-2 text-center !text-gray-600">
            This will end the match immediately.
          </Text>
          <Text className="px-4 mb-6 text-center font-medium !text-gray-600">
            No ratings will be affected.
          </Text>
          
          {/* Buttons */}
          <View className="px-4">
            <Pressable 
              onPress={handleConfirm}
              className="w-full py-4 bg-red-500 rounded-lg active:bg-red-600"
            >
              <Text className="font-bold text-center !text-white">
                Yes, Cancel
              </Text>
            </Pressable>
            
            {/* Secondary Action */}
            <Pressable 
              onPress={onClose}
              className="py-3 mt-3 bg-gray-100 rounded-lg active:bg-gray-200"
            >
              <Text className="font-medium text-center !text-gray-700">
                No, Continue
              </Text>
            </Pressable>
          </View>
        </View>
      </ActionsheetContent>
    </Actionsheet>
  );
});

CancelMatchSheet.displayName = 'CancelMatchSheet';

export type { CancelMatchSheetProps };
