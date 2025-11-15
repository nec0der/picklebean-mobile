/**
 * useMatchActions Hook
 * React wrapper for match service operations
 */

import { useCallback } from 'react';
import * as matchService from '@/services/matchService';
import type { Lobby } from '@/types/lobby';
import type { UserDocument, MatchHistoryRecord } from '@/types/user';

interface UseMatchActionsReturn {
  createMatchRecords: (
    lobby: Lobby,
    users: UserDocument[],
    winningTeam: 'team1' | 'team2'
  ) => Promise<string[]>;
  confirmMatch: (matchId: string, playerId: string) => Promise<void>;
  getPendingMatches: (userId: string) => Promise<MatchHistoryRecord[]>;
  getMatchHistory: (userId: string, limitCount?: number) => Promise<MatchHistoryRecord[]>;
}

/**
 * Hook that provides match action functions
 * Wraps match service functions with useCallback for optimization
 * @returns Object containing all match action functions
 */
export const useMatchActions = (): UseMatchActionsReturn => {
  const createMatchRecords = useCallback(
    async (
      lobby: Lobby,
      users: UserDocument[],
      winningTeam: 'team1' | 'team2'
    ): Promise<string[]> => {
      return matchService.createMatchRecords(lobby, users, winningTeam);
    },
    []
  );

  const confirmMatch = useCallback(async (matchId: string, playerId: string): Promise<void> => {
    return matchService.confirmMatch(matchId, playerId);
  }, []);

  const getPendingMatches = useCallback(
    async (userId: string): Promise<MatchHistoryRecord[]> => {
      return matchService.getPendingMatches(userId);
    },
    []
  );

  const getMatchHistory = useCallback(
    async (userId: string, limitCount = 20): Promise<MatchHistoryRecord[]> => {
      return matchService.getMatchHistory(userId, limitCount);
    },
    []
  );

  return {
    createMatchRecords,
    confirmMatch,
    getPendingMatches,
    getMatchHistory,
  };
};
