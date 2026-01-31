/**
 * CourtPin V1 - LOCKED DESIGN CONTRACT
 * 
 * Core Principle:
 * Avatars represent COURT ACTIVITY, not individuals.
 * They are signals, not profiles.
 * 
 * States:
 * 1. INACTIVE - Gray dot only, no animation
 * 2. SOLO - Single avatar (1 user present)
 * 3. GROUP - Avatar cluster (2+ users, no session)
 * 4. SESSION - Avatar cluster + accent ring (organized activity)
 * 
 * Rules:
 * - Tap → Court bottom sheet (NEVER user profile)
 * - Avatars replace pins, not overlay
 * - Press scale: 96% (down, not up)
 * - No animation on avatar states
 * - Max 3 avatars visible + "+N" overflow
 * - Session indicator takes priority (Intent > Signal)
 */

import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Platform, Image, Animated } from 'react-native';
import { Marker } from 'react-native-maps';
import { Box, Trees } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import type { Court } from '@/types/court';
import type { MapMode } from '@/components/gravity/MapModeToggle';

// =============================================================================
// DESIGN TOKENS (LOCKED V1)
// =============================================================================

const COLORS = {
  // Pin colors
  DOT: '#9CA3AF',             // Neutral gray
  DOT_BORDER: '#FFFFFF',      // White border
  
  // Session indicator
  SESSION_RING: '#3B82F6',    // Brand accent (same as "Create session")
  
  // Overflow pill (V1.1 REFINED - semi-opaque)
  OVERFLOW_BG: 'rgba(55, 65, 81, 0.85)',  // Semi-opaque dark
  OVERFLOW_TEXT: '#FFFFFF',   // White text
} as const;

const SIZES = {
  // Pin dot
  DOT: 16,
  DOT_BORDER: 2.5,
  
  // Avatar sizes (V1.1 REFINED)
  AVATAR_SIZE: 34,            // 32-36pt range for readability
  AVATAR_BORDER: 2,           // Subtle white border for contrast
  AVATAR_OVERLAP: 12,         // Proportional to avatar size
  
  // Container & hit target
  CLUSTER_BASE: 44,           // Apple HIG minimum tap target
  CONTAINER: 80,              // Marker hitbox (larger for social mode)
  
  // Session indicator
  SESSION_RING_WIDTH: 2,
  SESSION_RING_PADDING: 4,
  
  // Overflow pill
  OVERFLOW_HEIGHT: 22,
  OVERFLOW_MIN_WIDTH: 26,
} as const;

const INTERACTION = {
  PRESS_SCALE: 0.96,          // Scale DOWN on press (not up)
} as const;

// =============================================================================
// STATE DERIVATION (V1 Logic)
// =============================================================================

type AvatarState = 'inactive' | 'solo' | 'group' | 'session';

const deriveAvatarState = (court: Court): AvatarState => {
  const { hasActiveSession, activePlayersNow } = court.derived;
  
  // Session takes priority (Intent > Signal)
  if (hasActiveSession) {
    return 'session';
  }
  
  // Group presence (2+ users, casual)
  if (activePlayersNow > 1) {
    return 'group';
  }
  
  // Solo presence (1 user)
  if (activePlayersNow === 1) {
    return 'solo';
  }
  
  // No activity
  return 'inactive';
};

// =============================================================================
// SOCIAL PIN - Avatars + count pill below (Activity mode style)
// =============================================================================

const SOCIAL_PIN_SIZES = {
  AVATAR: 28,
  AVATAR_BORDER: 2.5,
  AVATAR_OVERLAP: 10,
} as const;

interface SingleAvatarProps {
  uri?: string | null;
  isSelected?: boolean;
}

