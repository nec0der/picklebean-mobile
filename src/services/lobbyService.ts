/**
 * Lobby Service
 * Firebase operations for lobby management
 */

import {
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  getDoc,
} from 'firebase/firestore';
import { firestore } from '@/config/firebase';
import { generateRoomCode } from '@/lib/roomCode';
import { getTeamAssignment } from '@/lib/validation';
import type { Lobby, Player, GameMode } from '@/types/lobby';

/**
 * Creates a new lobby
 * @param hostId - User ID of the host
 * @param gameMode - Singles or doubles
 * @param hostData - Host player data
 * @returns Room code of created lobby
 */
export const createLobby = async (
  hostId: string,
  gameMode: GameMode,
  hostData: Player
): Promise<string> => {
  const roomCode = generateRoomCode();

  const lobbyData: Lobby = {
    roomCode,
    hostId,
    gameMode,
    team1: {
      player1: hostData,
    },
    team2: {},
    waitingPlayers: [],
    gameStarted: false,
    isExhibition: false,
    createdAt: serverTimestamp() as any,
    lastActivity: serverTimestamp() as any,
  };

  await setDoc(doc(firestore, 'lobbies', roomCode), lobbyData);

  return roomCode;
};

/**
 * Joins an existing lobby
 * @param roomCode - Room code to join
 * @param playerData - Player data
 * @returns Updated lobby or null if join failed
 */
export const joinLobby = async (
  roomCode: string,
  playerData: Player
): Promise<Lobby | null> => {
  const lobbyRef = doc(firestore, 'lobbies', roomCode);
  const lobbySnap = await getDoc(lobbyRef);

  if (!lobbySnap.exists()) {
    throw new Error('Lobby not found');
  }

  const lobby = lobbySnap.data() as Lobby;
  const teamAssignment = getTeamAssignment(lobby);

  if (teamAssignment === 'team1') {
    const updateData: any = {
      lastActivity: serverTimestamp(),
    };

    if (!lobby.team1.player1) {
      updateData['team1.player1'] = playerData;
    } else {
      updateData['team1.player2'] = playerData;
    }

    await updateDoc(lobbyRef, updateData);
  } else if (teamAssignment === 'team2') {
    const updateData: any = {
      lastActivity: serverTimestamp(),
    };

    if (!lobby.team2.player1) {
      updateData['team2.player1'] = playerData;
    } else {
      updateData['team2.player2'] = playerData;
    }

    await updateDoc(lobbyRef, updateData);
  } else {
    // Add to waiting list
    await updateDoc(lobbyRef, {
      waitingPlayers: arrayUnion(playerData),
      lastActivity: serverTimestamp(),
    });
  }

  const updatedSnap = await getDoc(lobbyRef);
  return updatedSnap.data() as Lobby;
};

/**
 * Leaves a lobby
 * @param roomCode - Room code to leave
 * @param userId - User ID leaving
 */
export const leaveLobby = async (roomCode: string, userId: string): Promise<void> => {
  const lobbyRef = doc(firestore, 'lobbies', roomCode);
  const lobbySnap = await getDoc(lobbyRef);

  if (!lobbySnap.exists()) {
    return;
  }

  const lobby = lobbySnap.data() as Lobby;
  const updates: any = { lastActivity: serverTimestamp() };

  // Remove from teams
  if (lobby.team1.player1?.uid === userId) {
    updates['team1.player1'] = null;
  }
  if (lobby.team1.player2?.uid === userId) {
    updates['team1.player2'] = null;
  }
  if (lobby.team2.player1?.uid === userId) {
    updates['team2.player1'] = null;
  }
  if (lobby.team2.player2?.uid === userId) {
    updates['team2.player2'] = null;
  }

  // Remove from waiting list
  if (lobby.waitingPlayers) {
    const playerInWaiting = lobby.waitingPlayers.find((p) => p.uid === userId);
    if (playerInWaiting) {
      updates.waitingPlayers = arrayRemove(playerInWaiting);
    }
  }

  await updateDoc(lobbyRef, updates);
};

