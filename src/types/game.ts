import type { Timestamp } from 'firebase/firestore';
import type { GameMode, GameCategory } from './lobby';

export interface Game {
  id: string;
  lobbyId: string;
  playerIds: string[];
  scores: GameScores;
  status: GameStatus;
  settings: GameSettings;
  startedAt: Timestamp;
  completedAt?: Timestamp;
  winnerId?: string;
}

export interface GameSettings {
  gameMode: GameMode;
  pointsToWin: number;
}

export interface GameScores {
  [playerId: string]: number;
}

export type GameStatus = 'active' | 'paused' | 'completed' | 'cancelled';

export interface Match {
  id: string;
  playerIds: string[];
  scores: GameScores;
  winnerId: string;
  gameMode: GameMode;
  gameCategory: GameCategory;
  isExhibition: boolean;
  duration: number; // in seconds
  createdAt: Timestamp;
  // Match confirmation fields
  status: 'pending' | 'confirmed' | 'disputed';
  confirmations?: { [playerId: string]: boolean };
  confirmedAt?: Timestamp;
}

export interface MatchConfirmation {
  matchId: string;
  playerId: string;
  confirmed: boolean;
  confirmedAt: Timestamp;
}

export interface GameStats {
  totalPoints: number;
  longestRally?: number;
  duration: number;
}

// Deprecated (keeping for backward compatibility)
export type ScoringSystem = 'standard' | 'rally';