const SingleAvatar = memo(({ uri, isSelected = false }: SingleAvatarProps) => {
  return (
    <View style={singleStyles.container}>
      {/* Single avatar */}
      <View style={singleStyles.avatarContainer}>
        {uri ? (
          <Image source={{ uri }} style={singleStyles.image} />
        ) : (
          <View style={singleStyles.placeholder} />
        )}
      </View>
      {/* Count pill - blue when selected */}
      <View style={[singleStyles.countPill, isSelected && singleStyles.countPillSelected]}>
        <Text style={[singleStyles.countText, isSelected && singleStyles.countTextSelected]}>1</Text>
      </View>
    </View>
  );
});

SingleAvatar.displayName = 'SingleAvatar';

const singleStyles = StyleSheet.create({
  container: {
    width: 70,              // Match cluster width for consistency
    height: 60,             // Avatar + gap + pill
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarContainer: {
    width: SOCIAL_PIN_SIZES.AVATAR,
    height: SOCIAL_PIN_SIZES.AVATAR,
    borderRadius: SOCIAL_PIN_SIZES.AVATAR / 2,
    borderWidth: SOCIAL_PIN_SIZES.AVATAR_BORDER,
    borderColor: '#FFFFFF',
    backgroundColor: '#D1D5DB',
    overflow: 'hidden',
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
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#D1D5DB',
  },
  countPill: {
    minWidth: 22,
    height: 18,
    paddingHorizontal: 6,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
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
    color: '#1F2937',
  },
  countPillSelected: {
    backgroundColor: '#3B82F6',  // Brand blue
  },
  countTextSelected: {
    color: '#FFFFFF',
  },
});

// =============================================================================
// AVATAR CLUSTER - Avatars + count pill below (Activity mode style)
// =============================================================================

interface AvatarClusterProps {
  avatars: string[];
  totalCount: number;
  hasSession: boolean;
  isSelected?: boolean;
}

const AvatarCluster = memo(({ avatars, totalCount, isSelected = false }: AvatarClusterProps) => {
  const displayAvatars = avatars.slice(0, 3);
  
  return (
    <View style={clusterStyles.container}>
      {/* Avatar row */}
      <View style={clusterStyles.avatarRow}>
        {displayAvatars.map((uri, index) => (
          <View
            key={index}
            style={[
              clusterStyles.avatarContainer,
              { 
                marginLeft: index > 0 ? -SOCIAL_PIN_SIZES.AVATAR_OVERLAP : 0,
                zIndex: 3 - index,
              },
            ]}
          >
            {uri ? (
              <Image source={{ uri }} style={clusterStyles.avatar} />
            ) : (
              <View style={clusterStyles.placeholder} />
            )}
          </View>
        ))}
      </View>
      
      {/* Player count pill - blue when selected */}
      <View style={[clusterStyles.countPill, isSelected && clusterStyles.countPillSelected]}>
        <Text style={[clusterStyles.countText, isSelected && clusterStyles.countTextSelected]}>{totalCount}</Text>
      </View>
    </View>
  );
});

AvatarCluster.displayName = 'AvatarCluster';

const clusterStyles = StyleSheet.create({
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
    width: SOCIAL_PIN_SIZES.AVATAR,
    height: SOCIAL_PIN_SIZES.AVATAR,
    borderRadius: SOCIAL_PIN_SIZES.AVATAR / 2,
    borderWidth: SOCIAL_PIN_SIZES.AVATAR_BORDER,
    borderColor: '#FFFFFF',
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
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#D1D5DB',
  },
  countPill: {
    minWidth: 22,
    height: 18,
    paddingHorizontal: 6,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
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
    color: '#1F2937',
  },
  countPillSelected: {
    backgroundColor: '#3B82F6',  // Brand blue
  },
  countTextSelected: {
    color: '#FFFFFF',
  },
});

// =============================================================================
// ACTIVITY INDICATOR (Pulsing dot for Activity mode)
// =============================================================================

// New color scheme: Gray (empty), Green (active), Red (full)
const ACTIVITY_COLORS = {
  FULL: '#EF4444',    // Red - courts are full (100% capacity)
  ACTIVE: '#10B981',  // Green - some activity
  EMPTY: '#9CA3AF',   // Gray - no activity
} as const;

export type OccupancyLevel = 'full' | 'active' | 'empty';

