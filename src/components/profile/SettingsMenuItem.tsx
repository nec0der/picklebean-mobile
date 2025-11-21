import { memo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { ChevronRight, LucideIcon } from 'lucide-react-native';

interface SettingsMenuItemProps {
  icon: LucideIcon;
  title: string;
  onPress: () => void;
  destructive?: boolean;
}

export const SettingsMenuItem = memo(({
  icon: Icon,
  title,
  onPress,
  destructive = false,
}: SettingsMenuItemProps) => {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between px-4 py-4 border-b border-gray-100 active:bg-gray-50"
    >
      <View className="flex-row items-center flex-1">
        <Icon size={20} color={destructive ? '#ef4444' : '#6b7280'} />
        <Text className={`ml-3 text-base ${destructive ? 'text-red-600 font-semibold' : 'text-gray-900'}`}>
          {title}
        </Text>
      </View>
      {!destructive && <ChevronRight size={20} color="#9ca3af" />}
    </Pressable>
  );
});

SettingsMenuItem.displayName = 'SettingsMenuItem';
