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
}: ProfileHeroProps) => {
  return (
    <View className="px-4 py-6 bg-white">
      {/* Avatar and Name Row */}
      <View className="flex-row items-start mb-3">
        <Avatar uri={profilePicture} name={fullName} size="lg" />
        
        <View className="flex-1 ml-3">
          <Text className="text-xl font-bold !text-gray-900">
            {fullName}
          </Text>
          <Text className="text-base !text-gray-600">
            @{username}
          </Text>
        </View>
      </View>

      {/* Bio */}
      {bio && (
        <Text className="mb-3 text-sm !text-gray-700">
          {bio}
        </Text>
      )}

      {/* Following/Followers */}
      <Pressable
        onPress={onFollowingPress}
        className="mb-4 active:opacity-70"
      >
        <Text className="text-sm !text-gray-500">
          <Text className="font-semibold !text-gray-700">{followingCount}</Text> following •{' '}
          <Text className="font-semibold !text-gray-700">{followersCount}</Text> followers
        </Text>
      </Pressable>

      {/* Action Buttons */}
      {isOwnProfile ? (
        <Button
          title="Edit Profile"
          onPress={onEditPress}
          variant="secondary"
          fullWidth
        />
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
