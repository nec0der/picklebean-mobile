import type { Timestamp } from 'firebase/firestore';

export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  rating: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type UserId = string;

export type UserRole = 'player' | 'admin' | 'moderator';

export interface UserProfileUpdate {
  displayName?: string;
  photoURL?: string | null;
}

export interface UserStats {
  gamesPlayed: number;
  wins: number;
  losses: number;
  winRate: number;
  rating: number;
}
