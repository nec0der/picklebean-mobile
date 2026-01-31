/**
 * User Service
 * Firebase operations for user profile management
 */

import { doc, updateDoc, serverTimestamp, getDoc, collection, query, where, orderBy, limit, getDocs, or } from 'firebase/firestore';
import { firestore } from '@/config/firebase';
import { getDefaultRankings, updateRankings } from '@/lib/points';
import type { UserDocument, UserRankings, MatchStats } from '@/types/user';
import type { GameCategory } from '@/types/lobby';

/**
 * Updates user profile information
 * @param userId - User ID
 * @param updates - Profile fields to update
 */
export const updateUserProfile = async (
  userId: string,
  updates: Partial<UserDocument>
): Promise<void> => {
  await updateDoc(doc(firestore, 'users', userId), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

/**
 * Updates user rankings after a confirmed match
 * @param userId - User ID
 * @param category - Game category
 * @param pointsChange - Points to add/subtract
 */
export const updateUserRankings = async (
  userId: string,
  category: GameCategory,
  pointsChange: number
): Promise<void> => {
  const userRef = doc(firestore, 'users', userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    throw new Error('User not found');
  }

  const userData = userSnap.data() as UserDocument;
  const currentRankings = userData.rankings || getDefaultRankings();

  // Map game category to rankings key
  const categoryToRankingKey: Record<GameCategory, keyof UserRankings> = {
    'singles': 'singles',
    'same_gender_doubles': 'sameGenderDoubles',
    'mixed_doubles': 'sameGenderDoubles',  // Map mixed to sameGenderDoubles
  };

  const rankingKey = categoryToRankingKey[category];
  const newRankings = updateRankings(currentRankings, rankingKey, pointsChange);

  await updateDoc(userRef, {
    rankings: newRankings,
    updatedAt: serverTimestamp(),
  });
};

/**
 * Updates user match statistics
 * @param userId - User ID
 * @param result - Match result ('win' or 'loss')
 */
export const updateMatchStats = async (
  userId: string,
  result: 'win' | 'loss'
): Promise<void> => {
  const userRef = doc(firestore, 'users', userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    throw new Error('User not found');
  }

  const userData = userSnap.data() as UserDocument;
  const currentStats: MatchStats = userData.matchStats || {
    totalMatches: 0,
    wins: 0,
    losses: 0,
  };

  const newStats: MatchStats = {
    totalMatches: currentStats.totalMatches + 1,
    wins: result === 'win' ? currentStats.wins + 1 : currentStats.wins,
    losses: result === 'loss' ? currentStats.losses + 1 : currentStats.losses,
  };

  await updateDoc(userRef, {
    matchStats: newStats,
    updatedAt: serverTimestamp(),
  });
};

/**
 * Initializes default rankings for a new user
 * @param userId - User ID
 */
export const initializeUserRankings = async (userId: string): Promise<void> => {
  await updateDoc(doc(firestore, 'users', userId), {
    rankings: getDefaultRankings(),
    matchStats: {
      totalMatches: 0,
      wins: 0,
      losses: 0,
    },
    updatedAt: serverTimestamp(),
  });
};

/**
 * Gets user document
 * @param userId - User ID
 * @returns User document or null
 */
export const getUserDocument = async (userId: string): Promise<UserDocument | null> => {
  const userSnap = await getDoc(doc(firestore, 'users', userId));

  if (!userSnap.exists()) {
    return null;
  }

  return { uid: userSnap.id, ...userSnap.data() } as UserDocument;
};

/**
 * Updates user verification status (admin only)
 * @param userId - User ID
 * @param status - New status
 * @param feedback - Optional admin feedback
 */
export const updateVerificationStatus = async (
  userId: string,
  status: UserDocument['status'],
  feedback?: string
): Promise<void> => {
  const updates: any = {
    status,
    updatedAt: serverTimestamp(),
  };

  if (feedback) {
    updates.adminFeedback = feedback;
  }

  if (status === 'approved') {
    updates.isVerified = true;
  }

  await updateDoc(doc(firestore, 'users', userId), updates);
};

/**
 * Marks that user has seen Tap-to-Play onboarding
 * @param userId - User ID
 */
export const markTapToPlayOnboardingSeen = async (userId: string): Promise<void> => {
  await updateDoc(doc(firestore, 'users', userId), {
    hasSeenTapToPlayOnboarding: true,
    updatedAt: serverTimestamp(),
  });
};

/**
 * Search result item type for user search
 */
export interface UserSearchResult {
  uid: string;
  username: string;
  displayName: string;
  photoURL: string | null;
}

/**
 * Search for users by username or displayName
 * @param searchTerm - Search term (min 2 characters)
 * @param excludeUserIds - User IDs to exclude from results
 * @param resultLimit - Max number of results (default 10)
 * @returns Array of matching users
 */
export const searchUsers = async (
  searchTerm: string,
  excludeUserIds: string[] = [],
  resultLimit = 10
): Promise<UserSearchResult[]> => {
  if (!searchTerm || searchTerm.length < 2) {
    return [];
  }

  const lowerTerm = searchTerm.toLowerCase();
  
  // Search by usernameLower (case-insensitive prefix search)
  const q = query(
    collection(firestore, 'users'),
    where('usernameLower', '>=', lowerTerm),
    where('usernameLower', '<=', lowerTerm + '\uf8ff'),
    limit(resultLimit + excludeUserIds.length)
  );

  const snapshot = await getDocs(q);
  const results: UserSearchResult[] = [];

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    // Exclude specified users
    if (!excludeUserIds.includes(docSnap.id)) {
      results.push({
        uid: docSnap.id,
        username: data.username || '',
        displayName: data.displayName || data.username || 'Unknown',
        photoURL: data.photoURL || null,
      });
    }
  });

  // Also search by displayName if we have fewer results
  if (results.length < resultLimit) {
    const displayNameQuery = query(
      collection(firestore, 'users'),
      where('displayName', '>=', searchTerm),
      where('displayName', '<=', searchTerm + '\uf8ff'),
      limit(resultLimit)
    );

    const displayNameSnapshot = await getDocs(displayNameQuery);
    displayNameSnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const existingIds = results.map(r => r.uid);
      // Avoid duplicates and excluded users
      if (!existingIds.includes(docSnap.id) && !excludeUserIds.includes(docSnap.id)) {
        results.push({
          uid: docSnap.id,
          username: data.username || '',
          displayName: data.displayName || data.username || 'Unknown',
          photoURL: data.photoURL || null,
        });
      }
    });
  }

  return results.slice(0, resultLimit);
};
