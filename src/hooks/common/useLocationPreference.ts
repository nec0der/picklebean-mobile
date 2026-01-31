/**
 * Location Preference Hook
 * Simplified: Just tracks preference (undecided | gps_active | map_preferred)
 * Persists to AsyncStorage
 */

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { LocationPreference, LocationState } from '@/lib/location';

const LOCATION_STATE_KEY = '@location_state_v2';

const DEFAULT_STATE: LocationState = {
  preference: 'undecided',
};

interface UseLocationPreferenceReturn {
  state: LocationState;
  setPreference: (pref: LocationPreference) => Promise<void>;
  loading: boolean;
}

export function useLocationPreference(): UseLocationPreferenceReturn {
  const [state, setState] = useState<LocationState>(DEFAULT_STATE);
  const [loading, setLoading] = useState(true);

  // Load state on mount
  useEffect(() => {
    loadState();
  }, []);

  const loadState = async () => {
    try {
      const stored = await AsyncStorage.getItem(LOCATION_STATE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as LocationState;
        setState(parsed);
      }
    } catch (error) {
      console.error('Error loading location state:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveState = async (newState: LocationState) => {
    try {
      await AsyncStorage.setItem(LOCATION_STATE_KEY, JSON.stringify(newState));
      setState(newState);
    } catch (error) {
      console.error('Error saving location state:', error);
    }
  };

  const setPreference = useCallback(async (pref: LocationPreference) => {
    const newState: LocationState = {
      preference: pref,
    };
    await saveState(newState);
  }, []);

  return {
    state,
    setPreference,
    loading,
  };
}
