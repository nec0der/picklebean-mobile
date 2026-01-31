/**
 * DeferView
 * Pure UI render for DEFER outcome
 */

import { memo } from 'react';
import { View, Text } from 'react-native';
import { Clock, AlertCircle, Lightbulb } from 'lucide-react-native';
import type { DeferOutcome } from '../../types';

interface DeferViewProps {
  outcome: DeferOutcome;
}

export const DeferView = memo(({ outcome }: DeferViewProps) => {
  return (
    <View className="flex-1 p-4">
      {/* Header */}
      <View className="items-center mb-6">
        <View className="items-center justify-center w-16 h-16 mb-4 bg-yellow-100 rounded-full">
          <Clock size={32} color="#d97706" />
        </View>
        <Text className="text-2xl font-bold text-center text-gray-900">
          {outcome.primaryReason}
        </Text>
      </View>

      {/* Court Info Card */}
      <View className="p-4 mb-4 bg-white border border-gray-200 rounded-xl">
        <Text className="mb-3 text-xl font-bold text-gray-900">
          {outcome.courtName}
        </Text>

        <View className="flex-row items-start mb-3">
          <AlertCircle size={20} color="#d97706" className="mt-0.5" />
          <View className="flex-1 ml-2">
            <Text className="text-sm font-semibold text-gray-900">Deferral Reason</Text>
            <Text className="text-base text-gray-700">
              {outcome.reasonForDeferral}
            </Text>
          </View>
        </View>

        <View className="flex-row items-start">
          <Lightbulb size={20} color="#16a34a" className="mt-0.5" />
          <View className="flex-1 ml-2">
            <Text className="text-sm font-semibold text-gray-900">Suggestion</Text>
            <Text className="text-base text-gray-700">
              {outcome.suggestedAction}
            </Text>
          </View>
        </View>
      </View>

      {/* Confidence Card */}
      <View className="p-4 border border-yellow-200 bg-yellow-50 rounded-xl">
        <View className="flex-row items-center mb-2">
          <View className={`px-2 py-1 rounded ${
            outcome.confidence === 'HIGH' ? 'bg-green-600' :
            outcome.confidence === 'MEDIUM' ? 'bg-yellow-600' :
            'bg-gray-600'
          }`}>
            <Text className="text-xs font-semibold text-white">
              {outcome.confidence} CONFIDENCE
            </Text>
          </View>
        </View>
        <Text className="text-sm text-gray-700">
          {outcome.confidenceExplanation}
        </Text>
      </View>
    </View>
  );
});

DeferView.displayName = 'DeferView';
