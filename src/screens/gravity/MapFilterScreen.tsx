/**
 * MapFilterScreen - Full-screen filter page for Gravity map
 * iOS-style design matching GravitySettingsScreen
 * Slides from right, has dropdown for mode and mode-specific filters
 */

import { memo, useCallback, useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Platform,
  Animated,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronDown, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import type { RootStackScreenProps } from '@/types/navigation';
import type { MapMode } from '@/components/gravity/MapModeToggle';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// =============================================================================
// TYPES
// =============================================================================

type ActivityFilter = 'all' | 'business';
type SocialFilter = 'all' | 'following' | 'followers';
type ExploreFilter = 'all' | 'indoor' | 'outdoor';
type EventsFilter = 'all' | 'upcoming' | 'this_week';
type TrainFilter = 'beginner' | 'intermediate' | 'advanced';

export interface MapFilterState {
  mode: MapMode;
  activityFilter: ActivityFilter;
  socialFilter: SocialFilter;
  exploreFilter: ExploreFilter;
  eventsFilter: EventsFilter;
  trainFilter: TrainFilter;
}

// =============================================================================
// DESIGN TOKENS
// =============================================================================

const COLORS = {
  BACKGROUND: '#F3F4F6',
  SURFACE: '#FFFFFF',
  TEXT_PRIMARY: '#1F2937',
  TEXT_SECONDARY: '#6B7280',
  TEXT_TERTIARY: '#9CA3AF',
  ACCENT: '#3B82F6',
  DIVIDER: '#E5E7EB',
  SUCCESS: '#10B981',
} as const;

const SPACING = {
  TIGHT: 8,
  DEFAULT: 16,
  RELAXED: 24,
} as const;

// =============================================================================
// MODE CONFIG
// =============================================================================

const MODE_OPTIONS: { value: MapMode; label: string }[] = [
  { value: 'activity', label: 'Activity' },
  { value: 'social', label: 'Social' },
  { value: 'explore', label: 'Explore' },
  { value: 'events', label: 'Events' },
  { value: 'train', label: 'Train' },
];

const FILTER_CONFIG: Record<MapMode, { label: string; options: { value: string; label: string }[] }> = {
  activity: {
    label: 'Show courts',
    options: [
      { value: 'all', label: 'All courts' },
      { value: 'business', label: 'Business only' },
    ],
  },
  social: {
    label: 'Show players',
    options: [
      { value: 'all', label: 'Everyone' },
      { value: 'following', label: 'Following' },
      { value: 'followers', label: 'Followers' },
    ],
  },
  explore: {
    label: 'Court type',
    options: [
      { value: 'all', label: 'All types' },
      { value: 'indoor', label: 'Indoor' },
      { value: 'outdoor', label: 'Outdoor' },
    ],
  },
  events: {
    label: 'Time range',
    options: [
      { value: 'all', label: 'All events' },
      { value: 'upcoming', label: 'Upcoming' },
      { value: 'this_week', label: 'This week' },
    ],
  },
  train: {
    label: 'Skill level',
    options: [
      { value: 'beginner', label: 'Beginner' },
      { value: 'intermediate', label: 'Intermediate' },
      { value: 'advanced', label: 'Advanced' },
    ],
  },
};

// =============================================================================
// DROPDOWN COMPONENT
// =============================================================================

interface DropdownProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

const Dropdown = memo(({ label, value, options, onChange }: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const selectedLabel = options.find(o => o.value === value)?.label || value;

  const toggleDropdown = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen(prev => !prev);
    Animated.timing(rotateAnim, {
      toValue: isOpen ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isOpen, rotateAnim]);

  const handleSelect = useCallback(async (newValue: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange(newValue);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen(false);
    Animated.timing(rotateAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [onChange, rotateAnim]);

  const chevronRotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={styles.dropdownContainer}>
      <Text style={styles.dropdownLabel}>{label}</Text>
      <View style={styles.dropdownCard}>
        <Pressable onPress={toggleDropdown} style={styles.dropdownHeader}>
          <Text style={styles.dropdownValue}>{selectedLabel}</Text>
          <Animated.View style={{ transform: [{ rotate: chevronRotate }] }}>
            <ChevronDown size={20} color={COLORS.TEXT_TERTIARY} />
          </Animated.View>
        </Pressable>
        {isOpen && (
          <View style={styles.dropdownOptions}>
            {options.map((option, index) => {
              const isSelected = option.value === value;
              const isLast = index === options.length - 1;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => handleSelect(option.value)}
                  style={[
                    styles.dropdownOption,
                    !isLast && styles.dropdownOptionBorder,
                  ]}
                >
                  <Text style={[
                    styles.dropdownOptionText,
                    isSelected && styles.dropdownOptionTextSelected,
                  ]}>
                    {option.label}
                  </Text>
                  {isSelected && (
                    <Check size={18} color={COLORS.ACCENT} />
                  )}
                </Pressable>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
});

Dropdown.displayName = 'Dropdown';

// =============================================================================
// FILTER OPTIONS COMPONENT
// =============================================================================

interface FilterOptionsProps {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}

const FilterOptions = memo(({ label, options, value, onChange }: FilterOptionsProps) => {
  const handleSelect = useCallback(async (newValue: string) => {
    if (newValue !== value) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onChange(newValue);
    }
  }, [value, onChange]);

  return (
    <View style={styles.filterContainer}>
      <Text style={styles.filterLabel}>{label}</Text>
      <View style={styles.filterCard}>
        {options.map((option, index) => {
          const isSelected = option.value === value;
          const isLast = index === options.length - 1;
          return (
            <Pressable
              key={option.value}
              onPress={() => handleSelect(option.value)}
              style={[
                styles.filterOption,
                !isLast && styles.filterOptionBorder,
              ]}
            >
              <Text style={[
                styles.filterOptionText,
                isSelected && styles.filterOptionTextSelected,
              ]}>
                {option.label}
              </Text>
              {isSelected && (
                <View style={styles.filterCheckCircle}>
                  <Check size={14} color={COLORS.SURFACE} strokeWidth={3} />
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
});

FilterOptions.displayName = 'FilterOptions';

// =============================================================================
// MAIN SCREEN
// =============================================================================

export const MapFilterScreen = memo(
  ({ navigation, route }: RootStackScreenProps<'MapFilter'>) => {
    const insets = useSafeAreaInsets();
    const initialState = route.params;

    // Local state for editing
    const [mode, setMode] = useState<MapMode>(initialState.mode);
    const [activityFilter, setActivityFilter] = useState<ActivityFilter>(initialState.activityFilter);
    const [socialFilter, setSocialFilter] = useState<SocialFilter>(initialState.socialFilter);
    const [exploreFilter, setExploreFilter] = useState<ExploreFilter>(initialState.exploreFilter);
    const [eventsFilter, setEventsFilter] = useState<EventsFilter>(initialState.eventsFilter);
    const [trainFilter, setTrainFilter] = useState<TrainFilter>(initialState.trainFilter);

    // Get current filter value and setter based on mode
    const currentFilterConfig = FILTER_CONFIG[mode];
    const getCurrentFilterValue = (): string => {
      switch (mode) {
        case 'activity': return activityFilter;
        case 'social': return socialFilter;
        case 'explore': return exploreFilter;
        case 'events': return eventsFilter;
        case 'train': return trainFilter;
      }
    };

    const setCurrentFilterValue = (value: string) => {
      switch (mode) {
        case 'activity': setActivityFilter(value as ActivityFilter); break;
        case 'social': setSocialFilter(value as SocialFilter); break;
        case 'explore': setExploreFilter(value as ExploreFilter); break;
        case 'events': setEventsFilter(value as EventsFilter); break;
        case 'train': setTrainFilter(value as TrainFilter); break;
      }
    };

    // Handlers
    const handleBack = useCallback(() => {
      navigation.goBack();
    }, [navigation]);

    const handleApply = useCallback(async () => {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Navigate back to GravityMap with filter state
      navigation.navigate('Tabs' as any, {
        screen: 'GravityMap',
        params: {
          filterState: {
            mode,
            activityFilter,
            socialFilter,
            exploreFilter,
            eventsFilter,
            trainFilter,
          },
        },
      });
    }, [navigation, mode, activityFilter, socialFilter, exploreFilter, eventsFilter, trainFilter]);

    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.backButton}>
            <ChevronLeft size={28} color={COLORS.ACCENT} />
            <Text style={styles.backText}>Back</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Filter</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Content */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={[
            styles.contentContainer,
            { paddingBottom: insets.bottom + 80 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Mode Dropdown */}
          <Dropdown
            label="Map mode"
            value={mode}
            options={MODE_OPTIONS}
            onChange={(v) => setMode(v as MapMode)}
          />

          {/* Mode-specific filter options */}
          <FilterOptions
            label={currentFilterConfig.label}
            options={currentFilterConfig.options}
            value={getCurrentFilterValue()}
            onChange={setCurrentFilterValue}
          />
        </ScrollView>

        {/* Apply Button */}
        <View style={[styles.applyContainer, { paddingBottom: insets.bottom + SPACING.DEFAULT }]}>
          <Pressable onPress={handleApply} style={styles.applyButton}>
            <Text style={styles.applyButtonText}>Apply</Text>
          </Pressable>
        </View>
      </View>
    );
  }
);

MapFilterScreen.displayName = 'MapFilterScreen';

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.DEFAULT,
    paddingVertical: 12,
    backgroundColor: COLORS.BACKGROUND,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: -8,
  },
  backText: {
    fontSize: 17,
    color: COLORS.ACCENT,
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 60,
  },

  // Content
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: SPACING.DEFAULT,
    paddingTop: SPACING.RELAXED,
    gap: SPACING.RELAXED,
  },

  // Dropdown
  dropdownContainer: {
    gap: SPACING.TIGHT,
  },
  dropdownLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.TEXT_SECONDARY,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: SPACING.DEFAULT,
  },
  dropdownCard: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.DEFAULT,
    paddingVertical: 14,
  },
  dropdownValue: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.TEXT_PRIMARY,
  },
  dropdownOptions: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.DIVIDER,
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.DEFAULT,
    paddingVertical: 12,
    backgroundColor: COLORS.SURFACE,
  },
  dropdownOptionBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.DIVIDER,
  },
  dropdownOptionText: {
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
  },
  dropdownOptionTextSelected: {
    color: COLORS.ACCENT,
    fontWeight: '500',
  },

  // Filter options
  filterContainer: {
    gap: SPACING.TIGHT,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.TEXT_SECONDARY,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: SPACING.DEFAULT,
  },
  filterCard: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.DEFAULT,
    paddingVertical: 14,
  },
  filterOptionBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.DIVIDER,
  },
  filterOptionText: {
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
  },
  filterOptionTextSelected: {
    color: COLORS.ACCENT,
    fontWeight: '500',
  },
  filterCheckCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Apply button
  applyContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.DEFAULT,
    paddingTop: SPACING.DEFAULT,
    backgroundColor: COLORS.BACKGROUND,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.DIVIDER,
  },
  applyButton: {
    backgroundColor: COLORS.ACCENT,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.ACCENT,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  applyButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.SURFACE,
  },
});
