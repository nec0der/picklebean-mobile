/**
 * SocialClusterPin - Shows grouped users at a court location
 * 
 * Design: Light pill container with max 2 overlapping avatars + plain count
 */

import { memo, useCallback } from 'react';
import { View, Text, StyleSheet, Platform, Image } from 'react-native';
import { Marker } from 'react-native-maps';
import * as Haptics from 'expo-haptics';
import type { CourtCluster, CheckedInUser } from '@/mocks/socialData';

// =============================================================================
// DESIGN TOKENS
// =============================================================================

const COLORS = {
  PILL_BG: '#FFFFFF',         // Light/white background
  AVATAR_BORDER: '#D1D5DB',   // Light gray border (gray-300)
  COUNT_TEXT: '#1F2937',      // Dark text for count
  CALLOUT_BG: '#FFFFFF',
  TEXT_PRIMARY: '#1F2937',
  TEXT_SECONDARY: '#6B7280',
} as const;

const SIZES = {
  AVATAR: 36,
  AVATAR_BORDER: 2,
  AVATAR_OVERLAP: 12,         // How much avatars overlap
  PILL_HEIGHT: 44,
  PILL_PADDING_H: 2,
  CONTAINER: 120,             // Large enough to fit full pill width
} as const;

// =============================================================================
// COMPONENT
// =============================================================================

interface SocialClusterPinProps {
  cluster: CourtCluster;
  onPress?: (cluster: CourtCluster) => void;
}

export const SocialClusterPin = memo(({ cluster, onPress }: SocialClusterPinProps) => {
  const { users, latitude, longitude, courtName } = cluster;
  
  const handlePress = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.(cluster);
  }, [cluster, onPress]);
  
  // Get display avatars (max 2) and count
  const displayAvatars = users.slice(0, 2);
  const remainingCount = users.length - displayAvatars.length;
  const showCount = remainingCount > 0;
  
  // Calculate pill width based on content
  const avatarSectionWidth = displayAvatars.length === 1 
    ? SIZES.AVATAR 
    : SIZES.AVATAR * 2 - SIZES.AVATAR_OVERLAP;
  
  return (
    <Marker
      coordinate={{ latitude, longitude }}
      onPress={handlePress}
      anchor={{ x: 0.5, y: 0.5 }}
      centerOffset={{ x: 0, y: -30 }}
      tracksViewChanges={false}
    >
      <View style={styles.container}>
        <View style={styles.pill}>
          {/* Avatars */}
          <View style={[styles.avatarSection, { width: avatarSectionWidth }]}>
            {displayAvatars.map((user, index) => (
              <View
                key={user.id}
                style={[
                  styles.avatarContainer,
                  index === 0 && styles.avatarFirst,
                  index === 1 && styles.avatarSecond,
                ]}
              >
                <Image source={{ uri: user.photoURL }} style={styles.avatar} />
              </View>
            ))}
          </View>
          
          {/* Count badge (if more than 2 users) */}
          {showCount && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{remainingCount}</Text>
            </View>
          )}
        </View>
      </View>
    </Marker>
  );
});

SocialClusterPin.displayName = 'SocialClusterPin';

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
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.PILL_BG,
    borderRadius: SIZES.PILL_HEIGHT / 2,
    paddingHorizontal: SIZES.PILL_PADDING_H,
    paddingVertical: 2,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  
  // Avatar section
  avatarSection: {
    flexDirection: 'row',
    height: SIZES.AVATAR,
  },
  avatarContainer: {
    width: SIZES.AVATAR,
    height: SIZES.AVATAR,
    borderRadius: SIZES.AVATAR / 2,
    borderWidth: SIZES.AVATAR_BORDER,
    borderColor: COLORS.AVATAR_BORDER,
    overflow: 'hidden',
    backgroundColor: COLORS.PILL_BG,
  },
  avatarFirst: {
    zIndex: 2,
  },
  avatarSecond: {
    marginLeft: -SIZES.AVATAR_OVERLAP,
    zIndex: 1,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  
  // Count - plain number (no badge)
  countBadge: {
    marginLeft: 6,
    marginRight: 6
  },
  countText: {
    color: COLORS.COUNT_TEXT,
    fontSize: 16,
    fontWeight: '800',
  },
  
  // Callout styles
  calloutContainer: {
    width: 200,
  },
  callout: {
    backgroundColor: COLORS.CALLOUT_BG,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  courtName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  userList: {
    fontSize: 13,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 18,
  },
});

export type { SocialClusterPinProps };
