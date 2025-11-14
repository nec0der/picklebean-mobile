import { memo } from 'react';
import { View, Text, Pressable } from 'react-native';

export interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  variant?: 'inline' | 'card' | 'fullScreen';
}

export const ErrorMessage = memo(({
  title = 'Error',
  message,
  onRetry,
  onDismiss,
  variant = 'card',
}: ErrorMessageProps) => {
  const content = (
    <>
      <Text className="text-lg font-bold text-red-800 mb-2">
        {title}
      </Text>
      <Text className="text-base text-red-700 mb-4">
        {message}
      </Text>

      {(onRetry || onDismiss) && (
        <View className="flex-row gap-2">
          {onRetry && (
            <Pressable
              onPress={onRetry}
              className="flex-1 bg-red-600 py-2.5 rounded-lg active:bg-red-700"
            >
              <Text className="text-white text-center font-semibold">
                Try Again
              </Text>
            </Pressable>
          )}
          {onDismiss && (
            <Pressable
              onPress={onDismiss}
              className="flex-1 bg-secondary-200 py-2.5 rounded-lg active:bg-secondary-300"
            >
              <Text className="text-secondary-800 text-center font-semibold">
                Dismiss
              </Text>
            </Pressable>
          )}
        </View>
      )}
    </>
  );

  if (variant === 'fullScreen') {
    return (
      <View className="flex-1 justify-center items-center bg-white px-6">
        <View className="w-full max-w-md">
          {content}
        </View>
      </View>
    );
  }

  if (variant === 'inline') {
    return (
      <View className="py-3">
        {content}
      </View>
    );
  }

  return (
    <View className="p-4 bg-red-50 border border-red-200 rounded-lg">
      {content}
    </View>
  );
});

ErrorMessage.displayName = 'ErrorMessage';
