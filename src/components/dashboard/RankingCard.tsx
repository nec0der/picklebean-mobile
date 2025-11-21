import { memo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Trophy, TrendingUp, TrendingDown } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';

interface RankingCardProps {
  position: number | null;
  category: 'singles' | 'same_gender_doubles' | 'mixed_doubles';
  points: number;
  movement?: number; // Positive = moved up, negative = moved down
  onPress?: () => void;
}

export const RankingCard = memo(({
  position,
  category,
  points,
  movement,
  onPress,
}: RankingCardProps) => {
  const categoryLabel = 
    category === 'singles' 
      ? 'Singles' 
      : category === 'same_gender_doubles'
      ? 'Same Gender Doubles'
      : 'Mixed Doubles';
  const hasRanking = position !== null;

  return (
    <Pressable onPress={onPress} disabled={!onPress}>
      <Card variant="outlined" className="p-4 mb-4 bg-gradient-to-r from-primary-50 to-blue-50">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            {hasRanking ? (
              <>
                <View className="flex-row items-center mb-1">
                  <Trophy size={20} color="#3b82f6" />
                  <Text className="ml-2 text-3xl font-bold text-gray-900">
                    #{position}
                  </Text>
                  {movement !== undefined && movement !== 0 && (
                    <View className="flex-row items-center ml-2">
                      {movement > 0 ? (
                        <TrendingUp size={16} color="#10b981" />
                      ) : (
                        <TrendingDown size={16} color="#ef4444" />
                      )}
                      <Text
                        className={`ml-1 text-sm font-medium ${
                          movement > 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {Math.abs(movement)}
                      </Text>
                    </View>
                  )}
                </View>
                <Text className="text-sm text-gray-600">
                  in {categoryLabel}
                </Text>
              </>
            ) : (
              <>
                <Text className="mb-1 text-xl font-bold text-gray-900">
                  Unranked
                </Text>
                <Text className="text-sm text-gray-600">
                  Play 3 matches to get ranked
                </Text>
              </>
            )}
          </View>

          <View className="items-end">
            <Text className="text-2xl font-bold text-primary-600">
              {points}
            </Text>
            <Text className="text-xs text-gray-500">points</Text>
          </View>
        </View>
      </Card>
    </Pressable>
  );
});

RankingCard.displayName = 'RankingCard';
