/**
 * useSearchUsers - Hook for searching users globally
 * With debouncing for performance
 */

import { useState, useEffect, useCallback } from 'react';
import { searchUsers, UserSearchResult } from '@/services/userService';
import { useAuth } from '@/contexts/AuthContext';

interface UseSearchUsersReturn {
  results: UserSearchResult[];
  loading: boolean;
  error: Error | null;
  search: (query: string) => void;
}

const DEBOUNCE_DELAY = 300;

export const useSearchUsers = (excludeUserIds: string[] = []): UseSearchUsersReturn => {
  const { userDocument } = useAuth();
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Always exclude current user
  const allExcludeIds = userDocument?.uid 
    ? [...excludeUserIds, userDocument.uid]
    : excludeUserIds;

  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const timer = setTimeout(async () => {
      try {
        const searchResults = await searchUsers(searchQuery, allExcludeIds, 10);
        setResults(searchResults);
      } catch (err) {
        console.error('Error searching users:', err);
        setError(err as Error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(timer);
  }, [searchQuery, allExcludeIds.join(',')]);

  const search = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  return {
    results,
    loading,
    error,
    search,
  };
};

export type { UseSearchUsersReturn };
