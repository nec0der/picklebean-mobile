import { memo } from 'react';
import { View, Text } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Avatar } from '@/components/ui/Avatar';
import type { Player } from '@/types/lobby';

interface DraggablePlayerSlotProps {
  player?: Player;
  teamNumber: 1 | 2;
  slotNumber: 1 | 2;
  isHost: boolean;
  isCurrentUser: boolean;
  hostId: string;
  onDragStart: (team: number, slot: number) => void;
  onDragEnd: (targetTeam: number, targetSlot: number) => void;
}

export const DraggablePlayerSlot = memo(({
  player,
  teamNumber,
  slotNumber,
  isHost,
  isCurrentUser,
  hostId,
  onDragStart,
  onDragEnd,
}: DraggablePlayerSlotProps) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const zIndex = useSharedValue(1);

  const hasPlayer = !!player?.uid;
  const canDrag = isHost && hasPlayer;
  const isHostPlayer = player?.uid === hostId;

  // Long press gesture for dragging (host only)
  const longPressGesture = Gesture.LongPress()
    .enabled(canDrag)
    .minDuration(300)
    .onStart(() => {
      scale.value = withSpring(1.05);
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
    });

  // Pan gesture for dragging
  const panGesture = Gesture.Pan()
    .enabled(canDrag)
    .onStart(() => {
      // Start drag - lift effect
      scale.value = withSpring(1.1);
      zIndex.value = 999;
      runOnJS(onDragStart)(teamNumber, slotNumber);
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
    })
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd(() => {
      // For now, we'll make it simpler - just trigger the callback
      // The parent will handle the drop logic
      runOnJS(onDragEnd)(teamNumber, slotNumber);
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);

      // Snap back to original position
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
      scale.value = withSpring(1);
      zIndex.value = 1;
    });

  // Combine gestures
  const composedGesture = Gesture.Simultaneous(longPressGesture, panGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    zIndex: zIndex.value,
  }));

  if (!hasPlayer) {
    // Empty slot - show drop target
    return (
      <View className="p-3 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
        <View className="flex-row items-center justify-center py-2">
          <Text className="text-gray-400 text-sm">Waiting for player...</Text>
        </View>
      </View>
    );
  }

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View style={animatedStyle}>
        <View 
          className={`flex-row items-center p-3 rounded-lg ${
            isCurrentUser 
              ? 'bg-blue-50 border-2 border-blue-300' 
              : 'bg-gray-100 border-2 border-gray-200'
          }`}
        >
          <Avatar
            uri={player.photoURL}
            name={player.displayName}
            size="md"
          />
          <View className="ml-3 flex-1">
            <Text className="font-semibold text-gray-900">
              {player.displayName}
            </Text>
            <View className="flex-row items-center gap-2">
              {isHostPlayer && (
                <Text className="text-xs text-blue-600">Host</Text>
              )}
              {isCurrentUser && (
                <Text className="text-xs text-green-600">You</Text>
              )}
            </View>
          </View>
          {isHost && canDrag && (
            <Text className="text-gray-400 text-xs ml-2">Hold to move</Text>
          )}
        </View>
      </Animated.View>
    </GestureDetector>
  );
});

DraggablePlayerSlot.displayName = 'DraggablePlayerSlot';
