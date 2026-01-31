/**
 * ClusterPin - Multi-mode cluster visualization
 * 
 * Renders differently based on map mode:
 * - Activity: Stacked dots showing occupancy mix (red/green/gray) + court count
 * - Social: Avatar stack with player count
 * - Explore: Circle with court count (neutral)
 */

import { memo, useCallback, useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, Image } from 'react-native';
import { Marker } from 'react-native-maps';
import * as Haptics from 'expo-haptics';
import type { CourtCluster } from '@/lib/clustering';
import type { MapMode } from '@/components/gravity/MapModeToggle';
import { getOccupancyLevel, getOccupancyColor, type OccupancyLevel } from '@/components/gravity/CourtPin';

// =============================================================================
// DESIGN TOKENS
// =============================================================================

const COLORS = {
  WHITE: '#FFFFFF',
  NEUTRAL: '#6B7280',       // Gray for Explore mode
  TEXT_DARK: '#1F2937',
  AVATAR_BORDER: '#FFFFFF',
} as const;

const SIZES = {
  CONTAINER: 80,          // Larger for social mode (70x60 content)
  CIRCLE: 44,
  AVATAR: 28,
  AVATAR_OVERLAP: 10,
} as const;

// =============================================================================
// ACTIVITY CLUSTER - Stacked dots showing occupancy mix + court count
// Shows up to 3 colored dots (full=red, active=green, empty=gray)
// =============================================================================

interface OccupancyCounts {
  full: number;
  active: number;
  empty: number;
}

interface ActivityClusterProps {
  cluster: CourtCluster;
  isSelected?: boolean;
}

const ActivityCluster = memo(({ cluster, isSelected = false }: ActivityClusterProps) => {
  // Calculate occupancy breakdown for all courts in cluster
  const occupancyCounts = useMemo((): OccupancyCounts => {
    const counts: OccupancyCounts = { full: 0, active: 0, empty: 0 };
    cluster.courts.forEach(court => {
      const level = getOccupancyLevel(
        court.derived.activePlayersNow,
        court.numberOfCourts
      );
      counts[level]++;
    });
    return counts;
  }, [cluster.courts]);
  
  // Build array of dots to display (order: red > green > gray)
  const dots = useMemo((): OccupancyLevel[] => {
    const result: OccupancyLevel[] = [];
    if (occupancyCounts.full > 0) result.push('full');
    if (occupancyCounts.active > 0) result.push('active');
    if (occupancyCounts.empty > 0) result.push('empty');
    return result.slice(0, 3); // Max 3 dots
  }, [occupancyCounts]);
  
  const DOT_SIZE = 22;   // Match individual activity pin size
  const DOT_OVERLAP = 10; // Closer together
  
  return (
    <View style={activityStyles.container}>
      {/* Stacked dots showing occupancy mix */}
      <View style={activityStyles.dotsRow}>
        {dots.map((level, index) => (
          <View
            key={level}
            style={[
              activityStyles.dot,
              {
                backgroundColor: getOccupancyColor(level),
                marginLeft: index > 0 ? -DOT_OVERLAP : 0,
                zIndex: 3 - index,
                width: DOT_SIZE,
                height: DOT_SIZE,
                borderRadius: DOT_SIZE / 2,
              },
            ]}
          />
        ))}
      </View>
      
      {/* Court count pill below dots */}
      <View style={activityStyles.countPill}>
        <Text style={activityStyles.countText}>{cluster.courts.length}</Text>
      </View>
    </View>
  );
});

ActivityCluster.displayName = 'ActivityCluster';

