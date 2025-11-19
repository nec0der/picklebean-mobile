import { useState, useCallback } from 'react';
import { View, Text, Modal, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { Input } from '@/components/ui/Input';
import { validatePickleballScore } from '@/lib/validation';
import { LoadingSpinner } from '@/components/common';

interface ScoreEntryModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (team1Score: number, team2Score: number) => Promise<void>;
}

export const ScoreEntryModal = ({ visible, onClose, onSubmit }: ScoreEntryModalProps) => {
  const [team1Score, setTeam1Score] = useState('');
  const [team2Score, setTeam2Score] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCancel = useCallback(() => {
    setTeam1Score('');
    setTeam2Score('');
    setError(null);
    onClose();
  }, [onClose]);

  const handleSubmit = useCallback(async () => {
    setError(null);

    // Parse scores
    const score1 = parseInt(team1Score, 10);
    const score2 = parseInt(team2Score, 10);

    // Check if valid numbers
    if (isNaN(score1) || isNaN(score2)) {
      setError('Please enter valid scores for both teams');
      return;
    }

    // Validate pickleball rules
    const validationError = validatePickleballScore(score1, score2);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Submit scores
    setIsSubmitting(true);
    try {
      await onSubmit(score1, score2);
      // Reset form on success
      setTeam1Score('');
      setTeam2Score('');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit scores');
    } finally {
      setIsSubmitting(false);
    }
  }, [team1Score, team2Score, onSubmit]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="items-center justify-center flex-1 px-4 bg-black/50">
          <View className="w-full max-w-md p-6 bg-white rounded-lg">
            {/* Header */}
            <Text className="mb-6 text-2xl font-bold text-center text-gray-900">
              Enter Final Scores
            </Text>

            {/* Team 1 Score */}
            <View className="mb-4">
              <Text className="mb-2 text-base font-semibold text-gray-700">
                Team 1 Score
              </Text>
              <Input
                value={team1Score}
                onChangeText={setTeam1Score}
                placeholder="0"
                keyboardType="number-pad"
                editable={!isSubmitting}
                className="py-4 text-2xl font-bold text-center"
              />
            </View>

            {/* Team 2 Score */}
            <View className="mb-4">
              <Text className="mb-2 text-base font-semibold text-gray-700">
                Team 2 Score
              </Text>
              <Input
                value={team2Score}
                onChangeText={setTeam2Score}
                placeholder="0"
                keyboardType="number-pad"
                editable={!isSubmitting}
                className="py-4 text-2xl font-bold text-center"
              />
            </View>

            {/* Error Message */}
            {error && (
              <View className="p-3 mb-4 rounded-lg bg-red-50">
                <Text className="text-sm font-medium text-center text-red-600">
                  {error}
                </Text>
              </View>
            )}

            {/* Loading State */}
            {isSubmitting && (
              <View className="items-center py-4">
                <LoadingSpinner />
                <Text className="mt-2 text-sm text-gray-600">
                  Submitting scores...
                </Text>
              </View>
            )}

            {/* Buttons */}
            <View className="flex-row gap-3 mt-6">
              <Pressable
                onPress={handleCancel}
                disabled={isSubmitting}
                className="items-center justify-center flex-1 py-3 bg-gray-100 rounded-lg active:bg-gray-200 disabled:opacity-50"
              >
                <Text className="font-semibold text-gray-700">Cancel</Text>
              </Pressable>

              <Pressable
                onPress={handleSubmit}
                disabled={isSubmitting}
                className="items-center justify-center flex-1 py-3 bg-green-500 rounded-lg active:bg-green-600 disabled:opacity-50"
              >
                <Text className="font-bold text-white">Submit</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export type { ScoreEntryModalProps };
