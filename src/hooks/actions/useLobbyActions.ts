/**
 * useLobbyActions Hook
 * React wrapper for lobby service operations
 */

import { useCallback } from 'react';
import * as lobbyService from '@/services/lobbyService';
import type { Player, GameMode, Lobby } from '@/types/lobby';

interface UseLobbyActionsReturn {
  createLobby: (hostId: string, gameMode: GameMode, hostData: Player) => Promise<string>;
  joinLobby: (roomCode: string, playerData: Player) => Promise<Lobby | null>;
  leaveLobby: (roomCode: string, userId: string) => Promise<void>;
  deleteLobby: (roomCode: string) => Promise<void>;
  startGame: (roomCode: string) => Promise<void>;
  endGame: (roomCode: string, scores: { team1: number; team2: number }) => Promise<void>;
  confirmScore: (roomCode: string, playerId: string, confirmed: boolean) => Promise<void>;
}

/**
 * Hook that provides lobby action functions
 * Wraps lobby service functions with useCallback for optimization
 * @returns Object containing all lobby action functions
 */
export const useLobbyActions = (): UseLobbyActionsReturn => {
  const createLobby = useCallback(
    async (hostId: string, gameMode: GameMode, hostData: Player): Promise<string> => {
      return lobbyService.createLobby(hostId, gameMode, hostData);
    },
    []
  );

  const joinLobby = useCallback(
    async (roomCode: string, playerData: Player): Promise<Lobby | null> => {
      return lobbyService.joinLobby(roomCode, playerData);
    },
    []
  );

  const leaveLobby = useCallback(async (roomCode: string, userId: string): Promise<void> => {
    return lobbyService.leaveLobby(roomCode, userId);
  }, []);

  const deleteLobby = useCallback(async (roomCode: string): Promise<void> => {
    return lobbyService.deleteLobby(roomCode);
  }, []);

  const startGame = useCallback(async (roomCode: string): Promise<void> => {
    return lobbyService.startGame(roomCode);
  }, []);

  const endGame = useCallback(
    async (roomCode: string, scores: { team1: number; team2: number }): Promise<void> => {
      return lobbyService.endGame(roomCode, scores);
    },
    []
  );

  const confirmScore = useCallback(
    async (roomCode: string, playerId: string, confirmed: boolean): Promise<void> => {
      return lobbyService.confirmScore(roomCode, playerId, confirmed);
    },
    []
  );

  return {
    createLobby,
    joinLobby,
    leaveLobby,
    deleteLobby,
    startGame,
    endGame,
    confirmScore,
  };
};
