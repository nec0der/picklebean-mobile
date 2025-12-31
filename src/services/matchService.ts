/**
 * Match Service
 * Firebase operations for match history and confirmations
 */

import {
  collection,
  doc,
  setDoc,
  updateDoc,
  serverTimestamp,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { firestore } from '@/config/firebase';
import { calculatePointsChange, calculateDoublesPointsChange } from '@/lib/points';
import type { Lobby, GameCategory } from '@/types/lobby';
import type { Match } from '@/types/game';
import type { MatchHistoryRecord, UserDocument } from '@/types/user';

/**
 * Determines game category based on lobby and player genders
 * @param lobby - Lobby data
 * @param users - User documents for all players
 * @returns Game category
 */
export const determineGameCategory = (
  lobby: Lobby,
  users: UserDocument[]
): GameCategory => {
  if (lobby.gameMode === 'singles') {
    return 'singles';
  }

  // Doubles - check gender composition
  const genders = users.map((u) => u.gender).filter(Boolean);

  const allMale = genders.every((g) => g === 'male');
  const allFemale = genders.every((g) => g === 'female');

  if (allMale || allFemale) {
    return 'same_gender_doubles';
  }

  return 'same_gender_doubles';  // Default to same_gender_doubles
};

/**
 * Creates match history records for all players
 * @param lobby - Completed lobby
 * @param users - All player user documents
 * @param winningTeam - Which team won ('team1' or 'team2')
 * @returns Array of created match IDs
 */
export const createMatchRecords = async (
  lobby: Lobby,
  users: UserDocument[],
  winningTeam: 'team1' | 'team2'
): Promise<string[]> => {
  const gameCategory = determineGameCategory(lobby, users);
  const matchIds: string[] = [];

  const allPlayers = [
    lobby.team1.player1,
    lobby.team1.player2,
    lobby.team2.player1,
    lobby.team2.player2,
  ].filter(Boolean);

  // Calculate points change
  let pointsChange = 0;

  if (lobby.gameMode === 'singles') {
    const winner = users.find((u) => u.uid === (winningTeam === 'team1' ? lobby.team1.player1?.uid : lobby.team2.player1?.uid));
    const loser = users.find((u) => u.uid === (winningTeam === 'team1' ? lobby.team2.player1?.uid : lobby.team1.player1?.uid));

    if (winner && loser) {
      const rankingKey = gameCategory === 'singles' ? 'singles' : 'sameGenderDoubles';
      const winnerRating = winner.rankings?.[rankingKey] || 1000;
      const loserRating = loser.rankings?.[rankingKey] || 1000;
      const winnerGames = winner.matchStats?.totalMatches || 0;
      const loserGames = loser.matchStats?.totalMatches || 0;
      pointsChange = calculatePointsChange(winnerRating, loserRating, winnerGames, loserGames);
    }
  } else {
    // Doubles
    const team1Users = users.filter((u) => 
      u.uid === lobby.team1.player1?.uid || u.uid === lobby.team1.player2?.uid
    );
    const team2Users = users.filter((u) =>
      u.uid === lobby.team2.player1?.uid || u.uid === lobby.team2.player2?.uid
    );

    if (team1Users.length === 2 && team2Users.length === 2) {
      // Map game category to rankings key
      const categoryToRankingKey: Record<GameCategory, keyof import('@/types/user').UserRankings> = {
        'singles': 'singles',
        'same_gender_doubles': 'sameGenderDoubles',
        'mixed_doubles': 'sameGenderDoubles',  // Map mixed to sameGenderDoubles
      };
      
      const rankingKey = categoryToRankingKey[gameCategory];
      pointsChange = calculateDoublesPointsChange(
        team1Users[0].rankings?.[rankingKey] || 1000,
        team1Users[1].rankings?.[rankingKey] || 1000,
        team1Users[0].matchStats?.totalMatches || 0,
        team1Users[1].matchStats?.totalMatches || 0,
        team2Users[0].rankings?.[rankingKey] || 1000,
        team2Users[1].rankings?.[rankingKey] || 1000,
        team2Users[0].matchStats?.totalMatches || 0,
        team2Users[1].matchStats?.totalMatches || 0,
        winningTeam === 'team1'
      );
    }
  }

  // Create match history for each player
  for (const player of allPlayers) {
    if (!player) continue;

    const isWinner = (winningTeam === 'team1' && (player.uid === lobby.team1.player1?.uid || player.uid === lobby.team1.player2?.uid)) ||
                     (winningTeam === 'team2' && (player.uid === lobby.team2.player1?.uid || player.uid === lobby.team2.player2?.uid));

    const opponents = allPlayers.filter((p) => {
      if (!p) return false;
      if (isWinner) {
        return p.uid === lobby.team2.player1?.uid || p.uid === lobby.team2.player2?.uid;
      } else {
        return p.uid === lobby.team1.player1?.uid || p.uid === lobby.team1.player2?.uid;
      }
    }).map((p) => p!.displayName.split(' ')[0]);

    let partnerName: string | undefined;
    if (lobby.gameMode === 'doubles') {
      const partner = allPlayers.find((p) => {
        if (!p || p.uid === player.uid) return false;
        if (isWinner) {
          return p.uid === lobby.team1.player1?.uid || p.uid === lobby.team1.player2?.uid;
        } else {
          return p.uid === lobby.team2.player1?.uid || p.uid === lobby.team2.player2?.uid;
        }
      });
      partnerName = partner ? partner.displayName.split(' ')[0] : undefined;
    }

    const matchRecord: MatchHistoryRecord = {
      id: '',
      gameId: lobby.roomCode,
      playerId: player.uid,
      gameType: lobby.gameMode,
      gameCategory,
      result: isWinner ? 'win' : 'loss',
      pointsChange: isWinner ? pointsChange : -pointsChange,
      opponentNames: opponents,
      partnerName,
      status: 'pending',
      createdAt: new Date(),
    };

    const matchRef = doc(collection(firestore, 'matches'));
    matchRecord.id = matchRef.id;

    await setDoc(matchRef, {
      ...matchRecord,
      createdAt: serverTimestamp(),
    });

    matchIds.push(matchRef.id);
  }

  return matchIds;
};

/**
 * Confirms a match for a specific player
 * @param matchId - Match ID to confirm
 * @param playerId - Player ID confirming
 */
export const confirmMatch = async (matchId: string, playerId: string): Promise<void> => {
  await updateDoc(doc(firestore, 'matches', matchId), {
    status: 'confirmed',
    confirmedAt: serverTimestamp(),
  });
};

/**
 * Gets pending matches for a user
 * @param userId - User ID
 * @returns Array of pending matches
 */
export const getPendingMatches = async (userId: string): Promise<MatchHistoryRecord[]> => {
  const q = query(
    collection(firestore, 'matches'),
    where('playerId', '==', userId),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc'),
    limit(10)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id } as MatchHistoryRecord));
};

/**
 * Gets match history for a user
 * @param userId - User ID
 * @param limitCount - Number of matches to fetch
 * @returns Array of match records
 */
export const getMatchHistory = async (
  userId: string,
  limitCount = 20
): Promise<MatchHistoryRecord[]> => {
  const q = query(
    collection(firestore, 'matches'),
    where('playerId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id } as MatchHistoryRecord));
};
