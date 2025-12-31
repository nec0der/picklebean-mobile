import { memo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Trophy } from 'lucide-react-native';
import { formatRelativeDate } from '@/lib/dateFormat';
import type { MatchHistoryRecord } from '@/types/user';

interface MatchFeedItemProps {
  match: MatchHistoryRecord;
  onPress?: () => void;
  onUsernamePress?: (username: string) => void;
}

export const MatchFeedItem = memo(({ match, onPress, onUsernamePress }: MatchFeedItemProps) => {
  const isWin = match.result === 'win';
  const gameTypeLabel = match.gameCategory === 'singles' ? 'Singles' : 'Doubles';
  
  // Format opponent names
  const opponentsText = match.opponentNames.join(', ');
  const partnerText = match.partnerName ? ` with ${match.partnerName}` : '';
  
  // Format time ago
  const timeAgo = formatRelativeDate(match.createdAt);
  
  // Format score
  const scoreText = match.score 
    ? `${match.score.team1}-${match.score.team2}` 
    : '';
  
  // Points change display
  const pointsText = match.pointsChange > 0 
    ? `+${match.pointsChange}` 
    : `${match.pointsChange}`;
  const pointsColor = match.pointsChange > 0 ? '!text-green-600' : '!text-red-600';

  return (
    <Pressable
      onPress={onPress}
      className="p-4 mb-3 bg-white border border-gray-200 rounded-xl active:bg-gray-50"
    >
      <View className="flex-row items-start">
        {isWin && (
          <View className="mr-2">
            <Trophy size={20} color="#16a34a" />
          </View>
        )}
        
        <View className="flex-1">
          <Text className="mb-1 text-base font-medium !text-gray-900">
            {isWin ? 'Won' : 'Lost'} vs {opponentsText}{partnerText}
          </Text>
          
          <Text className="text-sm !text-gray-600">
            {scoreText && `${scoreText} • `}{gameTypeLabel} • {' '}
            <Text className={`font-semibold ${pointsColor}`}>
              {pointsText} pts
            </Text>
          </Text>
          
          <Text className="mt-1 text-xs !text-gray-500">
            {timeAgo}
          </Text>
        </View>
      </View>
    </Pressable>
  );
});

MatchFeedItem.displayName = 'MatchFeedItem';
