/**
 * CreateSessionScreen - V1 LOCKED CONTRACT
 * 
 * Single screen, no wizard. Create session in < 5 seconds.
 * 
 * Fields:
 * 1. Court (pre-filled, read-only)
 * 2. Time (simple preset slots)
 * 3. Duration (presets only: 60, 90, 120 min)
 * 
 * Actions:
 * - Confirm (create session)
 * - Cancel (go back)
 * 
 * NO: descriptions, limits, invites, skill filters
 */

import { memo, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

import { ScreenHeader } from '@/components/common/ScreenHeader';
import { useAuth } from '@/contexts/AuthContext';
import {
  SESSION_DURATIONS,
  DURATION_LABELS,
  type SessionDuration,
} from '@/types/session';
import { sessionService } from '@/services/sessionService';
import type { RootStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateSession'>;

// =============================================================================
// DESIGN TOKENS
// =============================================================================

const COLORS = {
  TEXT_PRIMARY: '#1F2937',
  TEXT_SECONDARY: '#6B7280',
  TEXT_TERTIARY: '#9CA3AF',
  ACCENT: '#3B82F6',
  SURFACE: '#FFFFFF',
  SURFACE_SUBTLE: '#F9FAFB',
  BORDER: '#E5E7EB',
} as const;

const SPACING = {
  TIGHT: 8,
  DEFAULT: 16,
  RELAXED: 24,
} as const;

// =============================================================================
// TIME SLOT HELPERS
// =============================================================================

interface TimeSlot {
  label: string;
  value: Date;
  isNow: boolean;
}

const generateTimeSlots = (): TimeSlot[] => {
  const now = new Date();
  const slots: TimeSlot[] = [];
  
  // "Now" slot
  slots.push({
    label: 'Now',
    value: now,
    isNow: true,
  });
  
  // Next 4 half-hour slots
  const current = new Date(now);
  const minutes = current.getMinutes();
  
  // Round up to next 30 min
  if (minutes < 30) {
    current.setMinutes(30, 0, 0);
  } else {
    current.setHours(current.getHours() + 1, 0, 0, 0);
  }
  
  for (let i = 0; i < 4; i++) {
    const slot = new Date(current);
    slot.setMinutes(slot.getMinutes() + i * 30);
    
    slots.push({
      label: slot.toLocaleTimeString([], { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true,
      }),
      value: slot,
      isNow: false,
    });
  }
  
  return slots;
};

// =============================================================================
// DURATION SELECTOR
// =============================================================================

interface DurationSelectorProps {
  selected: SessionDuration;
  onSelect: (duration: SessionDuration) => void;
}

const DurationSelector = memo(({ selected, onSelect }: DurationSelectorProps) => {
  const handleSelect = useCallback((duration: SessionDuration) => {
    Haptics.selectionAsync();
    onSelect(duration);
  }, [onSelect]);

  return (
    <View style={durationStyles.container}>
      {SESSION_DURATIONS.map((duration) => (
        <Pressable
          key={duration}
          style={[
            durationStyles.button,
            selected === duration && durationStyles.buttonSelected,
          ]}
          onPress={() => handleSelect(duration)}
        >
          <Text
            style={[
              durationStyles.buttonText,
              selected === duration && durationStyles.buttonTextSelected,
            ]}
          >
            {DURATION_LABELS[duration]}
          </Text>
        </Pressable>
      ))}
    </View>
  );
});

DurationSelector.displayName = 'DurationSelector';

const durationStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: SPACING.TIGHT,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.SURFACE_SUBTLE,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    alignItems: 'center',
  },
  buttonSelected: {
    backgroundColor: COLORS.ACCENT,
    borderColor: COLORS.ACCENT,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.TEXT_PRIMARY,
  },
  buttonTextSelected: {
    color: '#FFFFFF',
  },
});

// =============================================================================
// TIME SLOT SELECTOR
// =============================================================================

