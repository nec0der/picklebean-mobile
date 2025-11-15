import type { Timestamp } from 'firebase/firestore';

export interface Player {
  uid: string;
  displayName: string;
  photoURL?: string;
}

export interface Team {
  player1?: Player;
  player2?: Player;
}

export interface Lobby {
  roomCode: string;
  hostId: string;
  gameMode: 'singles' | 'doubles';
  team1: Team;
  team2: Team;
  waitingPlayers?: Player[];
  gameStarted: boolean;
  gameStartedAt?: Timestamp;
  gameCompleted?: boolean;
  gameCompletedAt?: Timestamp;
  finalScores?: {
    team1: number;
    team2: number;
  };
  scoreConfirmations?: { [playerId: string]: boolean };
  // Exhibition match fields
  isExhibition?: boolean;
  gameCategory?: 'singles' | 'same_gender_doubles' | 'mixed_doubles';
  // Countdown fields
  countdownActive?: boolean;
  countdownValue?: number | 'GO';
  createdAt: Timestamp;
  lastActivity: Timestamp;
}

export type GameMode = 'singles' | 'doubles';

export type GameCategory = 'singles' | 'same_gender_doubles' | 'mixed_doubles';

export type LobbyStatus = 'waiting' | 'starting' | 'active' | 'completed';

// Deprecated interfaces (keeping for backward compatibility if needed)
export interface LobbySettings {
  maxPlayers: number;
  gameMode: GameMode;
  scoringSystem: ScoringSystem;
  pointsToWin: number;
}

export type ScoringSystem = 'standard' | 'rally';

export interface LobbyPlayer {
  userId: string;
  displayName: string;
  photoURL: string | null;
  rating: number;
  isReady: boolean;
}
