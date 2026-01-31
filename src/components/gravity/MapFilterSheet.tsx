/**
 * MapFilterSheet - Unified filters for Gravity map
 * Redesigned to match Gravity design language with drag handle,
 * segment controls, and polished accordion sections.
 */

import { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  LayoutAnimation,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  UIManager,
  View,
} from 'react-native';
import { PanResponder } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronDown } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
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

interface MapFilterSheetProps {
  visible: boolean;
  mode: MapMode;
  activityFilter: ActivityFilter;
  socialFilter: SocialFilter;
  exploreFilter: ExploreFilter;
  eventsFilter: EventsFilter;
  trainFilter: TrainFilter;
  onChangeActivity: (value: ActivityFilter) => void;
  onChangeSocial: (value: SocialFilter) => void;
  onChangeExplore: (value: ExploreFilter) => void;
  onChangeEvents: (value: EventsFilter) => void;
  onChangeTrain: (value: TrainFilter) => void;
  onClose: () => void;
}

// =============================================================================
// DESIGN TOKENS (Gravity)
// =============================================================================

const SPACING = {
  MICRO: 4,
  TIGHT: 8,
  DEFAULT: 16,
  RELAXED: 24,
} as const;

const COLORS = {
  TEXT_PRIMARY: '#1F2937',
  TEXT_SECONDARY: '#6B7280',
  TEXT_TERTIARY: '#9CA3AF',
  ACCENT: '#3B82F6',
  SURFACE: '#FFFFFF',
  SURFACE_SUBTLE: '#F9FAFB',
  DIVIDER: '#E5E7EB',
  BACKDROP: 'rgba(0,0,0,0.25)',
} as const;

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = 420;

const SECTION_CONFIG: { mode: MapMode; title: string }[] = [
  { mode: 'activity', title: 'Activity' },
  { mode: 'social', title: 'Social' },
  { mode: 'explore', title: 'Explore' },
  { mode: 'events', title: 'Events' },
  { mode: 'train', title: 'Train' },
];

// =============================================================================
// SEGMENT CONTROL COMPONENT
// =============================================================================

interface SegmentOption<T> {
  value: T;
  label: string;
}

interface SegmentControlProps<T> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

