import { memo, useMemo } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Trophy, Flame } from 'lucide-react-native';
import { useMatches } from '@/hooks/firestore/useMatches';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';

interface StatisticsTabProps {
  userId: string;
}

export const StatisticsTab = memo(({ userId }: StatisticsTabProps) => {
  const { matches, loading, error } = useMatches(userId);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalWins = matches.filter(m => m.result === 'win').length;
    const totalLosses = matches.filter(m => m.result === 'loss').length;
    const totalMatches = matches.length;

    const singlesMatches = matches.filter(m => m.gameCategory === 'singles');
    const singlesWins = singlesMatches.filter(m => m.result === 'win').length;
    const singlesLosses = singlesMatches.filter(m => m.result === 'loss').length;
    const singlesWinRate = singlesMatches.length > 0 
      ? Math.round((singlesWins / singlesMatches.length) * 100) 
      : 0;

    const doublesMatches = matches.filter(m => m.gameCategory !== 'singles');
    const doublesWins = doublesMatches.filter(m => m.result === 'win').length;
    const doublesLosses = doublesMatches.filter(m => m.result === 'loss').length;
    const doublesWinRate = doublesMatches.length > 0 
      ? Math.round((doublesWins / doublesMatches.length) * 100) 
      : 0;

    // Calculate current streak
    let currentStreak = 0;
    let streakType: 'win' | 'loss' | null = null;
    
    for (const match of matches) {
      if (streakType === null) {
        streakType = match.result;
        currentStreak = 1;
      } else if (match.result === streakType) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Calculate best win streak
    let bestStreak = 0;
    let tempStreak = 0;
    
    for (const match of matches) {
      if (match.result === 'win') {
        tempStreak++;
        bestStreak = Math.max(bestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    // Recent form (last 10 matches)
    const recentForm = matches.slice(0, 10).map(m => m.result);

    return {
      totalWins,
      totalLosses,
      totalMatches,
      singlesWins,
      singlesLosses,
      singlesTotal: singlesMatches.length,
      singlesWinRate,
      doublesWins,
      doublesLosses,
      doublesTotal: doublesMatches.length,
      doublesWinRate,
      currentStreak,
      streakType,
      bestStreak,
      recentForm,
    };
  }, [matches]);

  if (loading) {
    return (
      <View className="items-center justify-center flex-1 py-12">
        <LoadingSpinner size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="px-4 py-6">
        <ErrorMessage message="Failed to load statistics" />
      </View>
    );
  }

  if (stats.totalMatches === 0) {
    return (
      <View className="items-center justify-center flex-1 px-4 py-12">
        <Text className="mb-2 text-lg font-bold !text-gray-900">
          No statistics yet
        </Text>
        <Text className="text-sm text-center !text-gray-500">
          Play some matches to see your stats!
        </Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 px-4 pt-4 bg-gray-50">
      {/* Overall Record */}
      <View className="p-4 mb-4 bg-white border border-gray-200 rounded-xl">
        <Text className="mb-3 text-base font-semibold !text-gray-900">
          Overall Record
        </Text>
        <Text className="text-sm !text-gray-700">
          <Text className="font-semibold">{stats.totalWins}</Text> Wins • {' '}
          <Text className="font-semibold">{stats.totalLosses}</Text> Losses
        </Text>
      </View>

      {/* By Game Type */}
      <View className="p-4 mb-4 bg-white border border-gray-200 rounded-xl">
        <Text className="mb-3 text-base font-semibold !text-gray-900">
          By Game Type
        </Text>
        
        <View className="mb-3">
          <Text className="mb-1 text-sm font-medium !text-gray-900">
            Singles Performance
          </Text>
          <Text className="text-sm !text-gray-600">
            {stats.singlesWins} Wins • {stats.singlesLosses} Losses
            {stats.singlesTotal > 0 && ` (${stats.singlesWinRate}%)`}
          </Text>
        </View>

        <View>
          <Text className="mb-1 text-sm font-medium !text-gray-900">
            Doubles Performance
          </Text>
          <Text className="text-sm !text-gray-600">
            {stats.doublesWins} Wins • {stats.doublesLosses} Losses
            {stats.doublesTotal > 0 && ` (${stats.doublesWinRate}%)`}
          </Text>
        </View>
      </View>

      {/* Streaks */}
      <View className="p-4 mb-4 bg-white border border-gray-200 rounded-xl">
        <Text className="mb-3 text-base font-semibold !text-gray-900">
          Streaks
        </Text>
        
        {stats.currentStreak > 1 && (
          <View className="flex-row items-center mb-3">
            <View className="items-center justify-center w-10 h-10 mr-3 bg-orange-100 rounded-full">
              <Flame size={20} color="#ea580c" />
            </View>
            <View>
              <Text className="text-sm font-medium !text-gray-900">
                Current Streak
              </Text>
              <Text className="text-sm !text-gray-600">
                {stats.currentStreak} {stats.streakType === 'win' ? 'wins' : 'losses'} in a row
              </Text>
            </View>
          </View>
        )}

        {stats.bestStreak > 0 && (
          <View className="flex-row items-center">
            <View className="items-center justify-center w-10 h-10 mr-3 bg-yellow-100 rounded-full">
              <Trophy size={20} color="#ca8a04" />
            </View>
            <View>
              <Text className="text-sm font-medium !text-gray-900">
                Best Streak
              </Text>
              <Text className="text-sm !text-gray-600">
                {stats.bestStreak} wins
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Recent Form */}
      {stats.recentForm.length > 0 && (
        <View className="p-4 mb-4 bg-white border border-gray-200 rounded-xl">
          <Text className="mb-3 text-base font-semibold !text-gray-900">
            Recent Form (Last {stats.recentForm.length})
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {stats.recentForm.map((result, index) => (
              <View
                key={index}
                className={`w-8 h-8 rounded-full items-center justify-center ${
                  result === 'win' ? 'bg-green-100' : 'bg-gray-200'
                }`}
              >
                <Text className="text-lg">
                  {result === 'win' ? '🏆' : '⚪'}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
});

StatisticsTab.displayName = 'StatisticsTab';
