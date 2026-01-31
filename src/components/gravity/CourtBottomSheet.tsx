/**
 * CourtBottomSheet V1 - LOCKED DESIGN CONTRACT
 * 
 * PURPOSE: Answer "Is this court a good choice for me right now?"
 * 
 * SECTIONS (STRICT ORDER):
 * 1. Court Identity - name + location + type
 * 2. Live Presence - MOST IMPORTANT (avatars, no numbers)
 * 3. Primary Actions - MAX 2 buttons
 * 4. Near-Future Context - optional upcoming
 * 
 * HARD NOs:
 * - No player counts/numbers
 * - No skill levels
 * - No ratings
 * - No reviews
 * - No booking
 * - No organizer tools
 */

import { memo, useCallback, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  Pressable, 
  StyleSheet, 
  Animated, 
  Dimensions,
  PanResponder,
  Platform,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import type { Court } from '@/types/court';

// =============================================================================
// DESIGN TOKENS (LOCKED)
// =============================================================================

const SPACING = {
  MICRO: 4,
  TIGHT: 8,
  DEFAULT: 16,
  RELAXED: 24,
  SECTION: 20,
} as const;

const COLORS = {
  TEXT_PRIMARY: '#1F2937',
  TEXT_SECONDARY: '#6B7280',
  TEXT_TERTIARY: '#9CA3AF',
  ACCENT: '#3B82F6',
  SURFACE: '#FFFFFF',
  SURFACE_SUBTLE: '#F9FAFB',
  DIVIDER: '#E5E7EB',
} as const;

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = 280; // Half-height

// =============================================================================
// AVATAR ROW (Max 4 avatars, no numbers)
// =============================================================================

interface AvatarRowProps {
  avatars: string[];
}

const AvatarRow = memo(({ avatars }: AvatarRowProps) => {
  // Max 4 visible - NO "+X" indicator
  const displayAvatars = avatars.slice(0, 4);
  
  if (displayAvatars.length === 0) return null;
  
  return (
    <View style={avatarStyles.row}>
      {displayAvatars.map((uri, index) => (
        <View 
          key={index}
          style={[
            avatarStyles.container,
            { marginLeft: index > 0 ? -8 : 0, zIndex: 4 - index },
          ]}
        >
          {uri ? (
            <Image source={{ uri }} style={avatarStyles.image} />
          ) : (
            <View style={avatarStyles.placeholder} />
          )}
        </View>
      ))}
    </View>
  );
});

AvatarRow.displayName = 'AvatarRow';

const avatarStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginTop: SPACING.TIGHT,
  },
  container: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.SURFACE,
    backgroundColor: COLORS.DIVIDER,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
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
    backgroundColor: '#E5E7EB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
});

// =============================================================================
// ACTIVITY STATE DERIVATION
// =============================================================================

type ActivityState = 'empty' | 'presence' | 'session';

interface ActivityInfo {
  state: ActivityState;
  text: string;
  subtext?: string;
  avatars: string[];
}

const deriveActivityInfo = (court: Court): ActivityInfo => {
  const { hasActiveSession, sessionAvatars, activePlayersNow } = court.derived;
  
  if (hasActiveSession && sessionAvatars && sessionAvatars.length > 0) {
    return {
      state: 'session',
      text: 'Session happening',
      subtext: 'Active now',
      avatars: sessionAvatars,
    };
  }
  
  if (activePlayersNow > 0) {
    // Generate placeholder avatars for presence (no real URLs yet)
    const avatars = sessionAvatars || Array(Math.min(activePlayersNow, 4)).fill('');
    return {
      state: 'presence',
      text: 'Players here',
      subtext: 'Just arrived',
      avatars,
    };
  }
  
  return {
    state: 'empty',
    text: 'No activity right now',
    avatars: [],
  };
};

// =============================================================================
// COMPONENT
// =============================================================================

interface CourtBottomSheetProps {
  court: Court | null;
  onClose: () => void;
  onImHere?: () => void;
  onCreateSession?: () => void;
}

