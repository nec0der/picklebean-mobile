import { memo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Trophy, Medal } from 'lucide-react-native';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import type { UserDocument } from '@/types/user';
import type { GameCategory } from '@/types/lobby';

interface LeaderboardRowProps {
  user: UserDocument;
  rank: number;
  category: GameCategory;
  isCurrentUser?: boolean;
  onPress?: () => void;
}

/**
 * Get user's points for the selected category
 */
const getUserPoints = (user: UserDocument, category: GameCategory): number => {
  switch (category) {
    case 'singles':
      return user.rankings?.singles || 1000;
    case 'same_gender_doubles':
      return user.rankings?.sameGenderDoubles || 1000;
    case 'mixed_doubles':
      return user.rankings?.mixedDoubles || 1000;
    default:
      return 1000;
  }
};

/**
 * Get rank display (trophy/medal for top 3, number for rest)
 */
const getRankDisplay = (rank: number) => {
  switch (rank) {
    case 1:
      return <Trophy size={24} color="#EAB308" />; // Gold
    case 2:
      return <Medal size={24} color="#9CA3AF" />; // Silver
    case 3:
      return <Medal size={24} color="#D97706" />; // Bronze
    default:
      return (
        <Text className="text-xl font-bold text-gray-700">
          {rank}
        </Text>
      );
  }
};

export const LeaderboardRow = memo(({ user, rank, category, isCurrentUser, onPress }: LeaderboardRowProps) => {
  const points = getUserPoints(user, category);
  const displayName = user.displayName || 'Unknown User';

  return (
    <Card variant="outlined" className={`mb-3 py-0 px-0 ${isCurrentUser ? 'border-2 border-blue-500' : ''}`}>
      <Pressable onPress={onPress} className="active:bg-gray-50">
        <View className="flex-row items-center p-4">
          {/* Avatar */}
          <Avatar
            uri={user.profilePictureUrl || user.photoURL}
            name={displayName}
            size="md"
          />

          {/* Name and Points Column */}
          <View className="flex-1 ml-3">
            <Text className="text-base font-semibold text-gray-900">
              {displayName}
              {isCurrentUser && (
                <Text className="text-sm font-normal text-blue-600"> (You)</Text>
              )}
            </Text>
            <Text className="mt-1 text-sm text-gray-500">
              {points.toLocaleString()} Points
            </Text>
          </View>

          {/* Rank/Medal on Right */}
          <View className="items-center justify-center ml-4">
            {getRankDisplay(rank)}
          </View>
        </View>
      </Pressable>
    </Card>
  );
});

LeaderboardRow.displayName = 'LeaderboardRow';

export type { LeaderboardRowProps };
