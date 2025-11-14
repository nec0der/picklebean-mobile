import { memo } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';

export interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  message?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner = memo(({
  size = 'large',
  color = '#3b82f6',
  message,
  fullScreen = false,
}: LoadingSpinnerProps) => {
  const content = (
    <>
      <ActivityIndicator size={size} color={color} />
      {message && (
        <Text className="mt-4 text-base text-secondary-600">
          {message}
        </Text>
      )}
    </>
  );

  if (fullScreen) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        {content}
      </View>
    );
  }

  return (
    <View className="justify-center items-center py-8">
      {content}
    </View>
  );
});

LoadingSpinner.displayName = 'LoadingSpinner';
