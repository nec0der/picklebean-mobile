import { memo } from 'react';
import { View, Text } from 'react-native';
import { Trophy, X } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { formatRelativeDate } from '@/lib/dateFormat';
import type { MatchHistoryRecord } from '@/types/user';

interface MatchCardProps {
  match: MatchHistoryRecord;
}

export const MatchCard = memo(({ match }: MatchCardProps) => {
  const isWin = match.result === 'win';
  const { score } = match as any; // score has team1 and team2

  return (
    <Card className={`p-4 mb-3 ${isWin ? 'bg-green-50' : 'bg-red-50'}`}>
      {/* Header: Result, Game Type, Points */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2">
          {/* Win/Loss Badge */}
          {isWin ? (
            <View className="flex-row items-center gap-1 px-2 py-1 bg-green-100 rounded">
              <Trophy size={16} color="#16a34a" />
              <Text className="text-sm font-bold text-green-700">WIN</Text>
            </View>
          ) : (
            <View className="flex-row items-center gap-1 px-2 py-1 bg-red-100 rounded">
              <X size={16} color="#dc2626" />
              <Text className="text-sm font-bold text-red-700">LOSS</Text>
            </View>
          )}

          {/* Game Type Badge */}
          <View className="px-2 py-1 bg-purple-100 rounded">
            <Text className="text-xs font-semibold text-purple-700">
              {match.gameType === 'singles' ? 'Singles' : 'Doubles'}
            </Text>
          </View>
        </View>

        {/* Points Change */}
        <Text
          className={`text-lg font-bold ${
            match.pointsChange > 0 ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {match.pointsChange > 0 ? '+' : ''}
          {match.pointsChange}
        </Text>
      </View>

      {/* Score */}
      {score && (
        <View className="py-2 mb-3">
          <Text className="mb-1 text-xs font-medium text-gray-600">Final Score</Text>
          <Text className="text-2xl font-bold text-gray-900">
            {score.team1} - {score.team2}
          </Text>
        </View>
      )}

      {/* Partner (if doubles) */}
      {match.partnerName && (
        <View className="mb-2">
          <Text className="text-sm text-gray-700">
            <Text className="font-semibold">Partner:</Text> {match.partnerName}
          </Text>
        </View>
      )}

      {/* Opponents */}
      {match.opponentNames && match.opponentNames.length > 0 && (
        <View className="mb-3">
          <Text className="mb-1 text-xs font-semibold text-gray-600">
            Opponent{match.opponentNames.length > 1 ? 's' : ''}:
          </Text>
          {match.opponentNames.map((name, index) => (
            <Text key={index} className="text-sm text-gray-700">
              • {name}
            </Text>
          ))}
        </View>
      )}

      {/* Timestamp */}
      <View className="pt-2 border-t border-gray-200">
        <Text className="text-xs text-gray-500">
          {formatRelativeDate(match.createdAt)}
        </Text>
      </View>
    </Card>
  );
});

MatchCard.displayName = 'MatchCard';

export type { MatchCardProps };
