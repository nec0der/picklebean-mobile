import { memo, useMemo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Lock } from 'lucide-react-native';
import type { RootStackScreenProps } from '@/types/navigation';
import { usePublicProfile } from '@/hooks/firestore/usePublicProfile';
import { useLeaderboard } from '@/hooks/firestore/useLeaderboard';
import { useFollow } from '@/hooks/actions/useFollow';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { ProfileHero } from '@/components/profile/ProfileHero';
import { RankingStatCard } from '@/components/profile/RankingStatCard';
import { ProfileTabBar, type ProfileTab } from '@/components/profile/ProfileTabBar';
import { MatchesTab } from '@/components/profile/MatchesTab';
import { StatisticsTab } from '@/components/profile/StatisticsTab';
import { PostsTab } from '@/components/profile/PostsTab';
import { useState } from 'react';

export const UserProfileScreen = memo(
  ({ navigation, route }: RootStackScreenProps<'UserProfile'>) => {
    const { username } = route.params;
    const { user, loading, error, isPrivate, isOwn } = usePublicProfile(username);
    const [activeTab, setActiveTab] = useState<ProfileTab>('matches');
    
    // Follow functionality
    const { isFollowing, loading: followLoading, toggleFollow } = useFollow(user?.uid || '');

    // Get rankings for position calculation
    const userGender =
      user?.gender === 'male' || user?.gender === 'female' ? user.gender : undefined;
    const { rankings: singlesRankings } = useLeaderboard('singles', userGender, 100);
    const { rankings: doublesRankings } = useLeaderboard('same_gender_doubles', userGender, 100);

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

    const handleBack = () => {
      navigation.goBack();
    };

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
    const singlesWinRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;
    const doublesWinRate = singlesWinRate; // For now, same as overall

    // Get profile picture and data
    const profilePicture = user.profilePictureUrl || user.photoURL || null;
    const displayName = user.displayName || 'User';
    const bio = user.bio;
    const followingCount = user.followingCount || 0;
    const followersCount = user.followersCount || 0;

    // Main content
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        {/* Header with back button */}
        <View className="flex-row items-center px-4 py-3 border-b border-gray-200">
          <Pressable onPress={handleBack} className="mr-3">
            <ArrowLeft size={24} color="#000" />
          </Pressable>
          <Text className="!text-2xl font-semibold !text-gray-900">{displayName}</Text>
        </View>

        <View className="flex-1">
          {/* Hero Section with Follow button */}
          <ProfileHero
            profilePicture={profilePicture}
            fullName={displayName}
            username={username}
            bio={bio}
            followingCount={followingCount}
            followersCount={followersCount}
            isOwnProfile={isOwn}
            isFollowing={isFollowing}
            followLoading={followLoading}
            onFollowPress={toggleFollow}
            onFollowingPress={() => {
              // TODO: Navigate to following/followers screen
              console.log('View following/followers');
            }}
          />

          {/* Stats Section - 50/50 side by side */}
          <View className="flex-row gap-3 px-4 py-4 bg-gray-50">
            <View className="flex-1">
              <RankingStatCard
                category="Singles"
                rank={singlesPosition}
                points={user.rankings?.singles || 1000}
                matchCount={totalMatches}
                winRate={singlesWinRate}
              />
            </View>

            <View className="flex-1">
              <RankingStatCard
                category="Doubles"
                rank={doublesPosition}
                points={user.rankings?.sameGenderDoubles || 1000}
                matchCount={totalMatches}
                winRate={doublesWinRate}
              />
            </View>
          </View>

          {/* Tab Bar */}
          <ProfileTabBar activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Tab Content */}
          <View className="flex-1">
            {activeTab === 'matches' && user.uid && <MatchesTab userId={user.uid} />}
            {activeTab === 'statistics' && user.uid && <StatisticsTab userId={user.uid} />}
            {activeTab === 'posts' && <PostsTab />}
          </View>
        </View>
      </SafeAreaView>
    );
  }
);

UserProfileScreen.displayName = 'UserProfileScreen';
