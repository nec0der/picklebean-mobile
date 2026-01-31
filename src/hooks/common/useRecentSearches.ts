/**
 * useRecentSearches - Hook for managing recent chat searches
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getRecentSearches,
  addRecentSearch,
  removeRecentSearch,
  clearRecentSearches,
} from '@/lib/recentSearches';
import type { RecentSearch } from '@/types/chat';

interface UseRecentSearchesReturn {
  recentSearches: RecentSearch[];
  loading: boolean;
  addSearch: (search: Omit<RecentSearch, 'timestamp'>) => Promise<void>;
  removeSearch: (id: string) => Promise<void>;
  clearSearches: () => Promise<void>;
  refresh: () => Promise<void>;
}

export const useRecentSearches = (): UseRecentSearchesReturn => {
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [loading, setLoading] = useState(true);

  // Load recent searches on mount
  const loadSearches = useCallback(async (): Promise<void> => {
    try {
      const searches = await getRecentSearches();
      setRecentSearches(searches);
    } catch (error) {
      console.error('Error loading recent searches:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSearches();
  }, [loadSearches]);

  // Add a search
  const addSearch = useCallback(async (search: Omit<RecentSearch, 'timestamp'>): Promise<void> => {
    try {
      await addRecentSearch(search);
      await loadSearches(); // Refresh the list
    } catch (error) {
      console.error('Error adding recent search:', error);
    }
  }, [loadSearches]);

  // Remove a search
  const removeSearch = useCallback(async (id: string): Promise<void> => {
    try {
      await removeRecentSearch(id);
      setRecentSearches(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      console.error('Error removing recent search:', error);
    }
  }, []);

  // Clear all searches
  const clearSearches = useCallback(async (): Promise<void> => {
    try {
      await clearRecentSearches();
      setRecentSearches([]);
    } catch (error) {
      console.error('Error clearing recent searches:', error);
    }
  }, []);

  return {
    recentSearches,
    loading,
    addSearch,
    removeSearch,
    clearSearches,
    refresh: loadSearches,
  };
};