function SegmentControl<T extends string>({ options, value, onChange }: SegmentControlProps<T>) {
  const handlePress = useCallback(async (newValue: T) => {
    if (newValue !== value) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onChange(newValue);
    }
  }, [value, onChange]);

  return (
    <View style={segmentStyles.container}>
      {options.map((option, index) => {
        const isActive = option.value === value;
        const isFirst = index === 0;
        const isLast = index === options.length - 1;

        return (
          <Pressable
            key={option.value}
            onPress={() => handlePress(option.value)}
            style={[
              segmentStyles.segment,
              isActive && segmentStyles.segmentActive,
              isFirst && segmentStyles.segmentFirst,
              isLast && segmentStyles.segmentLast,
            ]}
          >
            <Text style={[segmentStyles.label, isActive && segmentStyles.labelActive]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const segmentStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.SURFACE_SUBTLE,
    borderRadius: 10,
    padding: 2,
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  segmentActive: {
    backgroundColor: COLORS.SURFACE,
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
  segmentFirst: {},
  segmentLast: {},
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.TEXT_SECONDARY,
  },
  labelActive: {
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
});

// =============================================================================
// ACCORDION SECTION COMPONENT
// =============================================================================

interface AccordionSectionProps {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const AccordionSection = memo(({ title, isExpanded, onToggle, children }: AccordionSectionProps) => {
  const rotateAnim = useRef(new Animated.Value(isExpanded ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(rotateAnim, {
      toValue: isExpanded ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isExpanded, rotateAnim]);

  const chevronRotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const handleToggle = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onToggle();
  }, [onToggle]);

  return (
    <View style={accordionStyles.container}>
      <Pressable onPress={handleToggle} style={accordionStyles.header}>
        <Text style={accordionStyles.title}>{title}</Text>
        <Animated.View style={{ transform: [{ rotate: chevronRotate }] }}>
          <ChevronDown size={18} color={COLORS.TEXT_TERTIARY} />
        </Animated.View>
      </Pressable>
      {isExpanded && (
        <View style={accordionStyles.body}>
          {children}
        </View>
      )}
    </View>
  );
});

AccordionSection.displayName = 'AccordionSection';

const accordionStyles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.DIVIDER,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.DEFAULT,
    paddingVertical: 14,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  body: {
    paddingHorizontal: SPACING.DEFAULT,
    paddingBottom: SPACING.DEFAULT,
    backgroundColor: COLORS.SURFACE_SUBTLE,
  },
});

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const MapFilterSheet = memo(({
  visible,
  mode,
  activityFilter,
  socialFilter,
  exploreFilter,
  eventsFilter,
  trainFilter,
  onChangeActivity,
  onChangeSocial,
  onChangeExplore,
  onChangeEvents,
  onChangeTrain,
  onClose,
}: MapFilterSheetProps) => {
  const insets = useSafeAreaInsets();
  const [internalVisible, setInternalVisible] = useState(false);
  const [expandedMode, setExpandedMode] = useState<MapMode | null>(null);
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const sectionPositionsRef = useRef<Partial<Record<MapMode, number>>>({});

  // ===========================================================================
  // PAN RESPONDER - Swipe down to dismiss
  // ===========================================================================
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

  // ===========================================================================
  // ANIMATION - Open/close
  // ===========================================================================
  useEffect(() => {
    if (visible) {
      setInternalVisible(true);
      setExpandedMode(mode);
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          friction: 8,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (internalVisible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: SHEET_HEIGHT,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 120,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setInternalVisible(false);
      });
    }
  }, [visible, internalVisible, mode, opacity, translateY]);

  // Auto-scroll to active section
  useEffect(() => {
    if (!visible || !expandedMode) return;
    const position = sectionPositionsRef.current[expandedMode];
    if (position === undefined) return;
    const timer = setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: Math.max(position - 8, 0), animated: true });
    }, 80);
    return () => clearTimeout(timer);
  }, [visible, expandedMode]);

  // ===========================================================================
  // RENDER FILTER OPTIONS
  // ===========================================================================
  const renderSectionContent = useCallback((sectionMode: MapMode) => {
    switch (sectionMode) {
      case 'activity':
        return (
          <SegmentControl<ActivityFilter>
            options={[
              { value: 'all', label: 'All' },
              { value: 'business', label: 'Business' },
            ]}
            value={activityFilter}
            onChange={onChangeActivity}
          />
        );
      case 'social':
        return (
          <SegmentControl<SocialFilter>
            options={[
              { value: 'all', label: 'All' },
              { value: 'following', label: 'Following' },
              { value: 'followers', label: 'Followers' },
            ]}
            value={socialFilter}
            onChange={onChangeSocial}
          />
        );
      case 'explore':
        return (
          <SegmentControl<ExploreFilter>
            options={[
              { value: 'all', label: 'All' },
              { value: 'indoor', label: 'Indoor' },
              { value: 'outdoor', label: 'Outdoor' },
            ]}
            value={exploreFilter}
            onChange={onChangeExplore}
          />
        );
      case 'events':
        return (
          <SegmentControl<EventsFilter>
            options={[
              { value: 'all', label: 'All' },
              { value: 'upcoming', label: 'Upcoming' },
              { value: 'this_week', label: 'This week' },
            ]}
            value={eventsFilter}
            onChange={onChangeEvents}
          />
        );
      case 'train':
        return (
          <SegmentControl<TrainFilter>
            options={[
              { value: 'beginner', label: 'Beginner' },
              { value: 'intermediate', label: 'Intermediate' },
              { value: 'advanced', label: 'Advanced' },
            ]}
            value={trainFilter}
            onChange={onChangeTrain}
          />
        );
      default:
        return null;
    }
  }, [
    activityFilter, onChangeActivity,
    socialFilter, onChangeSocial,
    exploreFilter, onChangeExplore,
    eventsFilter, onChangeEvents,
    trainFilter, onChangeTrain,
  ]);

  if (!internalVisible) return null;

  return (
    <Modal transparent visible={internalVisible} animationType="none">
      <View style={styles.backdrop}>
        {/* Tap backdrop to close */}
        <Animated.View style={[styles.backdropOverlay, { opacity }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        {/* Sheet */}
        <Animated.View
          style={[
            styles.sheet,
            {
              transform: [{ translateY }],
              paddingBottom: insets.bottom + SPACING.DEFAULT,
            },
          ]}
          {...panResponder.panHandlers}
        >
          {/* Drag handle */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          {/* Title */}
          <Text style={styles.title}>Filters</Text>

          {/* Accordion sections */}
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {SECTION_CONFIG.map(({ mode: sectionMode, title }) => (
              <View
                key={sectionMode}
                onLayout={(event) => {
                  sectionPositionsRef.current[sectionMode] = event.nativeEvent.layout.y;
                }}
              >
                <AccordionSection
                  title={title}
                  isExpanded={expandedMode === sectionMode}
                  onToggle={() => {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    setExpandedMode((prev) => (prev === sectionMode ? null : sectionMode));
                  }}
                >
                  {renderSectionContent(sectionMode)}
                </AccordionSection>
              </View>
            ))}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
});

MapFilterSheet.displayName = 'MapFilterSheet';

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdropOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.BACKDROP,
  },
  sheet: {
    width: '100%',
    maxHeight: Math.min(SHEET_HEIGHT, SCREEN_HEIGHT * 0.7),
    backgroundColor: COLORS.SURFACE,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
    backgroundColor: COLORS.DIVIDER,
    borderRadius: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.DEFAULT,
    textAlign: 'center',
  },
  content: {
    gap: SPACING.TIGHT,
    paddingBottom: SPACING.TIGHT,
  },
});
