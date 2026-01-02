import { memo, useMemo } from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Lock } from 'lucide-react-native';
import type { RootStackScreenProps } from '@/types/navigation';
import { usePublicProfile } from '@/hooks/firestore/usePublicProfile';
import { useLeaderboard } from '@/hooks/firestore/useLeaderboard';
import { useFollow } from '@/hooks/actions/useFollow';
import { LoadingSpinner, ErrorMessage, ScreenHeader } from '@/components/common';
import { ProfileHero } from '@/components/profile/ProfileHero';
import { RankingStatCard } from '@/components/profile/RankingStatCard';
import { MatchesTab } from '@/components/profile/MatchesTab';

export const UserProfileScreen = memo(
  ({ navigation, route }: RootStackScreenProps<'UserProfile'>) => {
    const { username } = route.params;
    const { user, loading, error, isPrivate, isOwn } = usePublicProfile(username);
    
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

    const handleFollowingPress = () => {
      if (user?.uid) {
        navigation.navigate('FollowList', {
          userId: user.uid,
          initialTab: 'following',
        });
      }
    };

    const handleFollowersPress = () => {
      if (user?.uid) {
        navigation.navigate('FollowList', {
          userId: user.uid,
          initialTab: 'followers',
        });
      }
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
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
          <ScreenHeader title="Profile" onLeftPress={handleBack} />
          <View className="items-center justify-center flex-1 px-4">
            <ErrorMessage
              message={error.message || 'Failed to load profile'}
              onRetry={handleBack}
            />
          </View>
        </SafeAreaView>
      );
    }

    // Private profile state (and not the owner)
    if (isPrivate && !isOwn && !user) {
      return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
          <ScreenHeader title="Profile" onLeftPress={handleBack} />
          <View className="items-center justify-center flex-1 px-4">
            <Lock size={64} color="#9CA3AF" className="mb-4" />
            <Text className="mb-2 text-xl font-bold text-center text-gray-900">
              This Profile is Private
            </Text>
            <Text className="text-center text-gray-600">
              This user has chosen to keep their profile private.
            </Text>
          </View>
        </SafeAreaView>
      );
    }

    // Not found state
    if (!user) {
      return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
          <ScreenHeader title="Profile" onLeftPress={handleBack} />
          <View className="items-center justify-center flex-1 px-4">
            <Text className="mb-2 text-xl font-bold text-center text-gray-900">
              User Not Found
            </Text>
            <Text className="text-center text-gray-600">
              This user profile does not exist.
            </Text>
          </View>
        </SafeAreaView>
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

    // Prepare header content for MatchesTab
    const renderHeader = () => (
      <>
        {/* Hero Section with Follow button */}
        <View className="px-4 py-6 bg-white">
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
            onFollowingPress={handleFollowingPress}
            onFollowersPress={handleFollowersPress}
          />
        </View>

        {/* Section Divider */}
        {/* <View className="border-t-2 border-gray-300" /> */}

        {/* Rankings Section */}
        <View className="px-4 py-2 bg-white">
          <Text className="mb-3 text-lg font-bold text-gray-900">
            Rankings
          </Text>
          
          <View className="flex-row gap-2">
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
        </View>

        {/* Section Divider */}
        {/* <View className="border-t-2 border-gray-300" /> */}
      </>
    );

    // Main content
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <ScreenHeader 
          title={displayName}
          titleClassName="!text-2xl"
          onLeftPress={handleBack}
        />

        {/* Match Feed with Header - Instagram Style */}
        <MatchesTab 
          userId={user.uid} 
          header={renderHeader()} 
          onViewAllHistory={() => navigation.goBack()}
        />
      </SafeAreaView>
    );
  }
);

UserProfileScreen.displayName = 'UserProfileScreen';
