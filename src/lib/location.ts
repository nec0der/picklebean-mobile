/**
 * Location Utilities
 * Phase 1: GPS permission with Cancel vs Deny detection
 * No background tracking - foreground only
 */

import * as Location from 'expo-location';

// Phase 1: 3-state model
export type LocationPreference = 
  | 'undecided'      // Default - never interacted with button
  | 'gps_active'     // Permission granted
  | 'map_preferred'; // Explicit deny OR 3 cancels

export interface LocationState {
  preference: LocationPreference;
}

export interface LocationCoords {
  lat: number;
  lng: number;
}

export interface PermissionResult {
  granted: boolean;
  denied: boolean;   // Explicit deny (can't ask again)
  canceled: boolean; // User dismissed dialog
}

/**
 * Request foreground location permission
 * Shows system permission dialog
 * Returns: granted status
 */
export async function requestLocationPermission(): Promise<boolean> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting location permission:', error);
    return false;
  }
}

/**
 * Check current location permission status
 * Does NOT trigger permission dialog
 */
export async function checkLocationPermission(): Promise<boolean> {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error checking location permission:', error);
    return false;
  }
}

/**
 * Get current device location
 * Requires permission to be granted
 * Timeout: 5 seconds
 * Returns: coordinates or null if unavailable
 */
export async function getCurrentLocation(): Promise<LocationCoords | null> {
  try {
    const hasPermission = await checkLocationPermission();
    if (!hasPermission) {
      return null;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 5000,
    });

    return {
      lat: location.coords.latitude,
      lng: location.coords.longitude,
    };
  } catch (error) {
    console.error('Error getting current location:', error);
    return null;
  }
}

/**
 * Request location permission with Cancel vs Deny detection
 * CRITICAL: Distinguishes between user dismissal and explicit denial
 * 
 * Returns:
 * - granted: Permission was granted
 * - canceled: User dismissed dialog (canAskAgain = true)
 * - denied: User explicitly denied (canAskAgain = false)
 */
export async function requestLocationWithOutcome(): Promise<PermissionResult> {
  try {
    const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();
    
    return {
      granted: status === 'granted',
      denied: !canAskAgain && status !== 'granted',  // Permanent denial
      canceled: canAskAgain && status !== 'granted', // Dismissal
    };
  } catch (error) {
    console.error('Error requesting location permission:', error);
    // On error, treat as cancel (can retry)
    return {
      granted: false,
      denied: false,
      canceled: true,
    };
  }
}
