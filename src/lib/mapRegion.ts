/**
 * Map region persistence utilities
 * Saves and restores map position using AsyncStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Region } from 'react-native-maps';

const MAP_REGION_KEY = '@picklebean:lastMapRegion';

// Default: Chicago region (close zoom for Gravity map)
export const DEFAULT_MAP_REGION: Region = {
  latitude: 41.8781,    // Chicago downtown
  longitude: -87.6298,
  latitudeDelta: 0.2,   // Metro-level zoom
  longitudeDelta: 0.2,
};

export interface MapRegionLoadResult {
  region: Region;
  hasSaved: boolean;
}

/**
 * Load saved map region from storage
 * @returns Saved region (if any) and whether it was loaded from storage
 */
export const loadMapRegion = async (): Promise<MapRegionLoadResult> => {
  try {
    const saved = await AsyncStorage.getItem(MAP_REGION_KEY);
    
    if (saved) {
      const region = JSON.parse(saved) as Region;
      return { region, hasSaved: true };
    }
    
    return { region: DEFAULT_MAP_REGION, hasSaved: false };
  } catch (error) {
    console.error('Error loading map region:', error);
    return { region: DEFAULT_MAP_REGION, hasSaved: false };
  }
};

/**
 * Save map region to storage
 * @param region - Map region to save
 */
export const saveMapRegion = async (region: Region): Promise<void> => {
  try {
    await AsyncStorage.setItem(MAP_REGION_KEY, JSON.stringify(region));
  } catch (error) {
    console.error('Error saving map region:', error);
  }
};
