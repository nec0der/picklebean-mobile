import type { Timestamp } from 'firebase/firestore';

export interface UserRankings {
  singles: number;
  sameGenderDoubles: number;
  mixedDoubles: number;
}

export interface MatchStats {
  totalMatches: number;
  wins: number;
  losses: number;
}

export interface MatchHistoryRecord {
  id: string;
  gameId: string;
  playerId: string;
  gameType: 'singles' | 'doubles';
  gameCategory: 'singles' | 'same_gender_doubles' | 'mixed_doubles';
  result: 'win' | 'loss';
  pointsChange: number;
  opponentNames: string[];
  partnerName?: string;
  status: 'pending' | 'confirmed';
  isExhibition?: boolean;
  score?: {
    team1: number;
    team2: number;
  };
  createdAt: Date;
}

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

export interface UserDocument {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  isVerified: boolean;
  isAdmin?: boolean;
  isBanned?: boolean;
  status: 'incomplete' | 'pending' | 'approved' | 'declined' | 'changes_requested' | 'banned';
  createdAt: string;
  updatedAt: string;
  // Profile data (added during onboarding)
  firstName?: string;
  lastName?: string;
  gender?: string;
  dateOfBirth?: string;
  profilePictureUrl?: string;
  adminFeedback?: string;
  // Ranking points (default 1000 each when user is created)
  rankings?: UserRankings;
  // Match statistics (updated when matches are confirmed)
  matchStats?: MatchStats;
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
