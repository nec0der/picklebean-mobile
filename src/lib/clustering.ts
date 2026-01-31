/**
 * Court Clustering Algorithm V2
 * 
 * Pixel-distance based clustering that detects when pins would visually collide.
 * Different algorithms for each map mode based on pin sizes.
 * 
 * Activity mode: 28px pins (22px dot + 3px border)
 * Explore mode: 36px pins (icon circles)
 * Social mode: 60-80px (avatar clusters)
 */

import { Dimensions } from 'react-native';
import type { Court } from '@/types/court';
import type { MapMode } from '@/components/gravity/MapModeToggle';

// =============================================================================
// TYPES
// =============================================================================

export interface CourtCluster {
  id: string;
  latitude: number;
  longitude: number;
  courts: Court[];
  totalPlayers: number;
  totalAvatars: string[];
}

export type ClusterOrCourt = 
  | { type: 'court'; data: Court }
  | { type: 'cluster'; data: CourtCluster };

// =============================================================================
// MODE-SPECIFIC CLUSTERING CONFIGURATION
// =============================================================================

// Each mode has its own:
// - dimensions: The actual visual size of the pin
// - clusterPadding: Extra padding added to trigger clustering before overlap
//   - Higher value = cluster sooner (more aggressive)
//   - 0 = cluster only when pins actually touch
//   - Negative = allow some overlap before clustering

interface PinDimensions {
  width: number;
  height: number;
}

interface ModeConfig {
  dimensions: PinDimensions;
  clusterPadding: number;  // Extra pixels added to collision radius
}

/**
 * MODE-SPECIFIC CONFIGURATIONS
 * 
 * These are tuned independently so changing one mode doesn't affect others.
 * 
 * Activity (22px dots):
 *   - Small pins need generous padding to prevent visual overlap
 *   - Padding of 10 means cluster when pins are within 32px (22+10)
 * 
 * Explore (36px icons):
 *   - Medium pins, moderate padding
 * 
 * Social (70x60 avatar clusters):
 *   - Large pins, minimal padding since they're already big
 */
const MODE_CONFIG: Record<MapMode, ModeConfig> = {
  activity: { 
    dimensions: { width: 22, height: 22 },
    clusterPadding: 10,  // Generous - cluster pins that are "close"
  },
  explore: { 
    dimensions: { width: 22, height: 22 },  // Same as activity (22px icon circles)
    clusterPadding: 10,  // Same as activity
  },
  events: {
    dimensions: { width: 22, height: 22 },
    clusterPadding: 10,
  },
  train: {
    dimensions: { width: 22, height: 22 },
    clusterPadding: 10,
  },
  social: { 
    dimensions: { width: 70, height: 60 },
    clusterPadding: 0,   // Only on actual overlap (working well)
  },
} as const;

// =============================================================================
// PIXEL DISTANCE CALCULATION
// =============================================================================

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Calculate the pixel distance between two coordinates at a given zoom level
 * 
 * @param lat1 - Latitude of first point
 * @param lng1 - Longitude of first point
 * @param lat2 - Latitude of second point
 * @param lng2 - Longitude of second point
 * @param latitudeDelta - Current map latitudeDelta (zoom level)
 * @returns Distance in screen pixels
 */
const getPixelDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
  latitudeDelta: number
): number => {
  // Calculate degrees per pixel based on current zoom
  const degreesPerPixel = latitudeDelta / SCREEN_WIDTH;
  
  // Calculate lat/lng difference
  const latDiff = Math.abs(lat1 - lat2);
  const lngDiff = Math.abs(lng1 - lng2);
  
  // Convert to pixels (Pythagorean theorem)
  const latPixels = latDiff / degreesPerPixel;
  const lngPixels = lngDiff / degreesPerPixel;
  
  return Math.sqrt(latPixels * latPixels + lngPixels * lngPixels);
};

// Legacy function removed - using positionsCollideEllipse with mode config instead

// =============================================================================
// CLUSTERING ALGORITHM V3 - Iterative Merging
// =============================================================================

/**
 * Calculate center point of a group of courts
 */
const calculateCenter = (courts: Court[]): { lat: number; lng: number } => {
  const sum = courts.reduce(
    (acc, court) => ({
      lat: acc.lat + court.latitude,
      lng: acc.lng + court.longitude,
    }),
    { lat: 0, lng: 0 }
  );
  return {
    lat: sum.lat / courts.length,
    lng: sum.lng / courts.length,
  };
};

/**
 * Get pixel offsets between two positions
 * Returns { dx, dy } in screen pixels
 * 
 * Uses actual map region deltas for accurate conversion:
 * - latitudeDelta spans SCREEN_HEIGHT (vertical)
 * - longitudeDelta spans SCREEN_WIDTH (horizontal)
 */
const getPixelOffsets = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
  latitudeDelta: number,
  longitudeDelta: number
): { dx: number; dy: number } => {
  // Vertical: latitudeDelta spans screen height
  const degreesPerPixelY = latitudeDelta / SCREEN_HEIGHT;
  
  // Horizontal: longitudeDelta spans screen width
  const degreesPerPixelX = longitudeDelta / SCREEN_WIDTH;
  
  // dx = horizontal (longitude), dy = vertical (latitude)
  const dx = Math.abs(lng1 - lng2) / degreesPerPixelX;
  const dy = Math.abs(lat1 - lat2) / degreesPerPixelY;
  
  return { dx, dy };
};