interface TimeSlotSelectorProps {
  slots: TimeSlot[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

const TimeSlotSelector = memo(({ slots, selectedIndex, onSelect }: TimeSlotSelectorProps) => {
  const handleSelect = useCallback((index: number) => {
    Haptics.selectionAsync();
    onSelect(index);
  }, [onSelect]);

  return (
    <View style={timeStyles.container}>
      {slots.map((slot, index) => (
        <Pressable
          key={index}
          style={[
            timeStyles.slot,
            selectedIndex === index && timeStyles.slotSelected,
          ]}
          onPress={() => handleSelect(index)}
        >
          <Text
            style={[
              timeStyles.slotText,
              selectedIndex === index && timeStyles.slotTextSelected,
            ]}
          >
            {slot.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
});

TimeSlotSelector.displayName = 'TimeSlotSelector';

const timeStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.TIGHT,
  },
  slot: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: COLORS.SURFACE_SUBTLE,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    minWidth: 80,
    alignItems: 'center',
  },
  slotSelected: {
    backgroundColor: COLORS.ACCENT,
    borderColor: COLORS.ACCENT,
  },
  slotText: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.TEXT_PRIMARY,
  },
  slotTextSelected: {
    color: '#FFFFFF',
  },
});

// =============================================================================
// NO COURT VIEW
// =============================================================================

const NoCourtView = memo(({ onCancel }: { onCancel: () => void }) => (
  <View style={noCourtStyles.container}>
    <Ionicons name="location-outline" size={48} color={COLORS.TEXT_TERTIARY} />
    <Text style={noCourtStyles.title}>No court nearby</Text>
    <Text style={noCourtStyles.hint}>
      Move closer to a court to create a session
    </Text>
    <Pressable style={noCourtStyles.button} onPress={onCancel}>
      <Text style={noCourtStyles.buttonText}>Go back</Text>
    </Pressable>
  </View>
));

NoCourtView.displayName = 'NoCourtView';

const noCourtStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  hint: {
    fontSize: 15,
    color: COLORS.TEXT_TERTIARY,
    textAlign: 'center',
    marginBottom: 16,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: COLORS.ACCENT,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

// =============================================================================
// SCREEN COMPONENT
// =============================================================================

export const CreateSessionScreen = memo(({ navigation, route }: Props) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const { courtId, courtName } = route.params ?? {};

  // Check if we have a court
  const hasCourt = Boolean(courtId && courtName);

  // Time slots (memoized)
  const timeSlots = useMemo(() => generateTimeSlots(), []);

  // State
  const [selectedTimeIndex, setSelectedTimeIndex] = useState(0);
  const [duration, setDuration] = useState<SessionDuration>(60);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handlers
  const handleCancel = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleConfirm = useCallback(async () => {
    if (!user || !courtId || !courtName) return;

    setIsSubmitting(true);
    try {
      const startTime = timeSlots[selectedTimeIndex].value;
      
      // Create session via service
      await sessionService.createSession({
        courtId,
        courtName,
        creatorId: user.id,
        creatorAvatar: user.photoURL ?? undefined,
        startTime,
        duration,
      });

      // Success haptic, then silent dismiss
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.goBack();
    } catch (error) {
      console.error('Failed to create session:', error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSubmitting(false);
    }
  }, [courtId, courtName, timeSlots, selectedTimeIndex, duration, user, navigation]);

  // No court found - show helper view
  if (!hasCourt) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScreenHeader title="Create Session" onLeftPress={handleCancel} />
        <NoCourtView onCancel={handleCancel} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader 
        title="Create Session" 
        onLeftPress={handleCancel}
      />

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* ================================================================ */}
        {/* COURT (Pre-filled, Read-only)                                    */}
        {/* ================================================================ */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Court</Text>
          <View style={styles.courtField}>
            <Ionicons name="location-outline" size={20} color={COLORS.TEXT_SECONDARY} />
            <Text style={styles.courtName}>{courtName}</Text>
          </View>
          <Text style={styles.courtHint}>
            Sessions are always at a specific court
          </Text>
        </View>

        {/* ================================================================ */}
        {/* TIME (Preset slots)                                              */}
        {/* ================================================================ */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Start time</Text>
          <TimeSlotSelector 
            slots={timeSlots}
            selectedIndex={selectedTimeIndex}
            onSelect={setSelectedTimeIndex}
          />
        </View>

        {/* ================================================================ */}
        {/* DURATION (Presets only)                                          */}
        {/* ================================================================ */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Duration</Text>
          <DurationSelector selected={duration} onSelect={setDuration} />
        </View>
      </ScrollView>

      {/* ================================================================== */}
      {/* ACTIONS                                                            */}
      {/* ================================================================== */}
      <View style={[styles.actions, { paddingBottom: insets.bottom + SPACING.DEFAULT }]}>
        <Pressable 
          style={styles.cancelButton}
          onPress={handleCancel}
          disabled={isSubmitting}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </Pressable>

        <Pressable 
          style={[
            styles.confirmButton,
            isSubmitting && styles.buttonDisabled,
          ]}
          onPress={handleConfirm}
          disabled={isSubmitting}
        >
          <Text style={styles.confirmButtonText}>
            {isSubmitting ? 'Creating...' : 'Confirm'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
});

CreateSessionScreen.displayName = 'CreateSessionScreen';

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.SURFACE,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.DEFAULT,
    gap: SPACING.RELAXED,
  },

  // Sections
  section: {
    gap: SPACING.TIGHT,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.TEXT_SECONDARY,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Court field
  courtField: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: SPACING.DEFAULT,
    backgroundColor: COLORS.SURFACE_SUBTLE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    gap: SPACING.TIGHT,
  },
  courtName: {
    flex: 1,
    fontSize: 17,
    fontWeight: '500',
    color: COLORS.TEXT_PRIMARY,
  },
  courtHint: {
    fontSize: 13,
    color: COLORS.TEXT_TERTIARY,
  },

  // Actions
  actions: {
    flexDirection: 'row',
    gap: SPACING.TIGHT,
    paddingHorizontal: SPACING.DEFAULT,
    paddingTop: SPACING.DEFAULT,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: COLORS.SURFACE_SUBTLE,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: COLORS.ACCENT,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default CreateSessionScreen;
