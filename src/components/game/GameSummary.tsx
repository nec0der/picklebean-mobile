import { View, Text, Pressable, ScrollView } from 'react-native';
import { Trophy } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import type { Lobby } from '@/types/lobby';
import type { User } from '@/types/user';

interface GameSummaryProps {
  lobby: Lobby;
  currentUserId: string;
  onPlayAgain: () => void;
}

export const GameSummary = ({ lobby, currentUserId, onPlayAgain }: GameSummaryProps) => {
  if (!lobby.gameCompleted || !lobby.finalScores || !lobby.winner) {
    return null;
  }

  const { team1, team2 } = lobby.finalScores;
  const winningTeam = lobby.winner;
  const winnerScore = winningTeam === 1 ? team1 : team2;
  const loserScore = winningTeam === 1 ? team2 : team1;

  // Calculate game duration
  const duration = lobby.gameStartedAt && lobby.gameCompletedAt
    ? Math.floor((lobby.gameCompletedAt.toMillis() - lobby.gameStartedAt.toMillis()) / 1000)
    : 0;
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;
  const durationText = `${minutes}:${String(seconds).padStart(2, '0')}`;

  // Get player IDs for each team
  const team1PlayerIds: string[] = [];
  const team2PlayerIds: string[] = [];
  
  if (lobby.team1.player1?.uid) team1PlayerIds.push(lobby.team1.player1.uid);
  if (lobby.team1.player2?.uid) team1PlayerIds.push(lobby.team1.player2.uid);
  if (lobby.team2.player1?.uid) team2PlayerIds.push(lobby.team2.player1.uid);
  if (lobby.team2.player2?.uid) team2PlayerIds.push(lobby.team2.player2.uid);

  const isCurrentUserWinner = winningTeam === 1 
    ? team1PlayerIds.includes(currentUserId)
    : team2PlayerIds.includes(currentUserId);

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="px-4 py-8">
        {/* Winner Banner */}
        <View className={`items-center py-6 mb-6 rounded-lg ${
          winningTeam === 1 ? 'bg-blue-50' : 'bg-purple-50'
        }`}>
          <View className="items-center justify-center w-16 h-16 mb-3 bg-yellow-400 rounded-full">
            <Trophy size={32} color="#fff" />
          </View>
          <Text className="text-3xl font-bold text-gray-900">
            TEAM {winningTeam} WINS!
          </Text>
          {isCurrentUserWinner && (
            <Text className="mt-2 text-lg font-semibold text-green-600">
              🎉 Congratulations!
            </Text>
          )}
        </View>

        {/* Final Score */}
        <Card className="p-6 mb-6">
          <Text className="mb-4 text-lg font-semibold text-center text-gray-700">
            Final Score
          </Text>
          <View className="flex-row items-center justify-center gap-4">
            <View className="items-center">
              <Text className="mb-1 text-sm font-medium text-gray-600">Team 1</Text>
              <Text className={`text-5xl font-bold ${
                winningTeam === 1 ? 'text-green-600' : 'text-gray-400'
              }`}>
                {team1}
              </Text>
            </View>
            <Text className="text-3xl font-bold text-gray-400">-</Text>
            <View className="items-center">
              <Text className="mb-1 text-sm font-medium text-gray-600">Team 2</Text>
              <Text className={`text-5xl font-bold ${
                winningTeam === 2 ? 'text-green-600' : 'text-gray-400'
              }`}>
                {team2}
              </Text>
            </View>
          </View>
        </Card>

        {/* Game Stats */}
        <Card className="p-6 mb-6">
          <Text className="mb-4 text-lg font-semibold text-center text-gray-700">
            Game Stats
          </Text>
          
          {/* Duration */}
          <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
            <Text className="text-base text-gray-600">Duration</Text>
            <Text className="text-base font-semibold text-gray-900">{durationText}</Text>
          </View>

          {/* Game Mode */}
          <View className="flex-row items-center justify-between py-3">
            <Text className="text-base text-gray-600">Mode</Text>
            <Text className="text-base font-semibold text-gray-900">
              {lobby.gameMode === 'singles' ? 'Singles' : 'Doubles'}
            </Text>
          </View>
        </Card>

        {/* Points Changes */}
        <Card className="p-6 mb-6">
          <Text className="mb-4 text-lg font-semibold text-center text-gray-700">
            Ranking Changes
          </Text>
          
          {/* Team 1 */}
          <View className="mb-4">
            <Text className="mb-2 text-sm font-medium text-gray-600">Team 1</Text>
            {lobby.team1.player1 && (
              <View className="flex-row items-center justify-between py-2">
                <Text className="text-base text-gray-900">
                  {lobby.team1.player1.displayName}
                </Text>
                <Text className={`text-lg font-bold ${
                  winningTeam === 1 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {winningTeam === 1 ? '+25' : '-25'}
                </Text>
              </View>
            )}
            {lobby.team1.player2 && (
              <View className="flex-row items-center justify-between py-2">
                <Text className="text-base text-gray-900">
                  {lobby.team1.player2.displayName}
                </Text>
                <Text className={`text-lg font-bold ${
                  winningTeam === 1 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {winningTeam === 1 ? '+25' : '-25'}
                </Text>
              </View>
            )}
          </View>

          {/* Team 2 */}
          <View>
            <Text className="mb-2 text-sm font-medium text-gray-600">Team 2</Text>
            {lobby.team2.player1 && (
              <View className="flex-row items-center justify-between py-2">
                <Text className="text-base text-gray-900">
                  {lobby.team2.player1.displayName}
                </Text>
                <Text className={`text-lg font-bold ${
                  winningTeam === 2 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {winningTeam === 2 ? '+25' : '-25'}
                </Text>
              </View>
            )}
            {lobby.team2.player2 && (
              <View className="flex-row items-center justify-between py-2">
                <Text className="text-base text-gray-900">
                  {lobby.team2.player2.displayName}
                </Text>
                <Text className={`text-lg font-bold ${
                  winningTeam === 2 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {winningTeam === 2 ? '+25' : '-25'}
                </Text>
              </View>
            )}
          </View>
        </Card>

        {/* Play Again Button */}
        <Pressable
          onPress={onPlayAgain}
          className="items-center py-4 bg-green-500 rounded-lg active:bg-green-600"
        >
          <Text className="text-lg font-bold text-white">Play Again</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

export type { GameSummaryProps };
