import { memo, useMemo } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Lock, User, Users, UsersRound } from 'lucide-react-native';
import type { RootStackScreenProps } from '@/types/navigation';
import { usePublicProfile } from '@/hooks/firestore/usePublicProfile';
import { useLeaderboard } from '@/hooks/firestore/useLeaderboard';
import { useMatches } from '@/hooks/firestore/useMatches';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { ProfileHeroSection } from '@/components/profile/ProfileHeroSection';
import { RankingItem } from '@/components/profile/RankingItem';
import { MatchCard } from '@/components/history/MatchCard';

export const UserProfileScreen = memo(
  ({ navigation, route }: RootStackScreenProps<'UserProfile'>) => {
    const { userId } = route.params;
    const { user, loading, error, isPrivate, isOwn } = usePublicProfile(userId);

    // Get rankings for position calculation
    const userGender =
      user?.gender === 'male' || user?.gender === 'female' ? user.gender : undefined;
    const { rankings: singlesRankings } = useLeaderboard('singles', userGender, 100);
    const { rankings: doublesRankings } = useLeaderboard('same_gender_doubles', userGender, 100);
    const { rankings: mixedRankings } = useLeaderboard('mixed_doubles', undefined, 100);

    // Get recent matches
    const { matches, loading: matchesLoading } = useMatches(userId, 5);

    // Calculate positions
    const singlesPosition = useMemo(() => {
      if (!user?.uid || singlesRankings.length === 0) return null;
      const pos = singlesRankings.findIndex((u) => u.uid === user.uid);
      return pos >= 0 ? pos + 1 : null;
    }, [singlesRankings, user?.uid]);

    const doublesPosition = useMemo(() => {
      if (!user?.uid || doublesRankings.length === 0) return null;
      const pos = doublesRankings.findIndex((u) => u.uid === user.uid);
      return pos >= 0 ? pos + 1 : null;
    }, [doublesRankings, user?.uid]);

    const mixedPosition = useMemo(() => {
      if (!user?.uid || mixedRankings.length === 0) return null;
      const pos = mixedRankings.findIndex((u) => u.uid === user.uid);
      return pos >= 0 ? pos + 1 : null;
    }, [mixedRankings, user?.uid]);

    const handleBack = () => {
      navigation.goBack();
    };

    // Get category labels based on gender
    const getCategoryLabels = () => {
      const gender = user?.gender;
      if (gender === 'male') {
        return {
          singles: "Men's Singles",
          doubles: "Men's Doubles",
          mixed: 'Mixed Doubles',
        };
      } else if (gender === 'female') {
        return {
          singles: "Women's Singles",
          doubles: "Women's Doubles",
          mixed: 'Mixed Doubles',
        };
      }
      return {
        singles: 'Singles',
        doubles: 'Same Gender Doubles',
        mixed: 'Mixed Doubles',
      };
    };

    const categoryLabels = getCategoryLabels();

    // Loading state
    if (loading) {
      return (
        <View className="items-center justify-center flex-1 bg-white">
          <LoadingSpinner size="large" />
        </View>
      );
    }

    // Error state
    if (error) {
      return (
        <View className="flex-1 bg-white">
          <View className="flex-row items-center px-4 py-3 border-b border-gray-200">
            <Pressable onPress={handleBack} className="mr-3">
              <ArrowLeft size={24} color="#000" />
            </Pressable>
            <Text className="text-lg font-semibold !text-gray-900">Profile</Text>
          </View>
          <View className="items-center justify-center flex-1 px-4">
            <ErrorMessage
              message={error.message || 'Failed to load profile'}
              onRetry={handleBack}
            />
          </View>
        </View>
      );
    }

    // Private profile state (and not the owner)
    if (isPrivate && !isOwn && !user) {
      return (
        <View className="flex-1 bg-white">
          <View className="flex-row items-center px-4 py-3 border-b border-gray-200">
            <Pressable onPress={handleBack} className="mr-3">
              <ArrowLeft size={24} color="#000" />
            </Pressable>
            <Text className="text-lg font-semibold !text-gray-900">Profile</Text>
          </View>
          <View className="items-center justify-center flex-1 px-4">
            <Lock size={64} color="#9CA3AF" className="mb-4" />
            <Text className="mb-2 text-xl font-bold text-center text-gray-900">
              This Profile is Private
            </Text>
            <Text className="text-center text-gray-600">
              This user has chosen to keep their profile private.
            </Text>
          </View>
        </View>
      );
    }

    // Not found state
    if (!user) {
      return (
        <View className="flex-1 bg-white">
          <View className="flex-row items-center px-4 py-3 border-b border-gray-200">
            <Pressable onPress={handleBack} className="mr-3">
              <ArrowLeft size={24} color="#000" />
            </Pressable>
            <Text className="text-lg font-semibold !text-gray-900">Profile</Text>
          </View>
          <View className="items-center justify-center flex-1 px-4">
            <Text className="mb-2 text-xl font-bold text-center text-gray-900">
              User Not Found
            </Text>
            <Text className="text-center text-gray-600">
              This user profile does not exist.
            </Text>
          </View>
        </View>
      );
    }

    // Calculate stats
    const totalMatches = user.matchStats?.totalMatches || 0;
    const wins = user.matchStats?.wins || 0;
    const winRate = totalMatches > 0 ? ((wins / totalMatches) * 100).toFixed(0) : '0';

    // Get profile picture
    const profilePicture = user.profilePictureUrl || user.photoURL || null;
    const displayName = user.displayName || 'User';

    // Main content
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        {/* Header with back button */}
        <View className="flex-row items-center px-4 py-3 border-b border-gray-200">
          <Pressable onPress={handleBack} className="mr-3">
            <ArrowLeft size={24} color="#000" />
          </Pressable>
          <Text className="text-lg font-semibold !text-gray-900">Profile</Text>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Hero Section - no edit button for public profiles */}
          <ProfileHeroSection
            profilePicture={profilePicture}
            fullName={displayName}
            onEditPress={undefined}
          />

          <View className="px-4">
            {/* Minimalistic Stats */}
            <Text className="mt-6 mb-6 text-sm text-center text-gray-600">
              {totalMatches} matches • {winRate}% win rate
            </Text>

            {/* Rankings Section */}
            <View className="mb-6">
              <Text className="mb-3 text-lg font-bold text-gray-900">Rankings</Text>

              <RankingItem
                category={categoryLabels.singles}
                position={singlesPosition}
                points={user.rankings?.singles || 1000}
                color="bg-blue-500"
                icon={User}
              />

              <RankingItem
                category={categoryLabels.doubles}
                position={doublesPosition}
                points={user.rankings?.sameGenderDoubles || 1000}
                color="bg-green-500"
                icon={Users}
              />

              <RankingItem
                category={categoryLabels.mixed}
                position={mixedPosition}
                points={user.rankings?.mixedDoubles || 1000}
                color="bg-purple-500"
                icon={UsersRound}
              />
            </View>

            {/* Recent Matches Section */}
            {matches.length > 0 && (
              <View className="mb-8">
                <Text className="mb-3 text-lg font-bold text-gray-900">Recent Matches</Text>
                <View className="space-y-3">
                  {matches.map((match) => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                </View>
              </View>
            )}

            {matchesLoading && (
              <View className="items-center py-4">
                <LoadingSpinner />
              </View>
            )}

            {!matchesLoading && matches.length === 0 && (
              <View className="py-8">
                <Text className="text-center text-gray-500">No matches yet</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
);

UserProfileScreen.displayName = 'UserProfileScreen';
