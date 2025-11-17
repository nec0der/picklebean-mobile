import { memo, useRef } from 'react';
import { View, Text, LayoutChangeEvent } from 'react-native';
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
  onDragMove?: (x: number, y: number) => void;
  onDragEnd: (x: number, y: number) => void;
  onLayout: (team: number, slot: number, layout: { x: number; y: number; width: number; height: number }) => void;
  isHighlighted?: boolean;
}

export const DraggablePlayerSlot = memo(({
  player,
  teamNumber,
  slotNumber,
  isHost,
  isCurrentUser,
  hostId,
  onDragStart,
  onDragMove,
  onDragEnd,
  onLayout,
  isHighlighted = false,
}: DraggablePlayerSlotProps) => {
  const viewRef = useRef<View>(null);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const zIndex = useSharedValue(1);

  const hasPlayer = !!player?.uid;
  const canDrag = isHost && hasPlayer;
  const isHostPlayer = player?.uid === hostId;

  // Track position when layout changes
  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    // Use setTimeout to ensure measurement after layout
    setTimeout(() => {
      viewRef.current?.measureInWindow((x, y) => {
        onLayout(teamNumber, slotNumber, { x, y, width, height });
      });
    }, 0);
  };

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
      
      // Notify parent of current drag position for highlighting
      if (onDragMove) {
        runOnJS(onDragMove)(event.absoluteX, event.absoluteY);
      }
    })
    .onEnd((event) => {
      // Pass absolute position to parent to determine drop target
      runOnJS(onDragEnd)(event.absoluteX, event.absoluteY);
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
      <View 
        ref={viewRef}
        onLayout={handleLayout}
        className={`p-3 border-2 border-dashed rounded-lg ${
          isHighlighted 
            ? 'border-green-400 bg-green-50' 
            : 'border-gray-300 bg-gray-50'
        }`}
      >
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
          ref={viewRef}
          onLayout={handleLayout}
          className={`flex-row items-center p-3 rounded-lg ${
            isHighlighted
              ? 'bg-green-50 border-2 border-green-400'
              : isCurrentUser 
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
