/**
 * PlayNowDemoScreen
 * Demo screen for visual inspection of Play Now UI
 * Uses useState to switch between fixtures
 */

import { memo, useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PlayNowOutcomeView } from '@/features/play-now/components/PlayNowOutcomeView';
import { ALL_FIXTURES, GO_FIXTURE, DEFER_FIXTURE, AVOID_FIXTURE } from '@/features/play-now/fixtures';
import type { PlayNowResult } from '@/features/play-now/types';

export const PlayNowDemoScreen = memo(() => {
  const [selectedFixture, setSelectedFixture] = useState<PlayNowResult>(GO_FIXTURE);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'right', 'left']}>
      {/* Fixture Selector */}
      <View className="px-4 py-3 border-b border-gray-200">
        <Text className="mb-2 text-sm font-semibold text-gray-600">
          SELECT FIXTURE
        </Text>
        <View className="flex-row gap-2">
          <Pressable
            onPress={() => setSelectedFixture(GO_FIXTURE)}
            className={`flex-1 px-3 py-2 rounded-lg ${
              selectedFixture.kind === 'GO'
                ? 'bg-green-600'
                : 'bg-gray-100'
            }`}
          >
            <Text
              className={`text-center font-semibold ${
                selectedFixture.kind === 'GO'
                  ? 'text-white'
                  : 'text-gray-700'
              }`}
            >
              GO
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setSelectedFixture(DEFER_FIXTURE)}
            className={`flex-1 px-3 py-2 rounded-lg ${
              selectedFixture.kind === 'DEFER'
                ? 'bg-yellow-600'
                : 'bg-gray-100'
            }`}
          >
            <Text
              className={`text-center font-semibold ${
                selectedFixture.kind === 'DEFER'
                  ? 'text-white'
                  : 'text-gray-700'
              }`}
            >
              DEFER
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setSelectedFixture(AVOID_FIXTURE)}
            className={`flex-1 px-3 py-2 rounded-lg ${
              selectedFixture.kind === 'AVOID'
                ? 'bg-red-600'
                : 'bg-gray-100'
            }`}
          >
            <Text
              className={`text-center font-semibold ${
                selectedFixture.kind === 'AVOID'
                  ? 'text-white'
                  : 'text-gray-700'
              }`}
            >
              AVOID
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Outcome View */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <PlayNowOutcomeView result={selectedFixture} />
      </ScrollView>
    </SafeAreaView>
  );
});

PlayNowDemoScreen.displayName = 'PlayNowDemoScreen';
