import type { Timestamp } from 'firebase/firestore';
import type { GameMode, ScoringSystem } from './lobby';

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
  scoringSystem: ScoringSystem;
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
  duration: number; // in seconds
  createdAt: Timestamp;
}

export interface GameStats {
  totalPoints: number;
  longestRally?: number;
  duration: number;
}
