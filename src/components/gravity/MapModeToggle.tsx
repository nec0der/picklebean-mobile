/**
 * MapModeToggle - Mode selector for the Gravity map
 * 
 * Horizontal pill tabs under search bar
 * 
 * Modes:
 * - Activity: See when courts are busy (pulsing indicators)
 * - Social: See who's there (avatars on map)
 * - Explore: See facility details (court types)
 */

import { memo, useCallback } from 'react';
import { 
  View,
  ScrollView,
  Pressable, 
  StyleSheet, 
  Platform,
  Text,
} from 'react-native';
import { Activity, Users, Compass, Calendar, Dumbbell } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

// =============================================================================
// TYPES
// =============================================================================

export type MapMode = 'activity' | 'social' | 'explore' | 'events' | 'train';

interface MapModeToggleProps {
  mode: MapMode;
  onModeChange: (mode: MapMode) => void;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const MODES: { key: MapMode; icon: typeof Activity; label: string }[] = [
  { key: 'activity', icon: Activity, label: 'Activity' },
  { key: 'social', icon: Users, label: 'Social' },
  { key: 'explore', icon: Compass, label: 'Explore' },
  { key: 'events', icon: Calendar, label: 'Events' },
  { key: 'train', icon: Dumbbell, label: 'Train' },
];

const PILL_GAP = 8;

const COLORS = {
  ACTIVE_BG: '#3B82F6',
  ACTIVE_TEXT: '#FFFFFF',
  INACTIVE_BG: '#F3F4F6',
  INACTIVE_TEXT: '#6B7280',
} as const;

// =============================================================================
// COMPONENT
// =============================================================================

export const MapModeToggle = memo(({ mode, onModeChange }: MapModeToggleProps) => {
  // Handle mode press
  const handlePress = useCallback(async (newMode: MapMode) => {
    if (newMode !== mode) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onModeChange(newMode);
    }
  }, [mode, onModeChange]);
  
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {MODES.map(({ key, icon: Icon, label }) => {
          const isActive = mode === key;
          
          return (
            <Pressable
              key={key}
              onPress={() => handlePress(key)}
              style={[styles.pill, isActive ? styles.pillActive : styles.pillInactive]}
            >
              <Icon 
                size={16} 
                color={isActive ? COLORS.ACTIVE_TEXT : COLORS.INACTIVE_TEXT}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <Text style={[styles.label, isActive ? styles.labelActive : styles.labelInactive]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
});

MapModeToggle.displayName = 'MapModeToggle';

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    width: '100%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  scrollContent: {
    alignItems: 'center',
    gap: PILL_GAP,
    paddingVertical: 2,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  pillActive: {
    backgroundColor: COLORS.ACTIVE_BG,
  },
  pillInactive: {
    backgroundColor: COLORS.INACTIVE_BG,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
  labelActive: {
    color: COLORS.ACTIVE_TEXT,
  },
  labelInactive: {
    color: COLORS.INACTIVE_TEXT,
  },
});

export type { MapModeToggleProps };
