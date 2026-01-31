/**
 * GameSummary - Minimal, Animated Post-Match Screen
 * 
 * Design: Clean layout with staggered animations
 * Psychology: Context-aware copy, haptic feedback for emotions
 */

import { memo, useEffect, useMemo, useRef } from 'react';
import { View, Text, Pressable, Animated, Easing } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  Trophy, 
  TrendingUp, 
  TrendingDown, 
  Share2, 
  RotateCcw,
  Heart,
  CheckCircle,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { shareMatchResult } from '@/lib/share';
import { useAlert } from '@/hooks/common/useAlert';
import { ScreenHeader } from '@/components/common';
import { Avatar } from '@/components/ui/Avatar';
import type { Lobby } from '@/types/lobby';

interface GameSummaryProps {
  lobby: Lobby;
  currentUserId: string;
  currentUserName: string;
  onPlayAgain: () => void;
  onRematch?: () => void;
}

// =============================================================================
// PSYCHOLOGY-DRIVEN COPY
// =============================================================================

interface OutcomeContext {
  userWon: boolean;
  isCloseGame: boolean;
  isDominant: boolean;
}

const getOutcomeHeadline = (ctx: OutcomeContext): string => {
  if (ctx.userWon) {
    if (ctx.isDominant) return 'DOMINANT';
    if (ctx.isCloseGame) return 'CLUTCH';
    return 'VICTORY';
  } else {
    if (ctx.isCloseGame) return 'SO CLOSE';
    return 'GG';
  }
};

const getOutcomeSubtext = (ctx: OutcomeContext): string => {
  if (ctx.userWon) {
    if (ctx.isDominant) return "Absolutely clinical performance.";
    if (ctx.isCloseGame) return "That was a nail-biter! 🔥";
    return "Solid win. Keep climbing!";
  } else {
    if (ctx.isCloseGame) return "One point away. Next time!";
    return "Champions learn from every game.";
  }
};

// =============================================================================
// ANIMATED PLAYER ROW
// =============================================================================

interface PlayerRowProps {
  player: {
    uid: string;
    displayName: string;
    photoURL?: string;
  };
  isCurrentUser: boolean;
  isWinner: boolean;
  animDelay: number;
}

const AnimatedPlayerRow = memo(({ player, isCurrentUser, isWinner, animDelay }: PlayerRowProps) => {
  const slideAnim = useRef(new Animated.Value(30)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: animDelay,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        delay: animDelay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [animDelay]);

  const displayName = player.displayName.split(' ')[0];

  return (
    <Animated.View
      style={{
        transform: [{ translateY: slideAnim }],
        opacity: opacityAnim,
      }}
      className="flex-row items-center py-3"
    >
      <Avatar
        uri={player.photoURL}
        name={displayName}
        size="md"
      />
      
      <View className="flex-1 ml-3">
        <View className="flex-row items-center gap-2">
          <Text className={`text-base ${isCurrentUser ? 'font-bold' : 'font-medium'} !text-gray-900`}>
            {displayName}
          </Text>
          {isCurrentUser && (
            <View className="px-2 py-0.5 bg-blue-100 rounded-full">
              <Text className="text-xs font-semibold !text-blue-700">You</Text>
            </View>
          )}
        </View>
      </View>

      {isWinner && (
        <CheckCircle size={20} color="#16a34a" />
      )}
    </Animated.View>
  );
});

