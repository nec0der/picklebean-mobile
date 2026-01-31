/**
 * AvoidView
 * Pure UI render for AVOID outcome
 */

import { memo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { AlertTriangle, ShieldAlert } from 'lucide-react-native';
import type { AvoidOutcome } from '../../types';

interface AvoidViewProps {
  outcome: AvoidOutcome;
}

export const AvoidView = memo(({ outcome }: AvoidViewProps) => {
  return (
    <View className="flex-1 p-4">
      {/* Header */}
      <View className="items-center mb-6">
        <View className="items-center justify-center w-16 h-16 mb-4 bg-red-100 rounded-full">
          <AlertTriangle size={32} color="#dc2626" />
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

        <View className="flex-row items-start">
          <ShieldAlert size={20} color="#dc2626" className="mt-0.5" />
          <View className="flex-1 ml-2">
            <Text className="text-sm font-semibold text-gray-900">Why Avoid</Text>
            <Text className="text-base text-gray-700">
              {outcome.reasonForAvoidance}
            </Text>
          </View>
        </View>
      </View>

      {/* Confidence Card */}
      <View className="p-4 mb-4 border border-red-200 bg-red-50 rounded-xl">
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

      {/* Override Option (passive, no handler) */}
      {outcome.overrideAllowed && (
        <View className="p-4 border border-gray-200 bg-gray-50 rounded-xl">
          <Text className="mb-3 text-sm text-gray-600">
            You can still view this court if you'd like:
          </Text>
          <Pressable className="px-4 py-3 bg-white border border-gray-300 rounded-lg active:bg-gray-100">
            <Text className="font-semibold text-center text-gray-700">
              Show Anyway
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
});

AvoidView.displayName = 'AvoidView';
