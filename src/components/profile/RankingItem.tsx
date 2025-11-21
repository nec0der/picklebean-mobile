import { memo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';

interface RankingItemProps {
  category: string;
  position: number | null;
  points: number;
  color: string;
  icon?: LucideIcon;
  onPress?: () => void;
}

export const RankingItem = memo(({ category, position, points, color, icon: Icon, onPress }: RankingItemProps) => {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between p-4 mb-3 bg-white border border-gray-200 rounded-xl active:bg-gray-50"
    >
      <View className="flex-row items-center flex-1">
        {/* Icon or Position Badge */}
        {Icon ? (
          <View className={`w-12 h-12 rounded-full ${color} items-center justify-center mr-3`}>
            <Icon size={24} color="#ffffff" />
          </View>
        ) : position ? (
          <View className={`w-12 h-12 rounded-full ${color} items-center justify-center mr-3`}>
            <Text className="text-sm font-bold text-white">#{position}</Text>
          </View>
        ) : (
          <View className="items-center justify-center w-12 h-12 mr-3 bg-gray-200 rounded-full">
            <Text className="text-xs font-bold text-gray-500">--</Text>
          </View>
        )}

        {/* Category and Points */}
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900">{category}</Text>
          <Text className="text-sm text-gray-500">{points.toLocaleString()} points</Text>
        </View>
      </View>

      {/* Arrow */}
      {onPress && <ChevronRight size={20} color="#9ca3af" />}
    </Pressable>
  );
});

RankingItem.displayName = 'RankingItem';
