/**
 * useMatches Hook
 * Real-time user match history listener
 */

import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { firestore } from '@/config/firebase';
import type { MatchHistoryRecord } from '@/types/user';

interface UseMatchesReturn {
  matches: MatchHistoryRecord[];
  loading: boolean;
  error: Error | null;
  hasMore: boolean;
  refetch: () => void;
}

/**
 * Hook to listen to user's match history in real-time
 * @param userId - User ID to get matches for
 * @param limitCount - Maximum number of matches to fetch (default: 20)
 * @param status - Filter by match status (optional)
 * @returns Match history data, loading state, error, and pagination info
 */
export const useMatches = (
  userId: string,
  limitCount = 20,
  status?: 'pending' | 'confirmed' | 'disputed'
): UseMatchesReturn => {
  const [matches, setMatches] = useState<MatchHistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

      // Build query
      let q = query(
        collection(firestore, 'matchHistory'),
        where('playerId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount + 1) // Fetch one extra to check if there are more
      );

      // Add status filter if provided
      if (status) {
        q = query(
          collection(firestore, 'matchHistory'),
          where('playerId', '==', userId),
          where('status', '==', status),
          orderBy('createdAt', 'desc'),
          limit(limitCount + 1)
        );
      }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const matchList = snapshot.docs.slice(0, limitCount).map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as MatchHistoryRecord[];

        setMatches(matchList);
        setHasMore(snapshot.docs.length > limitCount);
        setLoading(false);
      },
      (err) => {
        console.error('Error listening to matches:', err);
        setError(err as Error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId, limitCount, status]);

  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);
  }, []);

  return { matches, loading, error, hasMore, refetch };
};

/**
 * Hook to listen to pending matches only (convenience wrapper)
 */
export const usePendingMatches = (userId: string): UseMatchesReturn => {
  return useMatches(userId, 10, 'pending');
};