const activityStyles = StyleSheet.create({
  container: {
    width: 50,              // Fixed size - CRITICAL for stable marker
    height: 50,             // Fixed size - CRITICAL for stable marker
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',     // Prevent content from affecting marker bounds
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    borderWidth: 2.5,
    borderColor: COLORS.WHITE,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  countPill: {
    minWidth: 22,
    height: 18,
    paddingHorizontal: 6,
    borderRadius: 9,
    backgroundColor: COLORS.WHITE,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.TEXT_DARK,
  },
});

// =============================================================================
// SOCIAL CLUSTER - Avatars + count pill below (Activity mode style)
// =============================================================================

const SOCIAL_SIZES = {
  AVATAR: 28,
  AVATAR_BORDER: 2.5,
  AVATAR_OVERLAP: 10,
} as const;

interface SocialClusterProps {
  avatars: string[];
  totalPlayers: number;
}

const SocialCluster = memo(({ avatars, totalPlayers }: SocialClusterProps) => {
  const displayAvatars = avatars.slice(0, 3);
  
  return (
    <View style={socialStyles.container}>
      {/* Avatar row */}
      <View style={socialStyles.avatarRow}>
        {displayAvatars.map((avatar, index) => (
          <View
            key={index}
            style={[
              socialStyles.avatarContainer,
              { 
                marginLeft: index > 0 ? -SOCIAL_SIZES.AVATAR_OVERLAP : 0,
                zIndex: 3 - index,
              },
            ]}
          >
            <Image source={{ uri: avatar }} style={socialStyles.avatar} />
          </View>
        ))}
      </View>
      
      {/* Player count pill below (like activity mode) */}
      <View style={socialStyles.countPill}>
        <Text style={socialStyles.countText}>{totalPlayers}</Text>
      </View>
    </View>
  );
});

SocialCluster.displayName = 'SocialCluster';

const socialStyles = StyleSheet.create({
  container: {
    width: 70,              // 3 avatars: 28 + (28-10) + (28-10) = 64px + padding
    height: 60,             // Avatars (28) + gap + pill (18) = ~50px + padding
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarContainer: {
    width: SOCIAL_SIZES.AVATAR,
    height: SOCIAL_SIZES.AVATAR,
    borderRadius: SOCIAL_SIZES.AVATAR / 2,
    borderWidth: SOCIAL_SIZES.AVATAR_BORDER,
    borderColor: COLORS.WHITE,
    overflow: 'hidden',
    backgroundColor: '#D1D5DB',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  countPill: {
    minWidth: 22,
    height: 18,
    paddingHorizontal: 6,
    borderRadius: 9,
    backgroundColor: COLORS.WHITE,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.TEXT_DARK,
  },
});

// =============================================================================
// EXPLORE CLUSTER - Stacked icon circles (same size as Activity cluster)
// =============================================================================

import { Box, Trees } from 'lucide-react-native';

const EXPLORE_SIZES = {
  CIRCLE: 22,             // Same as activity dot
  CIRCLE_BORDER: 3,       // Same as activity border
  CIRCLE_OVERLAP: 10,     // Same as activity overlap
  ICON_SIZE: 12,          // Smaller icon to fit 22px circle
} as const;

const EXPLORE_COLORS = {
  INDOOR: '#475569',     // Slate (darker, indoor feel)
  OUTDOOR: '#10B981',    // Green for outdoor
  BG: '#FFFFFF',         // White background
} as const;

interface ExploreClusterProps {
  cluster: CourtCluster;
}

const ExploreCluster = memo(({ cluster }: ExploreClusterProps) => {
  // Count indoor/outdoor courts to determine which icons to show
  const indoorCount = cluster.courts.filter(c => c.isIndoor).length;
  const outdoorCount = cluster.courts.filter(c => !c.isIndoor).length;
  
  // Show up to 3 icons: prioritize showing both types if mixed
  const icons: Array<{ type: 'indoor' | 'outdoor'; key: string }> = [];
  
  if (indoorCount > 0 && outdoorCount > 0) {
    // Mixed: show one of each, then the dominant type
    icons.push({ type: 'indoor', key: 'indoor-1' });
    icons.push({ type: 'outdoor', key: 'outdoor-1' });
    if (indoorCount > outdoorCount) {
      icons.push({ type: 'indoor', key: 'indoor-2' });
    } else {
      icons.push({ type: 'outdoor', key: 'outdoor-2' });
    }
  } else if (indoorCount > 0) {
    // All indoor
    for (let i = 0; i < Math.min(3, indoorCount); i++) {
      icons.push({ type: 'indoor', key: `indoor-${i}` });
    }
  } else {
    // All outdoor
    for (let i = 0; i < Math.min(3, outdoorCount); i++) {
      icons.push({ type: 'outdoor', key: `outdoor-${i}` });
    }
  }
  
  return (
    <View style={exploreStyles.container}>
      {/* Stacked icon circles - same size as activity dots */}
      <View style={exploreStyles.iconsRow}>
        {icons.map((icon, index) => {
          const isIndoor = icon.type === 'indoor';
          const iconColor = isIndoor ? EXPLORE_COLORS.INDOOR : EXPLORE_COLORS.OUTDOOR;
          const borderColor = isIndoor ? EXPLORE_COLORS.INDOOR : EXPLORE_COLORS.OUTDOOR;
          
          return (
            <View
              key={icon.key}
              style={[
                exploreStyles.iconCircle,
                { 
                  borderColor,
                  marginLeft: index > 0 ? -EXPLORE_SIZES.CIRCLE_OVERLAP : 0,
                  zIndex: 3 - index,
                },
              ]}
            >
              {isIndoor ? (
                <Box size={EXPLORE_SIZES.ICON_SIZE} color={iconColor} strokeWidth={2.5} />
              ) : (
                <Trees size={EXPLORE_SIZES.ICON_SIZE} color={iconColor} strokeWidth={2.5} />
              )}
            </View>
          );
        })}
      </View>
      
      {/* Court count pill below */}
      <View style={exploreStyles.countPill}>
        <Text style={exploreStyles.countText}>{cluster.courts.length}</Text>
      </View>
    </View>
  );
});

ExploreCluster.displayName = 'ExploreCluster';

const exploreStyles = StyleSheet.create({
  container: {
    width: 50,              // Match activity cluster container EXACTLY
    height: 50,             // Match activity cluster container EXACTLY
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  iconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: EXPLORE_SIZES.CIRCLE,
    height: EXPLORE_SIZES.CIRCLE,
    borderRadius: EXPLORE_SIZES.CIRCLE / 2,
    backgroundColor: EXPLORE_COLORS.BG,
    borderWidth: EXPLORE_SIZES.CIRCLE_BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  countPill: {
    minWidth: 22,
    height: 18,
    paddingHorizontal: 6,
    borderRadius: 9,
    backgroundColor: COLORS.WHITE,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.TEXT_DARK,
  },
});

// =============================================================================
// MAIN CLUSTER PIN COMPONENT
// =============================================================================

interface ClusterPinProps {
  cluster: CourtCluster;
  mode: MapMode;
  isSelected?: boolean;
  onPress: () => void;
}

export const ClusterPin = memo(({ cluster, mode, isSelected = false, onPress }: ClusterPinProps) => {
  // Track if marker is ready to disable tracksViewChanges
  // Start with true (tracking) to ensure initial render, then disable for performance
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 150);
    return () => clearTimeout(timer);
  }, []);
  
  const handlePress = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  }, [onPress]);
  
  const renderContent = (): React.ReactNode => {
    switch (mode) {
      case 'activity':
      case 'events':
      case 'train':
        return (
          <ActivityCluster cluster={cluster} isSelected={isSelected} />
        );

      case 'social':
        return (
          <SocialCluster 
            avatars={cluster.totalAvatars} 
            totalPlayers={cluster.totalPlayers} 
          />
        );

      case 'explore':
      default:
        return (
          <ExploreCluster cluster={cluster} />
        );
    }
  };
  
  return (
    <Marker
      coordinate={{
        latitude: cluster.latitude,
        longitude: cluster.longitude,
      }}
      onPress={handlePress}
      anchor={{ x: 0.5, y: 0.5 }}
      tracksViewChanges={!isReady}
    >
      <View style={[styles.container, isSelected && styles.containerSelected]}>
        {renderContent()}
      </View>
    </Marker>
  );
});

ClusterPin.displayName = 'ClusterPin';

// =============================================================================
// BASE STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Selection handled at dot level, not container
  containerSelected: {},
});

export type { ClusterPinProps };
