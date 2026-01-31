import { memo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { User, Users } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import type { MatchHistoryRecord } from '@/types/user';

interface MatchCardProps {
  match: MatchHistoryRecord;
  onPress?: (match: MatchHistoryRecord) => void;
}

/**
 * Formats match display text like web app
 * Singles: "You vs [opponent]"
 * Doubles: "You & [partner] vs [opponent1] & [opponent2]"
 */
const getMatchDisplayText = (match: MatchHistoryRecord): string => {
  if (match.gameType === 'singles') {
    return `You vs ${match.opponentNames.join(' & ')}`;
  } else {
    const partner = match.partnerName || 'Unknown';
    return `You & ${partner} vs ${match.opponentNames.join(' & ')}`;
  }
};

export const MatchCard = memo(({ match, onPress }: MatchCardProps) => {
  const isWin = match.result === 'win';
  const isSingles = match.gameType === 'singles' || match.gameCategory === 'singles';

  const handlePress = () => {
    onPress?.(match);
  };

  return (
    <Pressable onPress={handlePress}>
      <Card variant="outlined" className="px-0 py-0 mb-3">
        <View className="flex-row items-center gap-4 p-4 space-x-4">
          {/* Game Type Icon Box */}
          <View
            className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center border ${
              isWin
                ? 'bg-green-100 border-green-200'
                : 'bg-red-100 border-red-200'
            }`}
          >
            {isSingles ? (
              <User size={20} color={isWin ? '#16a34a' : '#dc2626'} />
            ) : (
              <Users size={20} color={isWin ? '#16a34a' : '#dc2626'} />
            )}
          </View>

          {/* Match Details */}
          <View className="flex-1 min-w-0">
            {match.score && (
              <Text
                className={`font-semibold mb-0.5 ${
                  isWin ? 'text-green-800' : 'text-red-800'
                }`}
              >
                {match.score.team1}-{match.score.team2}
              </Text>
            )}
            <Text className="text-sm text-gray-600 truncate">
              {getMatchDisplayText(match)}
            </Text>
          </View>

          {/* Points Change - Pill Badge */}
          <View 
            className={`items-center justify-center px-3 py-1 rounded-full ${
              match.pointsChange > 0 ? 'bg-green-100' : 'bg-red-100'
            }`}
          >
            <Text
              className={`text-sm font-bold ${
                match.pointsChange > 0 ? 'text-green-700' : 'text-red-700'
              }`}
            >
              {match.pointsChange > 0 ? '+' : ''}
              {match.pointsChange}
            </Text>
          </View>
        </View>
      </Card>
    </Pressable>
  );
});

MatchCard.displayName = 'MatchCard';

export type { MatchCardProps };
