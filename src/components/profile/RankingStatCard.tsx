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
  // Generate encouraging subtitle based on user's progress
  const getSubtitle = (): string => {
    if (matchCount === 0) {
      return 'Play your first match to rank up!';
    }
    
    if (matchCount < 10) {
      return `${matchCount} ${matchCount === 1 ? 'match' : 'matches'} • Keep playing!`;
    }
    
    if (winRate < 40) {
      return `${matchCount} matches • Every match counts!`;
    }
    
    return `${matchCount} matches • ${winRate}% win rate`;
  };

  const rankDisplay = rank ? `#${rank}` : 'Unranked';
  const subtitle = getSubtitle();

  const Container = onPress ? Pressable : View;
  const containerProps = onPress ? { onPress, className: 'active:opacity-70' } : {};

  return (
    <Container {...containerProps}>
      <View className="p-4 bg-white border border-gray-200 rounded-xl">
        <Text className="mb-2 text-sm font-semibold !text-gray-900">
          {category}
        </Text>
        
        <Text className="mb-1 text-base font-bold !text-gray-900">
          {rankDisplay} • {points.toLocaleString()} points
        </Text>
        
        <Text className="text-xs !text-gray-500">
          {subtitle}
        </Text>
      </View>
    </Container>
  );
});

RankingStatCard.displayName = 'RankingStatCard';