/**
 * Check if two positions would collide using ELLIPTICAL collision detection
 * 
 * For circular pins: (dx² + dy²) < r²
 * For elliptical pins: (dx/rx)² + (dy/ry)² < 1
 * 
 * This accounts for rectangular pin shapes (like social mode avatar clusters)
 * 
 * @param clusterPadding - Extra pixels to add to collision radius (mode-specific)
 */
const positionsCollideEllipse = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
  latitudeDelta: number,
  longitudeDelta: number,
  dimensions: PinDimensions,
  clusterPadding: number
): boolean => {
  const { dx, dy } = getPixelOffsets(lat1, lng1, lat2, lng2, latitudeDelta, longitudeDelta);
  
  // Effective radii = pin size + padding (cluster sooner with higher padding)
  // Two pins touch when dx < width, so we use full width + padding
  const rx = dimensions.width + clusterPadding;
  const ry = dimensions.height + clusterPadding;
  
  // Ellipse collision formula: (dx/rx)² + (dy/ry)² < 1 means inside ellipse
  // We want to check if centers are close enough that pins overlap
  const normalizedX = dx / rx;
  const normalizedY = dy / ry;
  
  return (normalizedX * normalizedX + normalizedY * normalizedY) < 1;
};

/**
 * Create a cluster from multiple courts
 */
const createCluster = (courts: Court[]): CourtCluster => {
  const center = calculateCenter(courts);
  const totalPlayers = courts.reduce(
    (sum, c) => sum + c.derived.activePlayersNow,
    0
  );
  
  // Collect avatars from most active courts first
  const allAvatars: string[] = [];
  courts.forEach(c => {
    (c.derived.sessionAvatars || []).forEach(avatar => {
      if (allAvatars.length < 5 && !allAvatars.includes(avatar)) {
        allAvatars.push(avatar);
      }
    });
  });
  
  return {
    id: `cluster-${courts.map(c => c.id).join('-')}`,
    latitude: center.lat,
    longitude: center.lng,
    courts,
    totalPlayers,
    totalAvatars: allAvatars,
  };
};

/**
 * Cluster courts using ITERATIVE collision detection
 * 
 * Algorithm:
 * 1. Start with all courts as individual items
 * 2. Find any two items that collide
 * 3. Merge them into a cluster (with new center position)
 * 4. Repeat until no more collisions exist
 * 
 * This ensures clusters properly merge with other clusters/courts
 * when their new center position causes overlap.
 */
export const clusterCourts = (
  courts: Court[],
  latitudeDelta: number,
  longitudeDelta: number,
  mode: MapMode = 'activity'
): ClusterOrCourt[] => {
  if (courts.length === 0) return [];
  
  // Get mode-specific configuration (dimensions + padding)
  const config = MODE_CONFIG[mode];
  const { dimensions, clusterPadding } = config;
  
  // Start with all courts as individual items
  // Store as { lat, lng, courts[] } for uniform handling
  type WorkItem = {
    latitude: number;
    longitude: number;
    courts: Court[];
  };
  
  let items: WorkItem[] = courts.map(court => ({
    latitude: court.latitude,
    longitude: court.longitude,
    courts: [court],
  }));
  
  // Iteratively merge colliding items until no more collisions
  let mergeOccurred = true;
  const MAX_ITERATIONS = 100; // Safety limit
  let iterations = 0;
  
  while (mergeOccurred && iterations < MAX_ITERATIONS) {
    mergeOccurred = false;
    iterations++;
    
    // Find first pair that collides
    for (let i = 0; i < items.length && !mergeOccurred; i++) {
      for (let j = i + 1; j < items.length && !mergeOccurred; j++) {
        const itemA = items[i];
        const itemB = items[j];
        
        // Use elliptical collision detection with mode-specific padding
        if (positionsCollideEllipse(
          itemA.latitude,
          itemA.longitude,
          itemB.latitude,
          itemB.longitude,
          latitudeDelta,
          longitudeDelta,
          dimensions,
          clusterPadding
        )) {
          // Merge items[i] and items[j]
          const mergedCourts = [...itemA.courts, ...itemB.courts];
          const newCenter = calculateCenter(mergedCourts);
          
          // Replace item i with merged item
          items[i] = {
            latitude: newCenter.lat,
            longitude: newCenter.lng,
            courts: mergedCourts,
          };
          
          // Remove item j
          items.splice(j, 1);
          
          mergeOccurred = true;
        }
      }
    }
  }
  
  // Convert WorkItems to ClusterOrCourt
  return items.map(item => {
    if (item.courts.length === 1) {
      return { type: 'court' as const, data: item.courts[0] };
    } else {
      return { type: 'cluster' as const, data: createCluster(item.courts) };
    }
  });
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get activity level for a cluster (for color coding)
 */
export const getClusterActivityLevel = (
  totalPlayers: number
): 'high' | 'medium' | 'low' => {
  if (totalPlayers >= 20) return 'high';
  if (totalPlayers >= 8) return 'medium';
  return 'low';
};

/**
 * Get color for activity level
 */
export const getActivityColor = (level: 'high' | 'medium' | 'low'): string => {
  switch (level) {
    case 'high': return '#10B981';   // Green
    case 'medium': return '#F59E0B'; // Yellow/Orange
    case 'low': return '#9CA3AF';    // Gray
  }
};
