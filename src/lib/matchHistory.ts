/**
 * Match History Utilities
 * Functions for creating match records and updating player rankings
 */

import { collection, doc, writeBatch, serverTimestamp, getDoc } from 'firebase/firestore';
import { firestore } from '@/config/firebase';
import type { Lobby } from '@/types/lobby';
import { calculatePointsChange } from './points';

interface MatchResult {
  team1Score: number;
  team2Score: number;
  winner: 1 | 2;
  gameDuration: number; // in seconds
  pointChanges: {
    team1: number;  // Points for team 1 players (can be + or -)
    team2: number;  // Points for team 2 players (can be + or -)
  };
  stakesSnapshot?: {
    team1Win: number;
    team1Loss: number;
    team2Win: number;
    team2Loss: number;
  };
}

/**
 * Creates match history records for all players and updates rankings
 * @param lobby - The lobby/game that just finished
 * @param result - Final scores and winner
 */
export const completeMatch = async (
  lobby: Lobby,
  result: MatchResult
): Promise<void> => {
  const batch = writeBatch(firestore);
  const { team1Score, team2Score, winner, gameDuration, pointChanges, stakesSnapshot } = result;

  // Get all player IDs
  const team1PlayerIds: string[] = [];
  const team2PlayerIds: string[] = [];

  if (lobby.team1.player1?.uid) team1PlayerIds.push(lobby.team1.player1.uid);
  if (lobby.team1.player2?.uid) team1PlayerIds.push(lobby.team1.player2.uid);
  if (lobby.team2.player1?.uid) team2PlayerIds.push(lobby.team2.player1.uid);
  if (lobby.team2.player2?.uid) team2PlayerIds.push(lobby.team2.player2.uid);

  const allPlayerIds = [...team1PlayerIds, ...team2PlayerIds];

  // Determine winners and losers
  const winnerPlayerIds = winner === 1 ? team1PlayerIds : team2PlayerIds;
  const loserPlayerIds = winner === 1 ? team2PlayerIds : team1PlayerIds;

  // Use REAL calculated point changes (not hardcoded ±25)
  const team1Points = pointChanges.team1;
  const team2Points = pointChanges.team2;

  // Create match records for each player
  for (const playerId of allPlayerIds) {
    const isWinner = winnerPlayerIds.includes(playerId);
    const isTeam1 = team1PlayerIds.includes(playerId);
    
    // Get opponent IDs
    const opponentIds = isTeam1 ? team2PlayerIds : team1PlayerIds;
    
    // Get partner ID (if doubles)
    const teammateIds = isTeam1 
      ? team1PlayerIds.filter(id => id !== playerId)
      : team2PlayerIds.filter(id => id !== playerId);
    const partnerId = teammateIds.length > 0 ? teammateIds[0] : undefined;

    // Get player and opponent names
    const playerData = await getPlayerData(lobby, playerId);
    const opponentNames = await getOpponentNames(lobby, opponentIds);
    const partnerName = partnerId ? await getPlayerName(lobby, partnerId) : undefined;

    // Create match record
    const matchRef = doc(collection(firestore, 'matchHistory'));
    batch.set(matchRef, {
      gameId: lobby.roomCode,
      playerId,
      gameType: lobby.gameMode,
      result: isWinner ? 'win' : 'loss',
      score: {
        team1: team1Score,
        team2: team2Score,
      },
      pointsChange: isTeam1 ? team1Points : team2Points,
      opponentIds,
      opponentNames,
      // Only include partnerId and partnerName for doubles (avoid undefined in Firestore)
      ...(partnerId ? { partnerId, partnerName } : {}),
      duration: gameDuration,
      status: 'confirmed',
      createdAt: serverTimestamp(),
    });

    // Update player ranking and stats
    const userRef = doc(firestore, 'users', playerId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      
      // Determine which ranking category to update based on game mode and category
      const rankingCategory = lobby.gameMode === 'singles' ? 'singles' :
                             'sameGenderDoubles';  // Both same-gender and mixed use sameGenderDoubles
      
      // Get current values from nested objects
      const currentRankings = userData.rankings || { singles: 1000, sameGenderDoubles: 1000 };
      const currentRanking = currentRankings[rankingCategory] || 1000;
      const currentMatchStats = userData.matchStats || { wins: 0, losses: 0, totalMatches: 0 };

      // Use the actual calculated points for this player's team
      const playerPoints = isTeam1 ? team1Points : team2Points;
      
      // Update using nested field paths
      batch.update(userRef, {
        [`rankings.${rankingCategory}`]: currentRanking + playerPoints,
        'matchStats.wins': isWinner ? currentMatchStats.wins + 1 : currentMatchStats.wins,
        'matchStats.losses': isWinner ? currentMatchStats.losses : currentMatchStats.losses + 1,
        'matchStats.totalMatches': currentMatchStats.totalMatches + 1,
        lastMatchAt: serverTimestamp(),
      });
    }
  }

  // Update lobby document with real point changes
  const lobbyRef = doc(firestore, 'lobbies', lobby.roomCode);
  batch.update(lobbyRef, {
    gameCompleted: true,
    gameCompletedAt: serverTimestamp(),
    finalScores: {
      team1: team1Score,
      team2: team2Score,
    },
    winner,
    pointChanges: {
      team1: team1Points,
      team2: team2Points,
    },
    ...(stakesSnapshot && { stakesSnapshot }),
    lastActivity: new Date(),
  });

  // Commit all changes
  await batch.commit();
};

/**
 * Gets player data from lobby
 */
const getPlayerData = async (lobby: Lobby, playerId: string): Promise<{ name: string }> => {
  const allPlayers = [
    lobby.team1.player1,
    lobby.team1.player2,
    lobby.team2.player1,
    lobby.team2.player2,
  ].filter(Boolean);

  const player = allPlayers.find(p => p?.uid === playerId);
  return {
    name: player?.displayName || 'Unknown',
  };
};

/**
 * Gets player name from lobby
 */
const getPlayerName = async (lobby: Lobby, playerId: string): Promise<string> => {
  const data = await getPlayerData(lobby, playerId);
  return data.name;
};

/**
 * Gets opponent names from lobby
 */
const getOpponentNames = async (lobby: Lobby, opponentIds: string[]): Promise<string[]> => {
  const names: string[] = [];
  
  for (const id of opponentIds) {
    const name = await getPlayerName(lobby, id);
    names.push(name);
  }
  
  return names;
};

/**
 * Calculates game duration from start time
 */
export const calculateGameDuration = (gameStartedAt: Date): number => {
  const now = Date.now();
  const start = gameStartedAt.getTime();
  return Math.floor((now - start) / 1000); // Duration in seconds
};
