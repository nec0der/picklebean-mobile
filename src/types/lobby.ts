import type { Timestamp } from 'firebase/firestore';

export interface Lobby {
  id: string;
  roomCode: string;
  hostId: string;
  playerIds: string[];
  settings: LobbySettings;
  status: LobbyStatus;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export interface LobbySettings {
  maxPlayers: number;
  gameMode: GameMode;
  scoringSystem: ScoringSystem;
  pointsToWin: number;
}

export type LobbyStatus = 'waiting' | 'starting' | 'active' | 'completed';

export type GameMode = 'singles' | 'doubles';

export type ScoringSystem = 'standard' | 'rally';

export interface LobbyPlayer {
  userId: string;
  displayName: string;
  photoURL: string | null;
  rating: number;
  isReady: boolean;
}
