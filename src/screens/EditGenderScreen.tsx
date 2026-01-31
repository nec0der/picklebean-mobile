import { memo, useState, useCallback } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import type { RootStackScreenProps } from '@/types/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { updateUserProfile } from '@/services/userService';
import { ScreenHeader } from '@/components/common';
import { useToast } from '@/hooks/common/useToast';

export const EditGenderScreen = memo(({ navigation, route }: RootStackScreenProps<'EditGender'>) => {
  const { currentGender } = route.params;
  const { userDocument } = useAuth();
  const toast = useToast();

  const [gender, setGender] = useState<'male' | 'female'>(currentGender);
  const [isSaving, setIsSaving] = useState(false);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSave = useCallback(async () => {
    if (!userDocument?.uid) {
      toast.error('User not found');
      return;
    }

    if (gender === currentGender) {
      navigation.goBack();
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSaving(true);

    try {
      await updateUserProfile(userDocument.uid, {
        gender,
      });

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      toast.success('Gender updated');
      navigation.goBack();
    } catch (error) {
      console.error('Error updating gender:', error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      toast.error('Failed to update gender');
    } finally {
      setIsSaving(false);
    }
  }, [gender, currentGender, userDocument, navigation, toast]);

  const hasChanges = gender !== currentGender;
  const canSave = hasChanges && !isSaving;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <ScreenHeader
        title="Gender"
        onLeftPress={handleBack}
        rightComponent={
          isSaving ? (
            <ActivityIndicator size="small" color="#16a34a" />
          ) : (
            <Pressable
              onPress={handleSave}
              disabled={!canSave}
              className="active:opacity-70"
            >
              <Text className={`text-base font-semibold ${
                canSave ? '!text-green-600' : '!text-gray-400'
              }`}>
                Save
              </Text>
            </Pressable>
          )
        }
      />

      <View className="flex-1 px-6 py-6">
        <Text className="mb-4 text-sm !text-gray-600">
          Select your gender
        </Text>

        <View className="gap-3">
          <Pressable
            onPress={() => {
              setGender('male');
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            className={`py-4 px-4 border-2 rounded-lg active:opacity-70 ${
              gender === 'male'
                ? 'bg-green-50 border-green-500'
                : 'bg-white border-gray-300'
            }`}
          >
            <Text
              className={`text-lg font-semibold ${
                gender === 'male' ? '!text-green-700' : '!text-gray-700'
              }`}
            >
              Male
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              setGender('female');
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            className={`py-4 px-4 border-2 rounded-lg active:opacity-70 ${
              gender === 'female'
                ? 'bg-green-50 border-green-500'
                : 'bg-white border-gray-300'
            }`}
          >
            <Text
              className={`text-lg font-semibold ${
                gender === 'female' ? '!text-green-700' : '!text-gray-700'
              }`}
            >
              Female
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
});

EditGenderScreen.displayName = 'EditGenderScreen';
