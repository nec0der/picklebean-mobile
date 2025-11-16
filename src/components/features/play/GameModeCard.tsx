import { memo } from 'react';
import { Pressable } from 'react-native';
import { View, Text } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';

interface GameModeCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  subtitle?: string;
  selected: boolean;
  onPress: () => void;
}

export const GameModeCard = memo(({
  icon: Icon,
  title,
  description,
  subtitle,
  selected,
  onPress,
}: GameModeCardProps) => {
  return (
    <Pressable
      onPress={onPress}
      className={`p-4 rounded-lg border-2 transition-all ${
        selected
          ? 'bg-green-50 border-green-500'
          : 'bg-white border-gray-300'
      }`}
    >
      <View className="flex-row items-center">
        <View
          className={`w-12 h-12 rounded-full justify-center items-center mr-3 ${
            selected ? 'bg-green-100' : 'bg-gray-100'
          }`}
        >
          <Icon
            size={24}
            color={selected ? '#22c55e' : '#6b7280'}
          />
        </View>
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-900">
            {title}
          </Text>
          <Text className="text-sm text-gray-600">{description}</Text>
          {subtitle && (
            <Text className="text-xs text-gray-500 mt-1">{subtitle}</Text>
          )}
        </View>
      </View>
    </Pressable>
  );
});

GameModeCard.displayName = 'GameModeCard';
