import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, TrendingUp, TrendingDown, Trophy } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import type { Lobby } from '@/types/lobby';

interface GameSummaryProps {
  lobby: Lobby;
  currentUserId: string;
  onPlayAgain: () => void;
  onRematch?: () => void;
}

export const GameSummary = ({ lobby, currentUserId, onPlayAgain, onRematch }: GameSummaryProps) => {
  if (!lobby.gameCompleted || !lobby.finalScores || !lobby.winner) {
    return null;
  }

  const { team1, team2 } = lobby.finalScores;
  const winningTeam = lobby.winner;
  const isHost = currentUserId === lobby.hostId;

  // Get REAL calculated point changes from lobby (not hardcoded ±25)
  const team1Points = lobby.pointChanges?.team1 ?? 0;
  const team2Points = lobby.pointChanges?.team2 ?? 0;

  // Calculate game duration
  const duration = lobby.gameStartedAt && lobby.gameCompletedAt
    ? Math.floor((lobby.gameCompletedAt.toMillis() - lobby.gameStartedAt.toMillis()) / 1000)
    : 0;
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;
  const durationText = `${minutes}:${String(seconds).padStart(2, '0')}`;

  // Helper to render player with points
  const renderPlayer = (player: typeof lobby.team1.player1, points: number) => {
    if (!player) return null;

    const isPositive = points > 0;
    const Icon = isPositive ? TrendingUp : TrendingDown;
    const iconColor = isPositive ? '#10b981' : '#ef4444';
    const textColor = isPositive ? '!text-green-600' : '!text-red-600';

    return (
      <View className="flex-row items-center gap-3 p-3 bg-white rounded-lg">
        <Avatar
          uri={player.photoURL}
          name={player.displayName}
          size="sm"
        />
        <Text className="flex-1 text-base font-medium !text-gray-900">
          {player.displayName}
        </Text>
        <View className="flex-row items-center gap-1">
          <Icon size={16} color={iconColor} />
          <Text className={`text-base font-bold ${textColor}`}>
            {points > 0 ? '+' : ''}{points}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
        <Pressable onPress={onPlayAgain} className="p-2">
          <X size={24} color="#374151" />
        </Pressable>
        <Text className="text-lg font-bold !text-gray-900">Match Complete</Text>
        <View className="w-10" />
      </View>

      {/* Content */}
      <View className="flex-1 px-4 py-6">
        {/* Winner Announcement - Big & Bold */}
        <View className="items-center mb-6">
          <View className="items-center justify-center w-16 h-16 mb-3 bg-yellow-400 rounded-full">
            <Trophy size={32} color="#fff" />
          </View>
          <Text className="text-3xl font-bold !text-gray-900 mb-2">
            TEAM {winningTeam} WINS!
          </Text>
        </View>

        {/* Score Display */}
        <View className="flex-row items-center justify-center gap-4 mb-6">
          <View className="items-center">
            <Text className="mb-1 text-sm font-medium !text-gray-600">Team 1</Text>
            <Text className={`text-5xl font-bold ${
              winningTeam === 1 ? '!text-green-600' : '!text-gray-400'
            }`}>
              {team1}
            </Text>
          </View>
          <Text className="text-3xl font-bold !text-gray-400">-</Text>
          <View className="items-center">
            <Text className="mb-1 text-sm font-medium !text-gray-600">Team 2</Text>
            <Text className={`text-5xl font-bold ${
              winningTeam === 2 ? '!text-green-600' : '!text-gray-400'
            }`}>
              {team2}
            </Text>
          </View>
        </View>

        {/* Duration */}
        <Text className="mb-6 text-sm text-center !text-gray-500">
          Duration: {durationText}
        </Text>

        {/* Team Cards with REAL Point Changes */}
        <View className="gap-4 mb-6">
          {/* Team 1 - Winner gets green border */}
          <Card 
            variant="outlined" 
            padding="md"
            className={winningTeam === 1 ? 'bg-green-50 border-green-300' : 'bg-white border-gray-200'}
          >
            <View className="flex-row items-center justify-between mb-3">
              <Text className={`text-base font-semibold ${
                winningTeam === 1 ? '!text-green-800' : '!text-gray-700'
              }`}>
                Team 1 {winningTeam === 1 && '🏆'}
              </Text>
            </View>
            <View className="gap-2">
              {renderPlayer(lobby.team1.player1, team1Points)}
              {lobby.gameMode === 'doubles' && renderPlayer(lobby.team1.player2, team1Points)}
            </View>
          </Card>

          {/* VS Divider */}
          <View className="flex-row items-center justify-center">
            <View className="flex-1 h-px bg-gray-300" />
            <Text className="px-3 text-sm font-medium !text-gray-500">vs</Text>
            <View className="flex-1 h-px bg-gray-300" />
          </View>

          {/* Team 2 */}
          <Card 
            variant="outlined" 
            padding="md"
            className={winningTeam === 2 ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200'}
          >
            <View className="flex-row items-center justify-between mb-3">
              <Text className={`text-base font-semibold ${
                winningTeam === 2 ? '!text-blue-800' : '!text-gray-700'
              }`}>
                Team 2 {winningTeam === 2 && '🏆'}
              </Text>
            </View>
            <View className="gap-2">
              {renderPlayer(lobby.team2.player1, team2Points)}
              {lobby.gameMode === 'doubles' && renderPlayer(lobby.team2.player2, team2Points)}
            </View>
          </Card>
        </View>
      </View>

      {/* Fixed Bottom Buttons */}
      <View className="px-4 pt-4 pb-4 bg-white border-t border-gray-200">
        {isHost && onRematch && (
          <Pressable
            onPress={onRematch}
            className="items-center py-4 mb-3 bg-blue-500 rounded-lg active:bg-blue-600"
          >
            <Text className="text-lg font-bold !text-white">🔄 Create Rematch</Text>
          </Pressable>
        )}
        <Pressable
          onPress={onPlayAgain}
          className={`items-center py-4 rounded-lg active:bg-green-600 ${
            isHost && onRematch ? 'bg-gray-100' : 'bg-green-500'
          }`}
        >
          <Text className={`text-lg font-bold ${
            isHost && onRematch ? '!text-gray-700' : '!text-white'
          }`}>
            Back to Home
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export type { GameSummaryProps };
