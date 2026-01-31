/**
 * GoView
 * Pure UI render for GO outcome
 */

import { memo } from 'react';
import { View, Text } from 'react-native';
import { MapPin, Clock, Timer } from 'lucide-react-native';
import type { GoOutcome } from '../../types';

interface GoViewProps {
  outcome: GoOutcome;
}

export const GoView = memo(({ outcome }: GoViewProps) => {
  return (
    <View className="flex-1 p-4">
      {/* Header */}
      <View className="items-center mb-6">
        <View className="items-center justify-center w-16 h-16 mb-4 bg-green-100 rounded-full">
          <MapPin size={32} color="#16a34a" />
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

        <View className="flex-row items-center mb-2">
          <Clock size={20} color="#6b7280" />
          <Text className="ml-2 text-base text-gray-700">
            {outcome.travelMinutes} min travel time
          </Text>
        </View>

        <View className="flex-row items-center">
          <Timer size={20} color="#6b7280" />
          <Text className="ml-2 text-base text-gray-700">
            ~{outcome.estimatedWaitMinutes} min estimated wait
          </Text>
        </View>
      </View>

      {/* Confidence Card */}
      <View className="p-4 border border-green-200 bg-green-50 rounded-xl">
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

GoView.displayName = 'GoView';
