/**
 * useLeaderboard Hook
 * Real-time leaderboard/rankings listener
 */

import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { firestore } from '@/config/firebase';
import type { UserDocument } from '@/types/user';
import type { GameCategory } from '@/types/lobby';

interface UseLeaderboardReturn {
  rankings: UserDocument[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook to listen to leaderboard rankings in real-time
 * @param category - Game category to get rankings for
 * @param gender - Gender filter ('male' | 'female') - only applies to singles/same_gender_doubles
 * @param limitCount - Maximum number of users to fetch (default: 50)
 * @returns Ranking data, loading state, and error
 */
export const useLeaderboard = (
  category: GameCategory = 'singles',
  gender?: 'male' | 'female',
  limitCount = 50
): UseLeaderboardReturn => {
  const [rankings, setRankings] = useState<UserDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Map game category to rankings field
    const categoryToField: Record<GameCategory, string> = {
      'singles': 'rankings.singles',
      'same_gender_doubles': 'rankings.sameGenderDoubles',
      'mixed_doubles': 'rankings.mixedDoubles',
    };

    const rankingField = categoryToField[category];

    // Build query with gender filter if provided
    let q = query(
      collection(firestore, 'users'),
      orderBy(rankingField, 'desc'),
      limit(limitCount)
    );

    // Add gender filter for singles and same_gender_doubles
    if (gender && category !== 'mixed_doubles') {
      q = query(
        collection(firestore, 'users'),
        where('gender', '==', gender),
        orderBy(rankingField, 'desc'),
        limit(limitCount)
      );
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const userList = snapshot.docs.map((doc) => ({
          uid: doc.id,
          ...doc.data(),
        })) as UserDocument[];

        setRankings(userList);
        setLoading(false);
      },
      (err) => {
        console.error('Error listening to leaderboard:', err);
        setError(err as Error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [category, gender, limitCount]);

  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);
  }, []);

  return { rankings, loading, error, refetch };
};

/**
 * Convenience hooks for specific categories
 */
export const useSinglesLeaderboard = (gender?: 'male' | 'female', limitCount = 50): UseLeaderboardReturn => {
  return useLeaderboard('singles', gender, limitCount);
};

export const useSameGenderDoublesLeaderboard = (gender?: 'male' | 'female', limitCount = 50): UseLeaderboardReturn => {
  return useLeaderboard('same_gender_doubles', gender, limitCount);
};

export const useMixedDoublesLeaderboard = (limitCount = 50): UseLeaderboardReturn => {
  return useLeaderboard('mixed_doubles', undefined, limitCount);
};
