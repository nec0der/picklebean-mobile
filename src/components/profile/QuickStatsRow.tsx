import { memo } from 'react';
import { View, Text } from 'react-native';
import { Trophy, TrendingUp, Flame } from 'lucide-react-native';

interface QuickStatsRowProps {
  totalMatches: number;
  winRate: string;
  streak: {
    type: 'win' | 'loss' | null;
    count: number;
  };
}

export const QuickStatsRow = memo(({ totalMatches, winRate, streak }: QuickStatsRowProps) => {
  const streakIcon = streak.type === 'win' ? '🔥' : streak.type === 'loss' ? '💔' : '➖';
  const streakColor = streak.type === 'win' ? 'text-orange-600' : 'text-red-600';

  return (
    <View className="flex-row px-4 py-4 -mt-8 bg-white shadow-lg rounded-t-3xl">
      {/* Total Matches */}
      <View className="items-center flex-1">
        <View className="items-center justify-center w-12 h-12 mb-2 rounded-full bg-amber-100">
          <Trophy size={24} color="#d97706" />
        </View>
        <Text className="text-2xl font-bold text-gray-900">{totalMatches}</Text>
        <Text className="text-xs text-gray-500">Matches</Text>
      </View>

      {/* Divider */}
      <View className="w-px mx-2 bg-gray-200" />

      {/* Win Rate */}
      <View className="items-center flex-1">
        <View className="items-center justify-center w-12 h-12 mb-2 bg-green-100 rounded-full">
          <TrendingUp size={24} color="#16a34a" />
        </View>
        <Text className="text-2xl font-bold text-gray-900">{winRate}%</Text>
        <Text className="text-xs text-gray-500">Win Rate</Text>
      </View>

      {/* Divider */}
      <View className="w-px mx-2 bg-gray-200" />

      {/* Streak */}
      <View className="items-center flex-1">
        <Text className="mb-2 text-4xl">{streakIcon}</Text>
        <Text className={`text-2xl font-bold ${streakColor}`}>{streak.count}</Text>
        <Text className="text-xs text-gray-500">
          {streak.type === 'win' ? 'Win' : streak.type === 'loss' ? 'Loss' : 'No'} Streak
        </Text>
      </View>
    </View>
  );
});

QuickStatsRow.displayName = 'QuickStatsRow';
