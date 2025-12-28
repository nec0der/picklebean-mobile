import { useState, useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicatorWrapper,
  ActionsheetDragIndicator,
} from '@gluestack-ui/themed';
import { HorizontalNumberPicker } from './HorizontalNumberPicker';
import { LoadingSpinner } from '@/components/common';
import { isValidPickleballScore } from '@/lib/scoreValidation';

interface ScorePickerSheetProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (team1Score: number, team2Score: number) => Promise<void>;
  defaultTeam1Score?: number;
  defaultTeam2Score?: number;
}

export const ScorePickerSheet = ({
  visible,
  onClose,
  onSubmit,
  defaultTeam1Score = 11,
  defaultTeam2Score = 9,
}: ScorePickerSheetProps) => {
  const [team1Score, setTeam1Score] = useState(defaultTeam1Score);
  const [team2Score, setTeam2Score] = useState(defaultTeam2Score);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(async () => {
    // Medium impact for submit button press (intentional action)
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    setError(null);

    // Validate with comprehensive pickleball rules
    const validation = isValidPickleballScore(team1Score, team2Score);
    
    if (!validation.valid) {
      setError(validation.error || 'Invalid score');
      // Error haptic for validation failure
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    // Submit scores
    setIsSubmitting(true);
    try {
      await onSubmit(team1Score, team2Score);
      // Success haptic for successful submission
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Reset on success
      setTeam1Score(defaultTeam1Score);
      setTeam2Score(defaultTeam2Score);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit scores');
      // Error haptic for submission failure
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSubmitting(false);
    }
  }, [team1Score, team2Score, onSubmit, defaultTeam1Score, defaultTeam2Score]);

  return (
    <Actionsheet isOpen={visible} onClose={onClose}>
      <ActionsheetBackdrop />
      <ActionsheetContent className="px-0 pb-6">
        {/* Drag Indicator */}
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator />
        </ActionsheetDragIndicatorWrapper>

        {/* Content */}
        <View className="w-full py-6">
          {/* Header */}
          <Text className="px-4 mb-12 text-xl font-bold text-center !text-gray-900">
            Enter Final Scores
          </Text>

          {/* Team 1 Picker */}
          <HorizontalNumberPicker
            value={team1Score}
            onChange={setTeam1Score}
            min={0}
            max={20}
            label="Team 1"
            color="green"
          />

          {/* VS Divider */}
          <View className="flex-row items-center justify-center my-8">
            <View className="flex-1 h-px bg-gray-300" />
            <Text className="px-4 text-sm font-medium !text-gray-500">vs</Text>
            <View className="flex-1 h-px bg-gray-300" />
          </View>

          {/* Team 2 Picker */}
          <HorizontalNumberPicker
            value={team2Score}
            onChange={setTeam2Score}
            min={0}
            max={20}
            label="Team 2"
            color="blue"
          />

          {/* Spacer before error/submit */}
          <View className="h-8" />

          {/* Error Message */}
          {error && (
            <View className="p-3 mx-4 mb-4 rounded-lg bg-red-50">
              <Text className="text-sm font-medium text-center !text-red-600">
                {error}
              </Text>
            </View>
          )}

          {/* Loading State */}
          {isSubmitting && (
            <View className="items-center px-4 py-4">
              <LoadingSpinner />
              <Text className="mt-2 text-sm !text-gray-600">
                Submitting scores...
              </Text>
            </View>
          )}

          {/* Submit Button */}
          <Pressable
            onPress={handleSubmit}
            disabled={isSubmitting}
            className="items-center py-4 mx-4 mt-2 bg-green-500 rounded-lg active:bg-green-600 disabled:opacity-50"
          >
            <Text className="text-lg font-bold !text-white">
              Submit Score
            </Text>
          </Pressable>
        </View>
      </ActionsheetContent>
    </Actionsheet>
  );
};

export type { ScorePickerSheetProps };
