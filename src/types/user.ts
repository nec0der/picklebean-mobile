import type { Timestamp } from 'firebase/firestore';

export interface UserRankings {
  singles: number;
  sameGenderDoubles: number;  // Used for ALL doubles games (same-gender + mixed)
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
  username: string; // Unique username (lowercase, no @)
  email: string;
  displayName: string; // Formatted with @ for display (@username)
  photoURL: string;
  authProvider: 'password' | 'google.com' | 'apple.com'; // How user registered
  isVerified: boolean;
  isAdmin?: boolean;
  isBanned?: boolean;
  status: 'incomplete' | 'pending' | 'approved' | 'declined' | 'changes_requested' | 'banned';
  createdAt: string;
  updatedAt: string;
  // Required profile data (collected during onboarding)
  gender: 'male' | 'female';
  // Optional profile data
  profilePictureUrl?: string;
  dateOfBirth?: string;
  bio?: string;
  links?: string[]; // For later
  adminFeedback?: string;
  // Ranking points (default 1000 each when user is created)
  rankings?: UserRankings;
  // Match statistics (updated when matches are confirmed)
  matchStats?: MatchStats;
  // Profile visibility (default: 'public')
  profileVisibility?: 'public' | 'private';
  // Social features (following system)
  following?: string[];       // Array of user IDs being followed
  followers?: string[];       // Array of user IDs who follow this user
  followingCount?: number;    // Denormalized count for performance
  followersCount?: number;    // Denormalized count for performance
  // Onboarding tracking
  hasSeenTapToPlayOnboarding?: boolean;  // Whether user has seen NFC onboarding
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
