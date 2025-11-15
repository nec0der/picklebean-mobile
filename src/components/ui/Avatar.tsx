import { memo } from 'react';
import { View, Image, Text } from 'react-native';

interface AvatarProps {
  uri?: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24',
};

const textSizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-lg',
  xl: 'text-2xl',
};

export const Avatar = memo(({ uri, name, size = 'md' }: AvatarProps) => {
  const getInitials = (fullName: string): string => {
    const names = fullName.trim().split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return fullName.substring(0, 2).toUpperCase();
  };

  const initials = getInitials(name);

  return (
    <View className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gray-200 items-center justify-center border-2 border-gray-300`}>
      {uri ? (
        <Image
          source={{ uri }}
          className="w-full h-full"
          resizeMode="cover"
        />
      ) : (
        <Text className={`${textSizeClasses[size]} font-semibold text-gray-600`}>
          {initials}
        </Text>
      )}
    </View>
  );
});

Avatar.displayName = 'Avatar';
