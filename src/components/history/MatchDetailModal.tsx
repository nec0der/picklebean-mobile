import { memo } from 'react';
import { Modal, View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Trophy } from 'lucide-react-native';
import { formatRelativeDate } from '@/lib/dateFormat';
import type { MatchHistoryRecord } from '@/types/user';

interface MatchDetailModalProps {
  visible: boolean;
  match: MatchHistoryRecord | null;
  onClose: () => void;
}

export const MatchDetailModal = memo(({ visible, match, onClose }: MatchDetailModalProps) => {
  if (!match) return null;

  const isWin = match.result === 'win';
  const score = match.score;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
          <Text className="text-xl font-bold text-gray-900">Match Details</Text>
          <Pressable onPress={onClose} className="p-2">
            <X size={24} color="#6b7280" />
          </Pressable>
        </View>

        {/* Content */}
        <ScrollView className="flex-1 px-4 py-6">
          {/* Result Banner */}
          <View
            className={`mb-6 p-4 rounded-lg ${
              isWin ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}
          >
            <View className="flex-row items-center justify-center mb-2">
              {isWin ? (
                <Trophy size={32} color="#16a34a" />
              ) : (
                <X size={32} color="#dc2626" />
              )}
            </View>
            <Text
              className={`text-center text-2xl font-bold ${
                isWin ? 'text-green-800' : 'text-red-800'
              }`}
            >
              {isWin ? 'You Won!' : 'You Lost'}
            </Text>
          </View>

          {/* Score */}
          {score && (
            <View className="mb-6">
              <Text className="mb-2 text-sm font-semibold text-gray-500 uppercase">
                Final Score
              </Text>
              <Text className="text-4xl font-bold text-center text-gray-900">
                {score.team1} - {score.team2}
              </Text>
            </View>
          )}

          {/* Game Type */}
          <View className="mb-6">
            <Text className="mb-2 text-sm font-semibold text-gray-500 uppercase">
              Game Type
            </Text>
            <Text className="text-lg text-gray-900">
              {match.gameType === 'singles' ? 'Singles' : 'Doubles'}
            </Text>
          </View>

          {/* Partner (if doubles) */}
          {match.partnerName && (
            <View className="mb-6">
              <Text className="mb-2 text-sm font-semibold text-gray-500 uppercase">
                Partner
              </Text>
              <Text className="text-lg text-gray-900">{match.partnerName}</Text>
            </View>
          )}

          {/* Opponents */}
          {match.opponentNames && match.opponentNames.length > 0 && (
            <View className="mb-6">
              <Text className="mb-2 text-sm font-semibold text-gray-500 uppercase">
                Opponent{match.opponentNames.length > 1 ? 's' : ''}
              </Text>
              {match.opponentNames.map((name, index) => (
                <Text key={index} className="text-lg text-gray-900">
                  {name}
                </Text>
              ))}
            </View>
          )}

          {/* Points Change */}
          <View className="mb-6">
            <Text className="mb-2 text-sm font-semibold text-gray-500 uppercase">
              Points Change
            </Text>
            <Text
              className={`text-2xl font-bold ${
                match.pointsChange > 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {match.pointsChange > 0 ? '+' : ''}
              {match.pointsChange}
            </Text>
          </View>

          {/* Date */}
          <View className="mb-6">
            <Text className="mb-2 text-sm font-semibold text-gray-500 uppercase">
              Date
            </Text>
            <Text className="text-lg text-gray-900">
              {formatRelativeDate(match.createdAt)}
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
});

MatchDetailModal.displayName = 'MatchDetailModal';

export type { MatchDetailModalProps };
