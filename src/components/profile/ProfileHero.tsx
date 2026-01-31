import { memo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';

interface ProfileHeroProps {
  profilePicture: string | null;
  fullName: string;
  username: string;
  bio?: string;
  followingCount?: number;
  followersCount?: number;
  isOwnProfile: boolean;
  isFollowing?: boolean;
  followLoading?: boolean;
  onEditPress?: () => void;
  onChallengePress?: () => void;
  onFollowPress?: () => void;
  onFollowingPress?: () => void;
  onFollowersPress?: () => void;
}

export const ProfileHero = memo(({
  profilePicture,
  fullName,
  username,
  bio,
  followingCount = 0,
  followersCount = 0,
  isOwnProfile,
  isFollowing = false,
  followLoading = false,
  onEditPress,
  onChallengePress,
  onFollowPress,
  onFollowingPress,
  onFollowersPress,
}: ProfileHeroProps) => {
  return (
    <View>
      {/* Avatar and Name Row */}
      <View className="flex-row items-start gap-6 mb-6">
        <Avatar uri={profilePicture} name={fullName} size="xl" />
        
        <View className="flex-1">
          <Text className="text-2xl font-bold !text-gray-900">
            {fullName}
          </Text>

        </View>
      </View>

      {/* Bio */}
      {bio && (
        <Text className="mb-6 text-md font-medium !text-gray-700">
          {bio}
        </Text>
      )}

      {/* Following/Followers - Instagram Style */}
      <View className="flex-row gap-6 mb-4">
        <Pressable
          onPress={onFollowingPress}
          className="active:opacity-70"
        >
          <Text className="text-2xl font-bold text-center !text-gray-900">
            {followingCount}
          </Text>
          <Text className="text-sm !text-gray-600">
            Following
          </Text>
        </Pressable>

        <Pressable
          onPress={onFollowersPress}
          className="active:opacity-70"
        >
          <Text className="text-2xl font-bold text-center !text-gray-900">
            {followersCount}
          </Text>
          <Text className="text-sm !text-gray-600">
            Followers
          </Text>
        </Pressable>
      </View>

      {/* Action Buttons */}
      {isOwnProfile ? (
        <Pressable 
          onPress={onEditPress}
          className="py-3 bg-gray-100 border border-gray-300 rounded-lg active:bg-gray-200"
        >
          <Text className="font-medium text-center !text-gray-700">
            Edit Profile
          </Text>
        </Pressable>
      ) : (
        <View className="flex-row gap-2">
          <View className="flex-1">
            <Button
              title="Challenge"
              onPress={onChallengePress}
              variant="secondary"
              fullWidth
              disabled
            />
          </View>
          <View className="flex-1">
            <Button
              title={isFollowing ? 'Following' : 'Follow'}
              onPress={onFollowPress}
              variant={isFollowing ? 'secondary' : 'primary'}
              fullWidth
              disabled={followLoading}
            />
          </View>
        </View>
      )}
    </View>
  );
});

ProfileHero.displayName = 'ProfileHero';
