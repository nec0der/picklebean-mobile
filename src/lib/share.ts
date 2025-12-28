/**
 * Share utility functions
 * Formats and shares match results
 */

import { Share, Platform } from 'react-native';
import type { Lobby } from '@/types/lobby';

/**
 * Formats match result message for sharing
 */
export const formatMatchResult = (
  lobby: Lobby,
  playerName: string,
  playerPointsChange: number
): string => {
  if (!lobby.finalScores || !lobby.winner) {
    return '';
  }

  const { team1, team2 } = lobby.finalScores;
  const isWinner = playerPointsChange > 0;
  const gameMode = lobby.gameMode === 'singles' ? 'Singles (1v1)' : 'Doubles (2v2)';

  const message = `🏓 Picklebean Match Result

${isWinner ? '🏆 VICTORY!' : '💪 Great Game!'}

Final Score: ${team1} - ${team2}
Mode: ${gameMode}

My Ranking: ${playerPointsChange > 0 ? '+' : ''}${playerPointsChange} points ${playerPointsChange > 0 ? '📈' : '📉'}

Play with me! Download Picklebean
picklebean.app`;

  return message;
};

/**
 * Shares match result using native share sheet
 */
export const shareMatchResult = async (
  lobby: Lobby,
  playerName: string,
  playerPointsChange: number
): Promise<void> => {
  try {
    const message = formatMatchResult(lobby, playerName, playerPointsChange);

    const result = await Share.share({
      message,
      title: 'Picklebean Match Result',
    });

    if (result.action === Share.sharedAction) {
      if (result.activityType) {
        // Shared with activity type
        console.log('Shared via:', result.activityType);
      } else {
        // Shared
        console.log('Match result shared successfully');
      }
    } else if (result.action === Share.dismissedAction) {
      // Dismissed
      console.log('Share sheet dismissed');
    }
  } catch (error) {
    console.error('Error sharing match result:', error);
    throw error;
  }
};
