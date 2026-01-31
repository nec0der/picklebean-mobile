/**
 * Settings Prompt Sheet
 * AllTrails-style modal for users who declined location
 * Shows option to open iOS Settings or continue with map
 */

import { memo } from 'react';
import { View, Text, Pressable, Modal } from 'react-native';

interface SettingsPromptSheetProps {
  visible: boolean;
  onChangeSettings: () => void;  // Opens iOS Settings
  onMaybeLater: () => void;       // Dismiss and continue with map
}

export const SettingsPromptSheet = memo(({
  visible,
  onChangeSettings,
  onMaybeLater,
}: SettingsPromptSheetProps) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
    >
      <View className="justify-center flex-1 px-6 bg-black/60">
        <View className="p-6 bg-[#2d3a3a] rounded-3xl">
          {/* Title */}
          <Text className="mb-3 text-2xl font-bold text-center text-white">
            Share your location
          </Text>

          {/* Description */}
          <Text className="mb-6 text-base leading-relaxed text-center text-gray-200">
            To show you courts nearby, we'll need to know where you are.
          </Text>

          {/* Primary button - Change settings */}
          <Pressable
            onPress={onChangeSettings}
            className="py-4 mb-3 bg-white rounded-xl active:bg-gray-100"
          >
            <Text className="text-lg font-semibold text-center text-gray-900">
              Change settings
            </Text>
          </Pressable>

          {/* Secondary button - Maybe later */}
          <Pressable
            onPress={onMaybeLater}
            className="py-3"
          >
            <Text className="text-base text-center text-white">
              Maybe later
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
});

SettingsPromptSheet.displayName = 'SettingsPromptSheet';
