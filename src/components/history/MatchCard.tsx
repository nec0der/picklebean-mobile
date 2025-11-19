import { memo } from 'react';
import { View, Text } from 'react-native';
import { Trophy, X } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import type { MatchHistoryRecord } from '@/types/user';

interface MatchCardProps {
  match: MatchHistoryRecord;
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

export const MatchCard = memo(({ match }: MatchCardProps) => {
  const isWin = match.result === 'win';

  return (
    <Card className="py-0 mb-3">
      <View className="flex-row items-center p-4 space-x-4">
        {/* Win/Loss Icon Box */}
        <View
          className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center border ${
            isWin
              ? 'bg-green-100 border-green-200'
              : 'bg-red-100 border-red-200'
          }`}
        >
          {isWin ? (
            <Trophy size={24} color="#16a34a" />
          ) : (
            <X size={24} color="#dc2626" />
          )}
        </View>

        {/* Match Details */}
        <View className="flex-1 min-w-0">
          <Text
            className={`font-medium mb-0.5 ${
              isWin ? 'text-green-800' : 'text-red-800'
            }`}
          >
            {isWin ? 'Won' : 'Lost'}
          </Text>
          <Text className="text-sm text-gray-600 truncate">
            {getMatchDisplayText(match)}
          </Text>
        </View>

        {/* Points Change */}
        {!match.isExhibition && (
          <View className="flex-shrink-0">
            <Text
              className={`text-base font-bold ${
                isWin ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {match.pointsChange > 0 ? '+' : ''}
              {match.pointsChange}
            </Text>
          </View>
        )}
      </View>
    </Card>
  );
});

MatchCard.displayName = 'MatchCard';

export type { MatchCardProps };
