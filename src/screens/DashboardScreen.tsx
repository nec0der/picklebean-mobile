import { memo, useCallback, useState, useMemo } from 'react';
import { View, Text, ScrollView, RefreshControl, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Play, Trophy, TrendingUp } from 'lucide-react-native';
import type { TabScreenProps } from '@/types/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useMatches } from '@/hooks/firestore/useMatches';
import { usePendingGame } from '@/hooks/firestore/usePendingGame';
import { useLeaderboard } from '@/hooks/firestore/useLeaderboard';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/common';
import { PendingGameBanner } from '@/components/common/PendingGameBanner';
import { MatchCard } from '@/components/history/MatchCard';
import { RankingCard } from '@/components/dashboard/RankingCard';
import { CompactStatBar } from '@/components/dashboard/CompactStatBar';

export const DashboardScreen = memo(({ navigation }: TabScreenProps<'Dashboard'>) => {
  const { user, userDocument } = useAuth();
  const { matches, loading, refetch } = useMatches(userDocument?.uid || '', 5);
  const { pendingGame, loading: pendingGameLoading } = usePendingGame();
  const { rankings, loading: leaderboardLoading } = useLeaderboard('mixed_doubles', undefined, 100);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    refetch();
    setTimeout(() => setRefreshing(false), 500);
  }, [refetch]);

  const handleCreateGame = useCallback(() => {
    navigation.navigate('Play');
  }, [navigation]);

  const handleViewAllMatches = useCallback(() => {
    navigation.navigate('History');
  }, [navigation]);

  const handleViewProfile = useCallback(() => {
    navigation.navigate('Profile');
  }, [navigation]);

  // Calculate stats
  const totalMatches = userDocument?.matchStats?.totalMatches || 0;
  const wins = userDocument?.matchStats?.wins || 0;
  const losses = userDocument?.matchStats?.losses || 0;
  const winRate = totalMatches > 0 ? ((wins / totalMatches) * 100).toFixed(0) : '0';

  // Calculate current streak
  const calculateStreak = (): { type: 'win' | 'loss' | null; count: number } => {
    if (matches.length === 0) return { type: null, count: 0 };
    
    const recentResult = matches[0].result;
    let streak = 0;
    
    for (const match of matches) {
      if (match.result === recentResult) {
        streak++;
      } else {
        break;
      }
    }
    
    return { type: recentResult, count: streak };
  };

  const streak = calculateStreak();
  const hasPlayedBefore = totalMatches > 0;

  // Extract first name from displayName
  const getFirstName = (): string => {
    const fullName = user?.displayName || 'there';
    return fullName.split(' ')[0];
  };

  const firstName = getFirstName();

  // Calculate ranking position
  const userRankingPosition = useMemo(() => {
    if (!userDocument?.uid || rankings.length === 0) return null;
    const position = rankings.findIndex((u) => u.uid === userDocument.uid);
    return position >= 0 ? position + 1 : null;
  }, [rankings, userDocument?.uid]);

  // Get user's current points for mixed doubles
  const userPoints = userDocument?.rankings?.mixedDoubles || 1000;

  const handleViewLeaderboard = useCallback(() => {
    navigation.navigate('Leaderboard');
  }, [navigation]);

  // Loading state
  if (loading && !refreshing) {
    return (
      <View className="items-center justify-center flex-1 bg-white">
        <LoadingSpinner />
        <Text className="mt-4 text-gray-600">Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['bottom']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-gray-900">
              {hasPlayedBefore ? `Welcome back, ${firstName}!` : `Hi, ${firstName}! 👋`}
            </Text>
            <Text className="mt-1 text-base text-gray-600">
              {hasPlayedBefore ? user?.displayName : 'Welcome to Picklebean'}
            </Text>
          </View>
          <Pressable onPress={handleViewProfile}>
            <Avatar
              uri={userDocument?.profilePictureUrl || user?.photoURL}
              name={user?.displayName || 'User'}
              size="lg"
            />
          </Pressable>
        </View>

        {/* NEW USER VIEW */}
        {!hasPlayedBefore && (
          <>
            {/* Value Proposition */}
            <Text className="mb-6 text-base leading-relaxed text-center text-gray-600">
              Track your matches, climb the leaderboard, and compete with friends in this pickleball ranking system.
            </Text>

            {/* How It Works */}
            <Card variant="outlined" className="p-6 mb-6">
              <Text className="mb-4 text-lg font-bold text-gray-900">
                How it works
              </Text>
              <View className="space-y-3">
                <View className="flex-row">
                  <View className="items-center justify-center w-8 h-8 mr-3 rounded-full bg-primary-100">
                    <Text className="font-bold text-primary-600">1</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="font-medium text-gray-900">Create or join a game</Text>
                    <Text className="text-sm text-gray-600">Choose singles or doubles</Text>
                  </View>
                </View>
                <View className="flex-row">
                  <View className="items-center justify-center w-8 h-8 mr-3 rounded-full bg-primary-100">
                    <Text className="font-bold text-primary-600">2</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="font-medium text-gray-900">Play your match</Text>
                    <Text className="text-sm text-gray-600">Standard pickleball rules apply</Text>
                  </View>
                </View>
                <View className="flex-row">
                  <View className="items-center justify-center w-8 h-8 mr-3 rounded-full bg-primary-100">
                    <Text className="font-bold text-primary-600">3</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="font-medium text-gray-900">Submit your score</Text>
                    <Text className="text-sm text-gray-600">Earn or lose ranking points</Text>
                  </View>
                </View>
              </View>
            </Card>

            {/* Get Started CTA */}
            <Pressable
              onPress={handleCreateGame}
              className="flex-row items-center justify-center px-6 py-4 bg-green-600 rounded-lg"
            >
              <Play size={20} color="#fff" fill="#fff" />
              <Text className="ml-2 text-base font-semibold text-white">
                Play Your First Game
              </Text>
            </Pressable>
          </>
        )}

        {/* EXISTING USER VIEW */}
        {hasPlayedBefore && (
          <>
            {/* Pending Game Banner */}
            {pendingGame && !pendingGameLoading && (
              <PendingGameBanner pendingGame={pendingGame} />
            )}

            {/* Ranking Card */}
            <RankingCard
              position={userRankingPosition}
              category="mixed_doubles"
              points={userPoints}
              onPress={handleViewLeaderboard}
            />

            {/* Compact Stats */}
            <CompactStatBar
              totalMatches={totalMatches}
              winRate={winRate}
              streak={streak}
            />

            {/* Recent Matches */}
            {matches.length > 0 && (
              <View className="mb-4">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-lg font-bold text-gray-900">
                    Recent Matches
                  </Text>
                  <Pressable onPress={handleViewAllMatches}>
                    <Text className="text-sm font-medium text-primary-600">
                      View All →
                    </Text>
                  </Pressable>
                </View>

                {matches.slice(0, 3).map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </View>
            )}

            {/* Create Game CTA */}
            <Pressable
              onPress={handleCreateGame}
              className="flex-row items-center justify-center px-6 py-4 rounded-lg bg-primary-500 active:bg-primary-600"
            >
              <Play size={20} color="#fff" fill="#fff" />
              <Text className="ml-2 text-base font-semibold text-white">
                Create New Game
              </Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
});

DashboardScreen.displayName = 'DashboardScreen';
