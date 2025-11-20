import { memo } from 'react';
import { View, Text } from 'react-native';
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

export const LeaderboardRow = memo(({ user, rank, category, isCurrentUser }: LeaderboardRowProps) => {
  const points = getUserPoints(user, category);
  const displayName = user.displayName || 'Unknown User';

  return (
    <Card className={`mb-3 py-0 ${isCurrentUser ? 'border-2 border-blue-500' : ''}`}>
      <View className="flex-row items-center p-4">
        {/* Rank */}
        <View className="items-center justify-center w-12 mr-4">
          {getRankDisplay(rank)}
        </View>

        {/* Avatar */}
        <Avatar
          uri={user.profilePictureUrl || user.photoURL}
          name={displayName}
          size="md"
        />

        {/* Name */}
        <View className="flex-1 mx-3">
          <Text className="text-base font-medium text-gray-900 truncate">
            {displayName}
            {isCurrentUser && (
              <Text className="ml-2 text-sm font-normal text-blue-600"> (You)</Text>
            )}
          </Text>
        </View>

        {/* Points */}
        <View className="items-end">
          <Text className="text-lg font-bold text-gray-900">
            {points.toLocaleString()}
          </Text>
          <Text className="text-xs text-gray-500">pts</Text>
        </View>
      </View>
    </Card>
  );
});

LeaderboardRow.displayName = 'LeaderboardRow';

export type { LeaderboardRowProps };