/**
 * Calculate occupancy level based on players and court capacity
 * Full = players >= courts × 4
 */
export const getOccupancyLevel = (
  activePlayersNow: number,
  numberOfCourts: number
): OccupancyLevel => {
  if (activePlayersNow === 0) return 'empty';
  const capacity = numberOfCourts * 4;
  if (activePlayersNow >= capacity) return 'full';
  return 'active';
};

export const getOccupancyColor = (level: OccupancyLevel): string => {
  switch (level) {
    case 'full': return ACTIVITY_COLORS.FULL;
    case 'active': return ACTIVITY_COLORS.ACTIVE;
    case 'empty': return ACTIVITY_COLORS.EMPTY;
  }
};

interface ActivityIndicatorProps {
  occupancyLevel: OccupancyLevel;
  isSelected?: boolean;
}

const ActivityIndicator = memo(({ occupancyLevel, isSelected = false }: ActivityIndicatorProps) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Pulse animation for non-empty courts OR when selected
  useEffect(() => {
    if (occupancyLevel !== 'empty' || isSelected) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [occupancyLevel, isSelected, pulseAnim]);
  
  const color = getOccupancyColor(occupancyLevel);
  // Use blue pulse when selected, otherwise use occupancy color
  const pulseColor = isSelected ? '#3B82F6' : color;
  
  return (
    <View style={activityStyles.container}>
      {/* Pulse ring - blue when selected, occupancy color otherwise */}
      {(occupancyLevel !== 'empty' || isSelected) && (
        <Animated.View 
          style={[
            activityStyles.pulseRing,
            { 
              backgroundColor: pulseColor,
              transform: [{ scale: pulseAnim }],
              opacity: pulseAnim.interpolate({
                inputRange: [1, 1.3],
                outputRange: [isSelected ? 0.5 : 0.4, 0],
              }),
            },
          ]} 
        />
      )}
      {/* Solid dot - always white border */}
      <View style={[
        activityStyles.dot, 
        { backgroundColor: color }
      ]} />
    </View>
  );
});

ActivityIndicator.displayName = 'ActivityIndicator';

const activityStyles = StyleSheet.create({
  container: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',  // Prevent pulse from affecting marker size
  },
  pulseRing: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  dot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 3,
    borderColor: COLORS.DOT_BORDER,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
});

// =============================================================================
// EXPLORE PIN - Icon circle (same size as Activity mode)
// =============================================================================

const EXPLORE_SIZES = {
  CIRCLE: 22,             // Same as activity dot
  CIRCLE_BORDER: 3,       // Same as activity border
  ICON_SIZE: 12,          // Smaller icon to fit 22px circle
} as const;

const EXPLORE_COLORS = {
  INDOOR: '#475569',     // Slate (darker, indoor feel)
  OUTDOOR: '#10B981',    // Green for outdoor
  BG: '#FFFFFF',         // White background
} as const;

interface ExplorePinProps {
  isIndoor: boolean;
  numberOfCourts: number;
  isSelected?: boolean;
}

