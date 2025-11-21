import { memo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { User, Users, UsersRound, ChevronRight } from 'lucide-react-native';

interface CompactRankingCardProps {
  category: 'singles' | 'same_gender_doubles' | 'mixed_doubles';
  position: number | null;
  points: number;
  gender?: 'male' | 'female';
  onPress?: () => void;
}

export const CompactRankingCard = memo(({
  category,
  position,
  points,
  gender,
  onPress,
}: CompactRankingCardProps) => {
  // Get category label
  const getCategoryLabel = (): string => {
    if (category === 'mixed_doubles') return 'Mixed Doubles';
    if (category === 'singles') {
      if (gender === 'male') return "Men's Singles";
      if (gender === 'female') return "Women's Singles";
      return 'Singles';
    }
    if (gender === 'male') return "Men's Doubles";
    if (gender === 'female') return "Women's Doubles";
    return 'Doubles';
  };

  // Get icon
  const getIcon = () => {
    if (category === 'singles') return User;
    if (category === 'mixed_doubles') return UsersRound;
    return Users;
  };

  const Icon = getIcon();
  const categoryLabel = getCategoryLabel();

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      className="flex-row items-center p-4 mb-3 bg-white border border-gray-200 rounded-xl active:bg-gray-50"
    >
      {/* Icon */}
      <View className="items-center justify-center w-10 h-10 mr-3 bg-green-100 rounded-lg">
        <Icon size={20} color="#16a34a" />
      </View>

      {/* Category and Points */}
      <View className="flex-1">
        <Text className="text-base font-semibold text-gray-900">{categoryLabel}</Text>
        <Text className="mt-0.5 text-sm text-gray-600">{points.toLocaleString()} pts</Text>
      </View>

      {/* Rank Badge */}
      {position ? (
        <View className="items-center justify-center px-3 py-1 mr-2 bg-green-100 rounded-full">
          <Text className="text-sm font-bold text-green-700">#{position}</Text>
        </View>
      ) : (
        <Text className="mr-2 text-sm text-gray-500">Unranked</Text>
      )}

      {/* Arrow */}
      {onPress && <ChevronRight size={20} color="#9ca3af" />}
    </Pressable>
  );
});

CompactRankingCard.displayName = 'CompactRankingCard';

export type { CompactRankingCardProps };
