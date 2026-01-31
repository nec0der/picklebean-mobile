import { memo, useMemo } from 'react';
import { View, Image, Text } from 'react-native';

/**
 * Color palette for avatar backgrounds
 * Each color has a background (bg) and text color pair
 */
const AVATAR_COLORS = [
  { bg: 'bg-blue-100', text: 'text-blue-600' },
  { bg: 'bg-green-100', text: 'text-green-600' },
  { bg: 'bg-purple-100', text: 'text-purple-600' },
  { bg: 'bg-pink-100', text: 'text-pink-600' },
  { bg: 'bg-orange-100', text: 'text-orange-600' },
  { bg: 'bg-teal-100', text: 'text-teal-600' },
  { bg: 'bg-indigo-100', text: 'text-indigo-600' },
  { bg: 'bg-rose-100', text: 'text-rose-600' },
  { bg: 'bg-cyan-100', text: 'text-cyan-600' },
  { bg: 'bg-amber-100', text: 'text-amber-600' },
] as const;

interface AvatarProps {
  uri?: string | null;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const sizeClasses: Record<string, string> = {
  xs: 'w-10 h-10',    // 40px - chat header
  sm: 'w-12 h-12',    // 48px - chat list items
  md: 'w-14 h-14',    // 56px - larger list items
  lg: 'w-16 h-16',    // 64px
  xl: 'w-24 h-24',    // 96px - profile hero
  '2xl': 'w-32 h-32', // 128px - large profile
};

const textSizeClasses: Record<string, string> = {
  xs: 'text-lg',      // 40px avatar
  sm: 'text-xl',      // 48px avatar
  md: 'text-2xl',     // 56px avatar
  lg: 'text-2xl',     // 64px avatar
  xl: 'text-4xl',     // 96px avatar
  '2xl': 'text-5xl',  // 128px avatar
};

/**
 * Generate a consistent color based on the name
 * Same name always produces the same color
 */
const getColorFromName = (name: string): typeof AVATAR_COLORS[number] => {
  const hash = name
    .toLowerCase()
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

/**
 * Get initials from a name
 * - "John Doe" -> "JD"
 * - "John" -> "JO"
 */
const getInitials = (fullName: string): string => {
  const trimmed = fullName.trim();
  if (!trimmed) return '?';
  
  const names = trimmed.split(' ').filter(Boolean);
  if (names.length >= 2) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  }
  return trimmed.substring(0, 2).toUpperCase();
};

/**
 * Avatar component with name-based consistent colors
 * 
 * - When uri is provided, shows the image
 * - When no uri, shows initials with a color derived from the name
 * - Same name always produces the same color across the app
 * 
 * @example
 * <Avatar uri={user.photoURL} name={user.displayName} size="md" />
 */
export const Avatar = memo(({ uri, name, size = 'md' }: AvatarProps) => {
  const initials = useMemo(() => getInitials(name), [name]);
  const colors = useMemo(() => getColorFromName(name), [name]);

  return (
    <View 
      className={`${sizeClasses[size]} rounded-full overflow-hidden items-center justify-center ${
        uri ? 'bg-gray-200' : colors.bg
      }`}
    >
      {uri ? (
        <Image
          source={{ uri }}
          className="w-full h-full"
          resizeMode="cover"
        />
      ) : (
        <Text className={`${textSizeClasses[size]} font-semibold ${colors.text}`}>
          {initials}
        </Text>
      )}
    </View>
  );
});

Avatar.displayName = 'Avatar';
