/**
 * Recent Searches - AsyncStorage helpers for Telegram-style search
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { RecentSearch } from '@/types/chat';

const RECENT_SEARCHES_KEY = 'chat_recent_searches';
const MAX_RECENT_SEARCHES = 10;

/**
 * Get all recent searches
 */
export const getRecentSearches = async (): Promise<RecentSearch[]> => {
  try {
    const data = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
    if (!data) return [];
    
    const searches: RecentSearch[] = JSON.parse(data);
    // Sort by most recent first
    return searches.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('Error getting recent searches:', error);
    return [];
  }
};

/**
 * Add a search to recent searches
 */
export const addRecentSearch = async (search: Omit<RecentSearch, 'timestamp'>): Promise<void> => {
  try {
    const searches = await getRecentSearches();
    
    // Remove existing entry with same ID if exists
    const filtered = searches.filter(s => s.id !== search.id);
    
    // Add new search at the beginning
    const newSearch: RecentSearch = {
      ...search,
      timestamp: Date.now(),
    };
    
    const updated = [newSearch, ...filtered].slice(0, MAX_RECENT_SEARCHES);
    
    await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error adding recent search:', error);
  }
};

/**
 * Remove a search from recent searches
 */
export const removeRecentSearch = async (id: string): Promise<void> => {
  try {
    const searches = await getRecentSearches();
    const filtered = searches.filter(s => s.id !== id);
    
    await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error removing recent search:', error);
  }
};

/**
 * Clear all recent searches
 */
export const clearRecentSearches = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch (error) {
    console.error('Error clearing recent searches:', error);
  }
};