/**
 * Deletes a lobby
 * @param roomCode - Room code to delete
 */
export const deleteLobby = async (roomCode: string): Promise<void> => {
  await deleteDoc(doc(firestore, 'lobbies', roomCode));
};

/**
 * Starts a game in a lobby
 * @param roomCode - Room code to start game in
 */
export const startGame = async (roomCode: string): Promise<void> => {
  await updateDoc(doc(firestore, 'lobbies', roomCode), {
    gameStarted: true,
    gameStartedAt: serverTimestamp(),
    lastActivity: serverTimestamp(),
  });
};

/**
 * Ends a game in a lobby
 * @param roomCode - Room code
 * @param scores - Final scores
 */
export const endGame = async (
  roomCode: string,
  scores: { team1: number; team2: number }
): Promise<void> => {
  await updateDoc(doc(firestore, 'lobbies', roomCode), {
    gameCompleted: true,
    gameCompletedAt: serverTimestamp(),
    finalScores: scores,
    lastActivity: serverTimestamp(),
  });
};

/**
 * Updates score confirmation for a player
 * @param roomCode - Room code
 * @param playerId - Player ID confirming
 * @param confirmed - Confirmation status
 */
export const confirmScore = async (
  roomCode: string,
  playerId: string,
  confirmed: boolean
): Promise<void> => {
  await updateDoc(doc(firestore, 'lobbies', roomCode), {
    [`scoreConfirmations.${playerId}`]: confirmed,
    lastActivity: serverTimestamp(),
  });
};

/**
 * Toggles exhibition match status
 * @param roomCode - Room code
 * @param isExhibition - Exhibition status
 */
export const setExhibitionMatch = async (
  roomCode: string,
  isExhibition: boolean
): Promise<void> => {
  await updateDoc(doc(firestore, 'lobbies', roomCode), {
    isExhibition,
    lastActivity: serverTimestamp(),
  });
};

/**
 * Cancels an active match
 * @param roomCode - Room code
 * @param cancelledBy - User ID of host cancelling
 * @param reason - Optional reason for cancellation
 */
export const cancelMatch = async (
  roomCode: string,
  cancelledBy: string,
  reason?: string
): Promise<void> => {
  await updateDoc(doc(firestore, 'lobbies', roomCode), {
    cancelled: true,
    cancelledAt: serverTimestamp(),
    cancelledBy,
    cancelReason: reason || null,
    gameCompleted: true,  // Mark as completed so it doesn't show in pending games
    gameCompletedAt: serverTimestamp(),
    lastActivity: serverTimestamp(),
  });
};

/**
 * Creates a rematch lobby with same players and settings
 * @param previousLobby - The completed lobby to rematch
 * @returns New room code
 */
export const createRematch = async (previousLobby: Lobby): Promise<string> => {
  const newRoomCode = generateRoomCode();

  // Create new lobby with same settings and players
  // Only include player2 fields if they exist (prevents undefined in Firestore)
  const rematchLobby: Lobby = {
    roomCode: newRoomCode,
    hostId: previousLobby.hostId,
    gameMode: previousLobby.gameMode,
    team1: {
      player1: previousLobby.team1.player1,
      ...(previousLobby.team1.player2 && { player2: previousLobby.team1.player2 }),
    },
    team2: {
      player1: previousLobby.team2.player1,
      ...(previousLobby.team2.player2 && { player2: previousLobby.team2.player2 }),
    },
    waitingPlayers: [],
    gameStarted: false,
    isExhibition: previousLobby.isExhibition || false,
    isRematch: true,
    originalRoomCode: previousLobby.roomCode,
    createdAt: serverTimestamp() as any,
    lastActivity: serverTimestamp() as any,
  };

  await setDoc(doc(firestore, 'lobbies', newRoomCode), rematchLobby);

  return newRoomCode;
};