AnimatedPlayerRow.displayName = 'AnimatedPlayerRow';

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const GameSummary = memo(({ 
  lobby, 
  currentUserId, 
  currentUserName,
  onPlayAgain, 
  onRematch 
}: GameSummaryProps) => {
  const alert = useAlert();
  const insets = useSafeAreaInsets();

  // Animation refs
  const iconScale = useRef(new Animated.Value(0)).current;
  const headlineOpacity = useRef(new Animated.Value(0)).current;
  const headlineScale = useRef(new Animated.Value(0.8)).current;
  const scoreOpacity = useRef(new Animated.Value(0)).current;
  const scoreScale = useRef(new Animated.Value(0.9)).current;
  const pointsOpacity = useRef(new Animated.Value(0)).current;
  const buttonSlide = useRef(new Animated.Value(50)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;

  // Guard clause
  if (!lobby.gameCompleted || !lobby.finalScores || !lobby.winner) {
    return null;
  }

  const { team1, team2 } = lobby.finalScores;
  const winningTeam = lobby.winner;
  const isHost = currentUserId === lobby.hostId;

  // Get point changes from lobby
  const team1Points = lobby.pointChanges?.team1 ?? 0;
  const team2Points = lobby.pointChanges?.team2 ?? 0;

  // Determine current user's position
  const isOnTeam1 = 
    lobby.team1.player1?.uid === currentUserId || 
    lobby.team1.player2?.uid === currentUserId;
  
  const currentUserPoints = isOnTeam1 ? team1Points : team2Points;
  const userWon = (isOnTeam1 && winningTeam === 1) || (!isOnTeam1 && winningTeam === 2);

  // Calculate score difference for context
  const scoreDiff = Math.abs(team1 - team2);
  const isCloseGame = scoreDiff <= 3;
  const isDominant = scoreDiff >= 7;

  // Outcome context
  const outcomeContext: OutcomeContext = useMemo(() => ({
    userWon,
    isCloseGame,
    isDominant,
  }), [userWon, isCloseGame, isDominant]);

  const headline = getOutcomeHeadline(outcomeContext);
  const subtext = getOutcomeSubtext(outcomeContext);

  // Collect all players (sorted: current user first, then winners)
  interface PlayerWithTeam {
    uid: string;
    displayName: string;
    photoURL?: string;
    team: number;
  }
  
  const playersToAdd: (PlayerWithTeam | null)[] = [
    lobby.team1.player1 ? { uid: lobby.team1.player1.uid, displayName: lobby.team1.player1.displayName, photoURL: lobby.team1.player1.photoURL, team: 1 } : null,
    lobby.gameMode === 'doubles' && lobby.team1.player2 ? { uid: lobby.team1.player2.uid, displayName: lobby.team1.player2.displayName, photoURL: lobby.team1.player2.photoURL, team: 1 } : null,
    lobby.team2.player1 ? { uid: lobby.team2.player1.uid, displayName: lobby.team2.player1.displayName, photoURL: lobby.team2.player1.photoURL, team: 2 } : null,
    lobby.gameMode === 'doubles' && lobby.team2.player2 ? { uid: lobby.team2.player2.uid, displayName: lobby.team2.player2.displayName, photoURL: lobby.team2.player2.photoURL, team: 2 } : null,
  ];
  
  const allPlayers = playersToAdd.filter((p): p is PlayerWithTeam => p !== null);
  
  // Sort: current user first, then winners, then losers
  const sortedPlayers = [...allPlayers].sort((a, b) => {
    if (a.uid === currentUserId) return -1;
    if (b.uid === currentUserId) return 1;
    const aIsWinner = a.team === winningTeam;
    const bIsWinner = b.team === winningTeam;
    if (aIsWinner && !bIsWinner) return -1;
    if (!aIsWinner && bIsWinner) return 1;
    return 0;
  });

  // ========= STAGGERED ANIMATION + HAPTICS =========
  useEffect(() => {
    // Haptic choreography
    if (userWon) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), 150);
      setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), 300);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    // 1. Icon (0ms)
    Animated.spring(iconScale, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();

    // 2. Headline (200ms)
    Animated.parallel([
      Animated.timing(headlineOpacity, {
        toValue: 1,
        duration: 400,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.spring(headlineScale, {
        toValue: 1,
        tension: 60,
        friction: 10,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // 3. Score (400ms)
    Animated.parallel([
      Animated.timing(scoreOpacity, {
        toValue: 1,
        duration: 300,
        delay: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scoreScale, {
        toValue: 1,
        tension: 80,
        friction: 12,
        delay: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // 4. Points badge (600ms)
    Animated.timing(pointsOpacity, {
      toValue: 1,
      duration: 300,
      delay: 600,
      useNativeDriver: true,
    }).start();

    // 5. Button (1200ms)
    Animated.parallel([
      Animated.timing(buttonSlide, {
        toValue: 0,
        duration: 400,
        delay: 1200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(buttonOpacity, {
        toValue: 1,
        duration: 300,
        delay: 1200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [userWon]);

  const handleShare = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    try {
      await shareMatchResult(lobby, currentUserName, currentUserPoints);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      console.error('Error sharing:', error);
      alert.show('Share Failed', 'Unable to share match result. Please try again.');
    }
  };

  const handleRematchPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onRematch?.();
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['bottom']}>
      {/* Header */}
      <ScreenHeader
        leftAction="close"
        title="Match Result"
        onLeftPress={onPlayAgain}
        rightComponent={
          <Pressable 
            onPress={handleShare}
            className="flex-row items-center gap-1 px-3 py-2"
          >
            <Share2 size={18} color="#3b82f6" />
            <Text className="text-sm font-semibold !text-blue-600">Share</Text>
          </Pressable>
        }
      />

      {/* Main Content - Centered */}
      <View className="items-center justify-center flex-1 px-6">
        
        {/* Icon */}
        <Animated.View 
          style={{ transform: [{ scale: iconScale }] }}
          className={`items-center justify-center w-20 h-20 mb-5 rounded-full ${
            userWon ? 'bg-green-100' : 'bg-blue-50'
          }`}
        >
          {userWon ? (
            <Trophy size={40} color="#16a34a" />
          ) : (
            <Heart size={36} color="#3b82f6" />
          )}
        </Animated.View>

        {/* Headline + Subtext */}
        <Animated.View 
          style={{ 
            opacity: headlineOpacity,
            transform: [{ scale: headlineScale }],
          }}
          className="items-center mb-8"
        >
          <Text className={`text-4xl font-black tracking-tight ${
            userWon ? '!text-green-600' : '!text-blue-600'
          }`}>
            {headline}
          </Text>
          <Text className="mt-2 text-base text-center !text-gray-500">
            {subtext}
          </Text>
        </Animated.View>

        {/* Score */}
        <Animated.View
          style={{
            opacity: scoreOpacity,
            transform: [{ scale: scoreScale }],
          }}
          className="flex-row items-baseline justify-center gap-3 mb-4"
        >
          <Text className={`text-6xl font-black ${
            winningTeam === 1 ? '!text-green-600' : '!text-gray-300'
          }`}>
            {team1}
          </Text>
          <Text className="text-3xl font-bold !text-gray-300">—</Text>
          <Text className={`text-6xl font-black ${
            winningTeam === 2 ? '!text-green-600' : '!text-gray-300'
          }`}>
            {team2}
          </Text>
        </Animated.View>

        {/* Points earned/lost - single display */}
        <Animated.View
          style={{ opacity: pointsOpacity }}
          className={`flex-row items-center gap-2 px-4 py-2 mb-10 rounded-full ${
            currentUserPoints > 0 ? 'bg-green-50' : 'bg-gray-100'
          }`}
        >
          {currentUserPoints > 0 ? (
            <TrendingUp size={18} color="#16a34a" />
          ) : (
            <TrendingDown size={18} color="#6b7280" />
          )}
          <Text className={`text-lg font-bold ${
            currentUserPoints > 0 ? '!text-green-600' : '!text-gray-600'
          }`}>
            {currentUserPoints > 0 ? '+' : ''}{currentUserPoints} pts
          </Text>
        </Animated.View>

        {/* Players - Simple list with divider */}
        <View className="w-full max-w-sm">
          <View className="h-px mb-4 bg-gray-200" />
          
          {sortedPlayers.map((player, index) => (
            <AnimatedPlayerRow
              key={player.uid}
              player={player}
              isCurrentUser={player.uid === currentUserId}
              isWinner={player.team === winningTeam}
              animDelay={800 + (index * 100)}
            />
          ))}
        </View>
      </View>

      {/* Bottom Action */}
      {isHost && onRematch && (
        <Animated.View 
          style={{
            transform: [{ translateY: buttonSlide }],
            opacity: buttonOpacity,
          }}
          className="px-6 pt-4 bg-white border-t border-gray-100"
          // @ts-ignore - style prop type
          innerStyle={{ paddingBottom: Math.max(insets.bottom, 16) }}
        >
          <View style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
            <Pressable
              onPress={handleRematchPress}
              className="flex-row items-center justify-center gap-2 py-4 bg-green-500 rounded-xl active:bg-green-600"
            >
              <RotateCcw size={20} color="white" />
              <Text className="text-lg font-bold !text-white">Rematch</Text>
            </Pressable>
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
});

GameSummary.displayName = 'GameSummary';

export type { GameSummaryProps };
