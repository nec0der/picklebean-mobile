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
  const { team1Score, team2Score, winner, gameDuration } = result;

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

  // Points changes (fixed ±25 points for MVP)
  const winnerPoints = 25;
  const loserPoints = -25;

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
      pointsChange: isWinner ? winnerPoints : loserPoints,
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
      const currentRanking = userData.ranking || 1000;
      const currentWins = userData.wins || 0;
      const currentLosses = userData.losses || 0;
      const currentTotalMatches = userData.totalMatches || 0;

      batch.update(userRef, {
        ranking: currentRanking + (isWinner ? winnerPoints : loserPoints),
        wins: isWinner ? currentWins + 1 : currentWins,
        losses: isWinner ? currentLosses : currentLosses + 1,
        totalMatches: currentTotalMatches + 1,
        lastMatchAt: serverTimestamp(),
      });
    }
  }

  // Update lobby document
  const lobbyRef = doc(firestore, 'lobbies', lobby.roomCode);
  batch.update(lobbyRef, {
    gameCompleted: true,
    gameCompletedAt: serverTimestamp(),
    finalScores: {
      team1: team1Score,
      team2: team2Score,
    },
    winner,
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
