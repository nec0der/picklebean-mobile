import { memo } from 'react';
import { View, Text, Pressable } from 'react-native';

interface RankingStatCardProps {
  category: 'Singles' | 'Doubles';
  rank: number | null;
  points: number;
  matchCount: number;
  winRate: number;
  onPress?: () => void;
}

export const RankingStatCard = memo(({
  category,
  rank,
  points,
  matchCount,
  winRate,
  onPress,
}: RankingStatCardProps) => {
  const rankDisplay = rank ? `#${rank}` : 'Unranked';
  
  // Use different border colors for singles vs doubles
  const bgColor = category === 'Singles' ? 'bg-gray-50' : 'bg-green-50';

  const Container = onPress ? Pressable : View;
  const containerProps = onPress ? { onPress, className: 'active:opacity-70' } : {};

  return (
    <Container {...containerProps}>
      <View className={`p-4 rounded-lg ${bgColor}`}>
        {/* Small uppercase label */}
        <Text className="mb-1 text-xs font-semibold text-gray-500 uppercase">
          {category}
        </Text>
        
        {/* Big bold rank */}
        <Text className="text-2xl font-bold text-gray-900">
          {rankDisplay}
        </Text>
        
        {/* Meta info */}
        <Text className="mt-1 text-xs text-gray-600">
          {points.toLocaleString()} pts • {winRate}% win
        </Text>
      </View>
    </Container>
  );
});

RankingStatCard.displayName = 'RankingStatCard';
