import { memo, useContext } from 'react';
import { View, Text, Pressable } from 'react-native';
import { AlertCircle, Info, CheckCircle } from 'lucide-react-native';
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicatorWrapper,
  ActionsheetDragIndicator,
} from '@gluestack-ui/themed';
import { AlertContext } from '@/contexts/AlertContext';

export const AlertSheet = memo(() => {
  const context = useContext(AlertContext);

  if (!context) {
    throw new Error('AlertSheet must be used within AlertProvider');
  }

  const { isVisible, config, hideAlert } = context;

  if (!config) return null;

  const { title, message, buttons, type } = config;

  // Determine icon and colors based on type
  const isDestructive = type === 'destructive';
  const iconColor = isDestructive ? '#EF4444' : '#3B82F6';
  const iconBgColor = isDestructive ? 'bg-red-100' : 'bg-blue-100';
  const Icon = isDestructive ? AlertCircle : Info;

  return (
    <Actionsheet isOpen={isVisible} onClose={hideAlert}>
      <ActionsheetBackdrop />
      <ActionsheetContent className="px-0 pb-8">
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator />
        </ActionsheetDragIndicatorWrapper>

        <View className="w-full py-6">
          {/* Icon */}
          <View className="items-center mb-4">
            <View className={`items-center justify-center w-16 h-16 ${iconBgColor} rounded-full`}>
              <Icon size={32} color={iconColor} />
            </View>
          </View>

          {/* Title */}
          <Text className="px-4 mb-4 text-xl font-bold text-center !text-gray-900">
            {title}
          </Text>

          {/* Message */}
          {message && (
            <Text className="px-4 mb-8 text-center !text-gray-600">
              {message}
            </Text>
          )}

          {/* Buttons */}
          {buttons && buttons.length > 0 && (
            <View className={`px-4 ${buttons.length === 2 ? 'flex-row gap-3' : ''}`}>
              {buttons.map((button, index) => {
                const isDestructiveButton = button.style === 'destructive';
                const isCancelButton = button.style === 'cancel';
                const isPrimaryButton = !isCancelButton && !isDestructiveButton;

                const buttonClassName = isCancelButton
                  ? 'flex-1 py-4 bg-gray-100 rounded-lg active:bg-gray-200'
                  : isDestructiveButton
                  ? 'flex-1 py-4 bg-red-500 rounded-lg active:bg-red-600'
                  : buttons.length === 1
                  ? 'py-4 bg-blue-500 rounded-lg active:bg-blue-600'
                  : 'flex-1 py-4 bg-blue-500 rounded-lg active:bg-blue-600';

                const textClassName = isCancelButton
                  ? 'font-medium text-center !text-gray-700'
                  : 'font-bold text-center !text-white';

                return (
                  <Pressable
                    key={index}
                    onPress={button.onPress}
                    className={buttonClassName}
                  >
                    <Text className={textClassName}>{button.text}</Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>
      </ActionsheetContent>
    </Actionsheet>
  );
});

AlertSheet.displayName = 'AlertSheet';