const ExplorePin = memo(({ isIndoor, isSelected = false }: ExplorePinProps) => {
  const accentColor = isIndoor ? EXPLORE_COLORS.INDOOR : EXPLORE_COLORS.OUTDOOR;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Pulse animation when selected
  useEffect(() => {
    if (isSelected) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [isSelected, pulseAnim]);
  
  return (
    <View style={exploreStyles.container}>
      {/* Blue pulse ring when selected */}
      {isSelected && (
        <Animated.View 
          style={[
            exploreStyles.pulseRing,
            { 
              transform: [{ scale: pulseAnim }],
              opacity: pulseAnim.interpolate({
                inputRange: [1, 1.3],
                outputRange: [0.5, 0],
              }),
            },
          ]} 
        />
      )}
      {/* Icon circle - white core with colored border + colored icon */}
      <View style={[exploreStyles.circle, { borderColor: accentColor }]}>
        {isIndoor ? (
          <Box size={EXPLORE_SIZES.ICON_SIZE} color={accentColor} strokeWidth={2.5} />
        ) : (
          <Trees size={EXPLORE_SIZES.ICON_SIZE} color={accentColor} strokeWidth={2.5} />
        )}
      </View>
    </View>
  );
});

ExplorePin.displayName = 'ExplorePin';

const exploreStyles = StyleSheet.create({
  container: {
    width: 48,              // Match activity mode container EXACTLY
    height: 48,             // Match activity mode container EXACTLY
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  pulseRing: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3B82F6',  // Brand blue
  },
  circle: {
    width: EXPLORE_SIZES.CIRCLE,
    height: EXPLORE_SIZES.CIRCLE,
    borderRadius: EXPLORE_SIZES.CIRCLE / 2,
    borderWidth: EXPLORE_SIZES.CIRCLE_BORDER,
    backgroundColor: EXPLORE_COLORS.BG,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
});

// =============================================================================
// COURT PIN COMPONENT
// =============================================================================

interface CourtPinProps {
  court: Court;
  mode?: MapMode;
  isSelected: boolean;
  onPress: () => void;
}

export const CourtPin = memo(({ court, mode = 'activity', isSelected, onPress }: CourtPinProps) => {
  const avatarState = deriveAvatarState(court);
  const { sessionAvatars = [], activePlayersNow } = court.derived;
  
  // Track if marker is ready to disable tracksViewChanges
  // Start with true (tracking) to ensure initial render, then disable for performance
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 150);
    return () => clearTimeout(timer);
  }, []);
  
  // Handle press with haptic feedback
  const handlePress = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }, [onPress]);
  
  // Derive occupancy level based on capacity (players vs courts × 4)
  const occupancyLevel = getOccupancyLevel(activePlayersNow, court.numberOfCourts);
  
  // Determine visual content based on mode and state
  const renderContent = (): React.ReactNode => {
    // Mode-specific rendering
    switch (mode) {
      case 'activity':
      case 'events':
      case 'train':
        // Show pulsing activity indicators
        return <ActivityIndicator occupancyLevel={occupancyLevel} isSelected={isSelected} />;

      case 'explore':
        // Show facility type icon + court count
        return <ExplorePin isIndoor={court.isIndoor} numberOfCourts={court.numberOfCourts} isSelected={isSelected} />;

      case 'social':
      default:
        // Social mode: Show avatars (original behavior)
        switch (avatarState) {
          case 'solo':
            return <SingleAvatar uri={sessionAvatars[0]} isSelected={isSelected} />;
          case 'group':
            return (
              <AvatarCluster 
                avatars={sessionAvatars} 
                totalCount={activePlayersNow}
                hasSession={false}
                isSelected={isSelected}
              />
            );
          case 'session':
            return (
              <AvatarCluster 
                avatars={sessionAvatars} 
                totalCount={activePlayersNow}
                hasSession={true}
                isSelected={isSelected}
              />
            );
          case 'inactive':
          default:
            return <View style={styles.dot} />;
        }
    }
  };
  
  return (
    <Marker
      coordinate={{
        latitude: court.latitude,
        longitude: court.longitude,
      }}
      onPress={handlePress}
      anchor={{ x: 0.5, y: 0.5 }}
      tracksViewChanges={!isReady}
    >
      <View 
        style={[
          styles.container,
          isSelected && styles.containerSelected,
        ]}
      >
        {renderContent()}
      </View>
    </Marker>
  );
});

CourtPin.displayName = 'CourtPin';

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    width: SIZES.CONTAINER,
    height: SIZES.CONTAINER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Selection handled at dot level, not container
  containerSelected: {},
  
  // Inactive state: Gray dot
  dot: {
    width: SIZES.DOT,
    height: SIZES.DOT,
    borderRadius: SIZES.DOT / 2,
    backgroundColor: COLORS.DOT,
    borderWidth: SIZES.DOT_BORDER,
    borderColor: COLORS.DOT_BORDER,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.12,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
});

export type { CourtPinProps, AvatarState };
