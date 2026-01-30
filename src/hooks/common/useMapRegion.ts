/**
 * Hook for managing map region state with persistence
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Region } from 'react-native-maps';
import { loadMapRegion, saveMapRegion, DEFAULT_MAP_REGION } from '@/lib/mapRegion';
import { checkLocationPermission, getCurrentLocation } from '@/lib/location';

interface UseMapRegionReturn {
  region: Region;
  updateRegion: (newRegion: Region) => void;
}

/**
 * Manages map region with AsyncStorage persistence
 * Loads saved region on mount, saves changes with debounce
 */
export const useMapRegion = (): UseMapRegionReturn => {
  const [region, setRegion] = useState<Region>(DEFAULT_MAP_REGION);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);
  const INITIAL_GPS_DELTA = 0.05;

  // Load saved region on mount
  useEffect(() => {
    const initializeRegion = async () => {
      const { region: savedRegion, hasSaved } = await loadMapRegion();
      if (!isMountedRef.current) return;

      if (hasSaved) {
        setRegion(savedRegion);
        return;
      }

      try {
        const hasPermission = await checkLocationPermission();
        if (hasPermission) {
          const gps = await getCurrentLocation();
          if (gps && isMountedRef.current) {
            const gpsRegion: Region = {
              latitude: gps.lat,
              longitude: gps.lng,
              latitudeDelta: INITIAL_GPS_DELTA,
              longitudeDelta: INITIAL_GPS_DELTA,
            };
            setRegion(gpsRegion);
            await saveMapRegion(gpsRegion);
            return;
          }
        }
      } catch (error) {
        console.error('Error initializing map region with GPS:', error);
      }

      // Fallback to default (Chicago) when GPS is unavailable
      if (isMountedRef.current) {
        setRegion(savedRegion);
      }
    };

    initializeRegion();

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Update region and save after debounce
  const updateRegion = useCallback((newRegion: Region) => {
    setRegion(newRegion);

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Save after 1 second of inactivity
    saveTimeoutRef.current = setTimeout(() => {
      saveMapRegion(newRegion);
    }, 1000);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return { region, updateRegion };
};
