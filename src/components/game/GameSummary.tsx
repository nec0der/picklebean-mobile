import { View, Text, Pressable, Alert, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, TrendingUp, TrendingDown, Trophy } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useEffect, useRef } from 'react';
import { shareMatchResult } from '@/lib/share';
import type { Lobby } from '@/types/lobby';

interface GameSummaryProps {
  lobby: Lobby;
  currentUserId: string;
  currentUserName: string;
  onPlayAgain: () => void;
  onRematch?: () => void;
}

export const GameSummary = ({ 
  lobby, 
  currentUserId, 
  currentUserName,
  onPlayAgain, 
  onRematch 
}: GameSummaryProps) => {
  if (!lobby.gameCompleted || !lobby.finalScores || !lobby.winner) {
    return null;
  }

  const { team1, team2 } = lobby.finalScores;
  const winningTeam = lobby.winner;
  const isHost = currentUserId === lobby.hostId;

  // Get REAL calculated point changes from lobby
  const team1Points = lobby.pointChanges?.team1 ?? 0;
  const team2Points = lobby.pointChanges?.team2 ?? 0;

  // Determine current user's point change
  const isOnTeam1 = 
    lobby.team1.player1?.uid === currentUserId || 
    lobby.team1.player2?.uid === currentUserId;
  const currentUserPoints = isOnTeam1 ? team1Points : team2Points;

  // Animation values
  const trophyScale = useRef(new Animated.Value(1)).current;
  const winnerScale = useRef(new Animated.Value(0.95)).current;

  // Entrance animations
  useEffect(() => {
    // Victory haptic
    Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Success
    );

    // Trophy pulse (continuous, gentle)
    Animated.loop(
      Animated.sequence([
        Animated.timing(trophyScale, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(trophyScale, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Winner entrance (once, subtle)
    Animated.timing(winnerScale, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleShare = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    try {
      await shareMatchResult(lobby, currentUserName, currentUserPoints);
      await Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success
      );
    } catch (error) {
      await Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Error
      );
      console.error('Error sharing:', error);
      Alert.alert('Share Failed', 'Unable to share match result. Please try again.');
    }
  };

  const handlePlayAgainPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPlayAgain();
  };

  const handleRematchPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (onRematch) {
      onRematch();
    }
  };

  // Minimal player row - just Name + Points + Arrow
  const renderPlayer = (player: typeof lobby.team1.player1, points: number, isWinner: boolean) => {
    if (!player) return null;

    const isPositive = points > 0;
    const Icon = isPositive ? TrendingUp : TrendingDown;
    const iconColor = isPositive ? '#10b981' : '#ef4444';

    return (
      <View 
        className={`flex-row items-center justify-between px-4 py-3 ${
          isWinner ? 'bg-green-50' : 'bg-gray-50'
        }`}
      >
        <Text className={`flex-1 ${
          isWinner ? 'text-lg font-semibold !text-gray-900' : 'text-base font-regular !text-gray-700'
        }`}>
          {player.displayName}
        </Text>
        <View className="flex-row items-center gap-2">
          <Text className={`${
            isWinner ? 'text-lg' : 'text-base'
          } font-bold ${isPositive ? '!text-green-600' : '!text-red-600'}`}>
            {points > 0 ? '+' : ''}{points}
          </Text>
          <Icon size={16} color={iconColor} />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['bottom']}>
      {/* Minimal Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
        <Pressable onPress={handlePlayAgainPress} className="p-2">
          <X size={24} color="#374151" />
        </Pressable>
        <View className="w-10" />
        <Pressable onPress={handleShare} className="p-2">
          <Text className="text-base font-semibold !text-blue-600">Share</Text>
        </Pressable>
      </View>

      {/* Content */}
      <View className="flex-1 px-4 py-8">
        {/* Trophy + Winner (Pulsing) */}
        <View className="items-center mb-8">
          <Animated.View 
            style={{ transform: [{ scale: trophyScale }] }}
            className="items-center justify-center w-16 h-16 mb-4 bg-yellow-400 rounded-full"
          >
            <Trophy size={32} color="#fff" />
          </Animated.View>
          <Text className="text-3xl font-bold !text-gray-900">
            TEAM {winningTeam} WINS!
          </Text>
        </View>

        {/* Score - Just Numbers */}
        <View className="flex-row items-center justify-center gap-6 mb-8">
          <Text className={`text-6xl font-bold ${
            winningTeam === 1 ? '!text-green-600' : '!text-gray-400'
          }`}>
            {team1}
          </Text>
          <Text className="text-4xl font-bold !text-gray-400">-</Text>
          <Text className={`text-6xl font-bold ${
            winningTeam === 2 ? '!text-green-600' : '!text-gray-400'
          }`}>
            {team2}
          </Text>
        </View>

        {/* Players - Minimal Rows */}
        <Animated.View 
          style={{ transform: [{ scale: winnerScale }] }}
          className="overflow-hidden rounded-lg"
        >
          {/* Winners */}
          {winningTeam === 1 ? (
            <>
              {renderPlayer(lobby.team1.player1, team1Points, true)}
              {lobby.gameMode === 'doubles' && renderPlayer(lobby.team1.player2, team1Points, true)}
            </>
          ) : (
            <>
              {renderPlayer(lobby.team2.player1, team2Points, true)}
              {lobby.gameMode === 'doubles' && renderPlayer(lobby.team2.player2, team2Points, true)}
            </>
          )}

          {/* Losers */}
          <View className="h-px my-2 bg-gray-200" />
          {winningTeam === 1 ? (
            <>
              {renderPlayer(lobby.team2.player1, team2Points, false)}
              {lobby.gameMode === 'doubles' && renderPlayer(lobby.team2.player2, team2Points, false)}
            </>
          ) : (
            <>
              {renderPlayer(lobby.team1.player1, team1Points, false)}
              {lobby.gameMode === 'doubles' && renderPlayer(lobby.team1.player2, team1Points, false)}
            </>
          )}
        </Animated.View>
      </View>

      {/* Bottom Actions */}
      <View className="px-4 pt-4 pb-4 bg-white border-t border-gray-200">
        {isHost && onRematch && (
          <Pressable
            onPress={handleRematchPress}
            className="items-center py-4 mb-3 bg-blue-500 rounded-lg active:bg-blue-600"
          >
            <Text className="text-lg font-bold !text-white">Play Again</Text>
          </Pressable>
        )}
        <Pressable
          onPress={handlePlayAgainPress}
          className={`items-center py-4 rounded-lg ${
            isHost && onRematch 
              ? 'bg-gray-100 active:bg-gray-200' 
              : 'bg-green-500 active:bg-green-600'
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
