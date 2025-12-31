import { memo, useState, useMemo } from 'react';
import { View, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Settings } from 'lucide-react-native';
import type { TabScreenProps, RootStackParamList } from '@/types/navigation';
import type { NavigationProp } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';
import { useLeaderboard } from '@/hooks/firestore/useLeaderboard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ProfileHero } from '@/components/profile/ProfileHero';
import { RankingStatCard } from '@/components/profile/RankingStatCard';
import { ProfileTabBar, type ProfileTab } from '@/components/profile/ProfileTabBar';
import { MatchesTab } from '@/components/profile/MatchesTab';
import { StatisticsTab } from '@/components/profile/StatisticsTab';
import { PostsTab } from '@/components/profile/PostsTab';

export const ProfileScreen = memo((_props: TabScreenProps<'Profile'>) => {
  const rootNavigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { userDocument, firebaseUser, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<ProfileTab>('matches');

  // Get rankings for each category
  const userGender =
    userDocument?.gender === 'male' || userDocument?.gender === 'female'
      ? userDocument.gender
      : undefined;
  const { rankings: singlesRankings } = useLeaderboard('singles', userGender, 100);
  const { rankings: doublesRankings } = useLeaderboard('same_gender_doubles', userGender, 100);

  // Calculate positions
  const singlesPosition = useMemo(() => {
    if (!userDocument?.uid || singlesRankings.length === 0) return null;
    const pos = singlesRankings.findIndex((u) => u.uid === userDocument.uid);
    return pos >= 0 ? pos + 1 : null;
  }, [singlesRankings, userDocument?.uid]);

  const doublesPosition = useMemo(() => {
    if (!userDocument?.uid || doublesRankings.length === 0) return null;
    const pos = doublesRankings.findIndex((u) => u.uid === userDocument.uid);
    return pos >= 0 ? pos + 1 : null;
  }, [doublesRankings, userDocument?.uid]);

  // Calculate win rate for stat cards
  const totalMatches = userDocument?.matchStats?.totalMatches || 0;
  const wins = userDocument?.matchStats?.wins || 0;
  const singlesWinRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;
  const doublesWinRate = singlesWinRate; // For now, same as overall

  // Event handlers
  const handleEditProfile = () => {
    // TODO: Navigate to edit profile screen
    console.log('Edit profile');
  };

  const handleSettings = () => {
    // TODO: Navigate to settings screen
    console.log('Open settings');
  };

  const handleFollowingPress = () => {
    // TODO: Navigate to following/followers screen
    console.log('Open following/followers');
  };

  // Get profile data
  const profilePicture = userDocument?.profilePictureUrl || firebaseUser?.photoURL || null;
  const fullName = userDocument?.displayName || firebaseUser?.displayName || 'User';
  const username = userDocument?.username || 'user';
  const bio = userDocument?.bio;
  const followingCount = userDocument?.followingCount || 0;
  const followersCount = userDocument?.followersCount || 0;

  if (authLoading) {
    return (
      <View className="items-center justify-center flex-1 bg-white">
        <LoadingSpinner size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header with Settings Icon */}
      <View className="flex-row items-center justify-between px-4 pt-12 pb-3 bg-white border-b border-gray-200">
        <View className="w-10" />
        <View />
        <Pressable onPress={handleSettings} className="p-2 active:opacity-70">
          <Settings size={24} color="#6B7280" />
        </Pressable>
      </View>

      <View className="flex-1">
        {/* Hero Section */}
        <ProfileHero
          profilePicture={profilePicture}
          fullName={fullName}
          username={username}
          bio={bio}
          followingCount={followingCount}
          followersCount={followersCount}
          isOwnProfile={true}
          onEditPress={handleEditProfile}
          onFollowingPress={handleFollowingPress}
        />

        {/* Stats Section */}
        <View className="px-4 py-4 space-y-3 bg-gray-50">
          <RankingStatCard
            category="Singles"
            rank={singlesPosition}
            points={userDocument?.rankings?.singles || 1000}
            matchCount={totalMatches}
            winRate={singlesWinRate}
          />

          <RankingStatCard
            category="Doubles"
            rank={doublesPosition}
            points={userDocument?.rankings?.sameGenderDoubles || 1000}
            matchCount={totalMatches}
            winRate={doublesWinRate}
          />
        </View>

        {/* Tab Bar */}
        <ProfileTabBar activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab Content */}
        <View className="flex-1">
          {activeTab === 'matches' && userDocument?.uid && (
            <MatchesTab userId={userDocument.uid} />
          )}
          {activeTab === 'statistics' && userDocument?.uid && (
            <StatisticsTab userId={userDocument.uid} />
          )}
          {activeTab === 'posts' && <PostsTab />}
        </View>
      </View>
    </View>
  );
});

ProfileScreen.displayName = 'ProfileScreen';
