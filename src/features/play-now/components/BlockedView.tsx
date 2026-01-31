/**
 * BlockedView
 * Guidance UI when engine cannot make a recommendation
 * Pure render - no logic, no handlers
 */

import { memo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { AlertCircle, MapPin, Clock, Target } from 'lucide-react-native';
import type { EngineReadinessResult, EngineReadinessBlockerCode } from '../types';

interface BlockedViewProps {
  readiness: EngineReadinessResult;
}

const BLOCKER_ICONS: Record<EngineReadinessBlockerCode, typeof AlertCircle> = {
  NO_LOCATION: MapPin,
  NO_TIME_WINDOW: Clock,
  NO_COURTS_AVAILABLE: Target,
  LOW_DATA_CONFIDENCE: AlertCircle,
  NO_USER_SKILL: Target,
  NO_PLAY_NOW_INTENT: AlertCircle,
};

export const BlockedView = memo(({ readiness }: BlockedViewProps) => {
  return (
    <View className="flex-1 p-4">
      {/* Header */}
      <View className="items-center mb-6">
        <View className="items-center justify-center w-16 h-16 mb-4 bg-gray-100 rounded-full">
          <AlertCircle size={32} color="#6b7280" />
        </View>
        <Text className="text-2xl font-bold text-center text-gray-900">
          We can't recommend yet
        </Text>
        <Text className="mt-2 text-base text-center text-gray-600">
          Help us find the best court for you
        </Text>
      </View>

      {/* Blockers List */}
      <View className="mb-4">
        <Text className="mb-3 text-sm font-semibold text-gray-700 uppercase">
          What we need
        </Text>
        {readiness.blockers.map((blocker, index) => {
          const Icon = BLOCKER_ICONS[blocker.code];
          return (
            <View
              key={`${blocker.code}-${index}`}
              className="flex-row items-center p-4 mb-3 bg-white border border-gray-200 rounded-xl"
            >
              <View className="items-center justify-center w-10 h-10 mr-3 bg-gray-100 rounded-full">
                <Icon size={20} color="#6b7280" />
              </View>
              <Text className="flex-1 text-base text-gray-900">
                {blocker.message}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Confidence Badge */}
      <View className="p-4 border border-gray-200 bg-gray-50 rounded-xl">
        <View className="flex-row items-center mb-2">
          <View className={`px-2 py-1 rounded ${
            readiness.confidence === 'HIGH' ? 'bg-green-600' :
            readiness.confidence === 'MEDIUM' ? 'bg-yellow-600' :
            'bg-gray-600'
          }`}>
            <Text className="text-xs font-semibold text-white">
              {readiness.confidence} CONFIDENCE
            </Text>
          </View>
        </View>
        <Text className="text-sm text-gray-700">
          {readiness.confidence === 'LOW' 
            ? 'We need more information to make a confident recommendation'
            : readiness.confidence === 'MEDIUM'
            ? 'We have some data but need more to be confident'
            : 'Data quality is good, but requirements not met'}
        </Text>
      </View>

      {/* Placeholder CTAs (no handlers) */}
      <View className="mt-6 space-y-3">
        <Pressable className="px-6 py-4 bg-white border-2 border-gray-300 rounded-xl">
          <Text className="font-semibold text-center text-gray-700">
            Set Time Window
          </Text>
        </Pressable>
        <Pressable className="px-6 py-4 bg-white border-2 border-gray-300 rounded-xl">
          <Text className="font-semibold text-center text-gray-700">
            Enable Location
          </Text>
        </Pressable>
      </View>
    </View>
  );
});

BlockedView.displayName = 'BlockedView';