export const CourtBottomSheet = memo(({
  court,
  onClose,
  onImHere,
  onCreateSession,
}: CourtBottomSheetProps) => {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  
  // ==========================================================================
  // PAN RESPONDER - Swipe down to dismiss
  // ==========================================================================
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 10,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 80 || gestureState.vy > 0.5) {
          onClose();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            friction: 8,
            tension: 100,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;
  
  // ==========================================================================
  // ANIMATION - Gentle fade/slide
  // ==========================================================================
  useEffect(() => {
    if (court) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          friction: 8,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: SHEET_HEIGHT,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [court, translateY, opacity]);
  
  // ==========================================================================
  // ACTION HANDLERS
  // ==========================================================================
  const handleImHere = useCallback(async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onImHere?.();
  }, [onImHere]);
  
  const handleCreateSession = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onCreateSession?.();
  }, [onCreateSession]);
  
  // Show actions only if both callbacks provided
  const showActions = Boolean(onImHere && onCreateSession);
  
  // ==========================================================================
  // RENDER
  // ==========================================================================
  if (!court) return null;
  
  const activityInfo = deriveActivityInfo(court);
  const courtType = court.isIndoor ? 'Indoor' : 'Outdoor';
  // TODO: Get city from court data when available
  const location = 'Chicago';
  
  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
          paddingBottom: insets.bottom + SPACING.DEFAULT,
        },
      ]}
      {...panResponder.panHandlers}
    >
      {/* ================================================================== */}
      {/* DRAG HANDLE                                                        */}
      {/* ================================================================== */}
      <View style={styles.handleContainer}>
        <View style={styles.handle} />
      </View>
      
      <View style={styles.content}>
        {/* ================================================================ */}
        {/* SECTION 1: COURT IDENTITY                                        */}
        {/* Purpose: Orientation, not branding                               */}
        {/* ================================================================ */}
        <View style={styles.section}>
          <Text style={styles.courtName}>{court.name}</Text>
          <Text style={styles.courtLocation}>
            {location} · {courtType}
          </Text>
        </View>
        
        {/* ================================================================ */}
        {/* SECTION 2: LIVE PRESENCE (MOST IMPORTANT)                        */}
        {/* No numbers. Only state + avatars.                                */}
        {/* ================================================================ */}
        <View style={styles.section}>
          <View style={styles.activityRow}>
            <View 
              style={[
                styles.activityDot,
                activityInfo.state === 'empty' 
                  ? styles.activityDotInactive 
                  : styles.activityDotActive,
              ]}
            />
            <View style={styles.activityText}>
              <Text style={styles.activityPrimary}>{activityInfo.text}</Text>
              {activityInfo.subtext && (
                <Text style={styles.activitySecondary}>{activityInfo.subtext}</Text>
              )}
            </View>
          </View>
          
          {/* Avatar row - max 4, no numbers */}
          {activityInfo.avatars.length > 0 && (
            <AvatarRow avatars={activityInfo.avatars} />
          )}
        </View>
        
        {/* ================================================================ */}
        {/* SECTION 3: PRIMARY ACTIONS                                       */}
        {/* MAX 2 BUTTONS: "I'm here" and "Create session"                   */}
        {/* Only rendered if callbacks are provided                          */}
        {/* ================================================================ */}
        {showActions && (
          <View style={styles.actionsRow}>
            <Pressable 
              style={styles.actionButton} 
              onPress={handleImHere}
            >
              <Text style={styles.actionButtonText}>I'm here</Text>
            </Pressable>
            
            <Pressable 
              style={[styles.actionButton, styles.actionButtonPrimary]} 
              onPress={handleCreateSession}
            >
              <Text style={[styles.actionButtonText, styles.actionButtonTextPrimary]}>
                Create session
              </Text>
            </Pressable>
          </View>
        )}
        
        {/* ================================================================ */}
        {/* SECTION 4: NEAR-FUTURE CONTEXT (Optional)                        */}
        {/* Only render if upcoming session exists                           */}
        {/* ================================================================ */}
        {/* TODO: Add when upcoming session data is available */}
      </View>
    </Animated.View>
  );
});

CourtBottomSheet.displayName = 'CourtBottomSheet';

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.SURFACE,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: SPACING.TIGHT,
    paddingHorizontal: SPACING.DEFAULT,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  
  // Drag handle
  handleContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.TIGHT,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: COLORS.DIVIDER,
    borderRadius: 2,
  },
  
  // Content
  content: {
    paddingVertical: SPACING.TIGHT,
  },
  section: {
    marginBottom: SPACING.SECTION,
  },
  
  // Section 1: Court Identity
  courtName: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: -0.3,
  },
  courtLocation: {
    fontSize: 15,
    color: COLORS.TEXT_SECONDARY,
    marginTop: SPACING.MICRO,
  },
  
  // Section 2: Live Presence
  activityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  activityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 5,
    marginRight: SPACING.TIGHT,
  },
  activityDotActive: {
    backgroundColor: '#10B981', // Green - active
  },
  activityDotInactive: {
    backgroundColor: COLORS.TEXT_TERTIARY,
  },
  activityText: {
    flex: 1,
  },
  activityPrimary: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.TEXT_PRIMARY,
  },
  activitySecondary: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 2,
  },
  
  // Section 3: Actions
  actionsRow: {
    flexDirection: 'row',
    gap: SPACING.TIGHT,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.SURFACE_SUBTLE,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.DIVIDER,
  },
  actionButtonPrimary: {
    backgroundColor: COLORS.ACCENT,
    borderColor: COLORS.ACCENT,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  actionButtonTextPrimary: {
    color: '#FFFFFF',
  },
});

export type { CourtBottomSheetProps };
