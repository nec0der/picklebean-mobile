/**
 * Location Hook
 * Phase 1: Button-driven GPS with map center fallback
 * Returns appropriate location for Play Now engine
 */

import { useState, useCallback } from 'react';
import type { LocationCoords, LocationPreference } from '@/lib/location';
import { getCurrentLocation, checkLocationPermission } from '@/lib/location';
import type MapView from 'react-native-maps';

interface UseLocationParams {
  preference: LocationPreference;
  mapCenter: LocationCoords | null;
}

interface UseLocationReturn {
  location: LocationCoords | null;     // Current best location
  gpsLocation: LocationCoords | null;  // GPS coords (if available)
  isUsingGPS: boolean;                 // True if GPS active
  isLoading: boolean;                  // GPS fetch in progress
  fetchGPS: () => Promise<LocationCoords | null>; // Manual GPS fetch
  recenterMap: (mapRef: React.RefObject<MapView>) => void; // Helper for button
}

export function useLocation({ preference, mapCenter }: UseLocationParams): UseLocationReturn {
  const [gpsLocation, setGpsLocation] = useState<LocationCoords | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Manual GPS fetch (called by LocationButton)
  const fetchGPS = useCallback(async (): Promise<LocationCoords | null> => {
    setIsLoading(true);
    try {
      const hasPermission = await checkLocationPermission();
      if (!hasPermission) {
        setGpsLocation(null);
        return null;
      }

      const location = await getCurrentLocation();
      setGpsLocation(location);
      return location;
    } catch (error) {
      console.error('Error fetching GPS location:', error);
      setGpsLocation(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Recenter map on GPS location (called by LocationButton when gps_active)
  // Accepts optional coords to use directly (avoids stale closure issues)
  const recenterMap = useCallback((mapRef: React.RefObject<MapView>, coords?: LocationCoords | null) => {
    const location = coords ?? gpsLocation;
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.lat,
        longitude: location.lng,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }, 300);
    }
  }, [gpsLocation]);

  // Determine best location source
  let finalLocation: LocationCoords | null = null;
  let isUsingGPS = false;

  if (preference === 'gps_active' && gpsLocation) {
    // GPS mode with successful GPS fetch
    finalLocation = gpsLocation;
    isUsingGPS = true;
  } else if (mapCenter) {
    // Fallback to map center (works for all states)
    finalLocation = mapCenter;
    isUsingGPS = false;
  }

  return {
    location: finalLocation,
    gpsLocation,
    isUsingGPS,
    isLoading,
    fetchGPS,
    recenterMap,
  };
}
