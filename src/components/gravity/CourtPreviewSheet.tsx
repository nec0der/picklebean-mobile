/**
 * CourtPreviewSheet - Minimal court preview bottom sheet
 * 
 * Design: Light, temporary, swipe-dismissible
 * Never covers full screen
 * Actions always visible
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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import type { Court } from '@/types/court';
import { AccessType } from '@/types/courtEnums';

// =============================================================================
// DESIGN TOKENS
// =============================================================================

const SPACING = {
  MICRO: 4,
  TIGHT: 8,
  DEFAULT: 16,
  RELAXED: 24,
} as const;

const COLORS = {
  PRIMARY: '#3B82F6',
  ACCENT: '#10B981',
  NEUTRAL: '#6B7280',
} as const;

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = 240;

// =============================================================================
// COMPONENT
// =============================================================================

interface CourtPreviewSheetProps {
  court: Court | null;
  onClose: () => void;
  onJoin: () => void;
  onImHere: () => void;
  onNewSession: () => void;
}

export const CourtPreviewSheet = memo(({
  court,
  onClose,
  onJoin,
  onImHere,
  onNewSession,
}: CourtPreviewSheetProps) => {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  
  // Pan responder for swipe to dismiss
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 80 || gestureState.vy > 0.5) {
          // Dismiss
          onClose();
        } else {
          // Snap back
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
  
  // Animate in/out
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
  
  // Action handlers with haptics
  const handleJoin = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onJoin();
  }, [onJoin]);
  
  const handleImHere = useCallback(async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onImHere();
  }, [onImHere]);
  
  const handleNewSession = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onNewSession();
  }, [onNewSession]);
  
  if (!court) return null;
  
  const isActive = court.derived.activePlayersNow > 0;
  const courtType = court.isIndoor ? 'Indoor' : 'Outdoor';
  const accessText = court.access.type === AccessType.PUBLIC ? 'Free' : 'Paid';
  
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
      {/* Drag handle */}
      <View style={styles.handleContainer}>
        <View style={styles.handle} />
      </View>
      
      {/* Court info */}
      <View style={styles.content}>
        {/* Header */}
        <Text style={styles.courtName}>{court.name}</Text>
        <Text style={styles.courtMeta}>
          {courtType} · {accessText}
        </Text>
        
        {/* Activity status */}
        <View style={styles.statusRow}>
          <View 
            style={[
              styles.statusDot, 
              { backgroundColor: isActive ? COLORS.ACCENT : COLORS.NEUTRAL }
            ]} 
          />
          <Text style={styles.statusText}>
            {isActive 
              ? `Active now · ${court.derived.activePlayersNow} players` 
              : 'No activity'}
          </Text>
        </View>
        
        {/* Sessions section - placeholder */}
        {isActive && (
          <View style={styles.sessionsSection}>
            <Text style={styles.sessionsLabel}>Sessions</Text>
            <Text style={styles.sessionItem}>Open play (now)</Text>
          </View>
        )}
      </View>
      
      {/* Actions - always visible */}
      <View style={styles.actionsRow}>
        <Pressable style={styles.actionSecondary} onPress={handleJoin}>
          <Text style={styles.actionSecondaryText}>Join</Text>
        </Pressable>
        
        <Pressable style={styles.actionSecondary} onPress={handleImHere}>
          <Text style={styles.actionSecondaryText}>I'm here</Text>
        </Pressable>
        
        <Pressable style={styles.actionPrimary} onPress={handleNewSession}>
          <Text style={styles.actionPrimaryText}>+ New</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
});

CourtPreviewSheet.displayName = 'CourtPreviewSheet';

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: SPACING.TIGHT,
    paddingHorizontal: SPACING.DEFAULT,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.TIGHT,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
  },
  content: {
    paddingVertical: SPACING.TIGHT,
  },
  courtName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  courtMeta: {
    fontSize: 14,
    color: COLORS.NEUTRAL,
    marginTop: SPACING.MICRO,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.DEFAULT,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.TIGHT,
  },
  statusText: {
    fontSize: 14,
    color: '#374151',
  },
  sessionsSection: {
    marginTop: SPACING.DEFAULT,
  },
  sessionsLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.NEUTRAL,
    marginBottom: SPACING.MICRO,
  },
  sessionItem: {
    fontSize: 14,
    color: '#374151',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: SPACING.TIGHT,
    marginTop: SPACING.DEFAULT,
  },
  actionSecondary: {
    flex: 1,
    paddingVertical: SPACING.DEFAULT - 4,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  actionSecondaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  actionPrimary: {
    flex: 1,
    paddingVertical: SPACING.DEFAULT - 4,
    borderRadius: 10,
    backgroundColor: COLORS.PRIMARY,
    alignItems: 'center',
  },
  actionPrimaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
