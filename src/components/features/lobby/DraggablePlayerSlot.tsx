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
import { ChevronsUpDown } from 'lucide-react-native';
import { Avatar } from '@/components/ui/Avatar';
import { LoadingSpinner } from '@/components/common';
import type { Player } from '@/types/lobby';

interface DraggablePlayerSlotProps {
  player?: Player;
  teamNumber: 1 | 2;
  slotNumber: 1 | 2;
  isHost: boolean;
  isCurrentUser: boolean;
  hostId: string;
  gameMode: 'singles' | 'doubles';
  playerRating?: number;
  onDragStart: (team: number, slot: number, width: number, height: number) => void;
  onDragMove?: (x: number, y: number) => void;
  onDragEnd: (x: number, y: number) => void;
  onLayout: (team: number, slot: number, layout: { x: number; y: number; width: number; height: number }) => void;
  onPlayerTap?: (player: Player) => void;
  isHighlighted?: boolean;
}

export const DraggablePlayerSlot = memo(({
  player,
  teamNumber,
  slotNumber,
  isHost,
  isCurrentUser,
  hostId,
  gameMode,
  playerRating = 1000,
  onDragStart,
  onDragMove,
  onDragEnd,
  onLayout,
  onPlayerTap,
  isHighlighted = false,
}: DraggablePlayerSlotProps) => {
  const viewRef = useRef<View>(null);
  const cardWidth = useSharedValue(0);
  const cardHeight = useSharedValue(0);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const zIndex = useSharedValue(1);
  const showPlaceholder = useSharedValue(0);

  const hasPlayer = !!player?.uid;
  const canDrag = isHost && hasPlayer;
  const isHostPlayer = player?.uid === hostId;

  // Track position when layout changes
  const handleLayout = (event: LayoutChangeEvent) => {
    // Use setTimeout to ensure measurement after layout
    setTimeout(() => {
      viewRef.current?.measureInWindow((x, y, width, height) => {
        onLayout(teamNumber, slotNumber, { x, y, width, height });
      });
    }, 0);
  };

  // Track card size from placeholder (which matches actual card dimensions)
  const handleCardSizeLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    cardWidth.value = width;
    cardHeight.value = height;
  };

  // Tap gesture for opening action menu
  const tapGesture = Gesture.Tap()
    .enabled(hasPlayer)
    .maxDuration(250)
    .onEnd(() => {
      if (player && onPlayerTap) {
        runOnJS(onPlayerTap)(player);
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
      }
    });

  // Long press gesture for dragging (host only)
  const longPressGesture = Gesture.LongPress()
    .enabled(canDrag)
    .minDuration(300)
    .onStart(() => {
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
    });

  // Pan gesture for dragging
  const panGesture = Gesture.Pan()
    .enabled(canDrag)
    .onStart(() => {
      // Start drag - show placeholder and boost z-index
      zIndex.value = 999;
      showPlaceholder.value = withSpring(1);
      runOnJS(onDragStart)(
        teamNumber, 
        slotNumber, 
        cardWidth.value, 
        cardHeight.value
      );
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
    })
    .onUpdate((event) => {
      // Lock X-axis, only allow Y-axis movement
      translateX.value = 0;
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

      // Snap back to original position and hide placeholder
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
      zIndex.value = 1;
      showPlaceholder.value = withSpring(0);
    });

  // Combine gestures - Race between tap and drag
  // Tap wins if completed < 250ms, drag wins if held ≥ 300ms
  const composedGesture = Gesture.Race(
    tapGesture,
    Gesture.Simultaneous(longPressGesture, panGesture)
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    zIndex: zIndex.value,
  }));

  const placeholderStyle = useAnimatedStyle(() => ({
    opacity: showPlaceholder.value,
  }));

  if (!hasPlayer) {
    // Empty slot - show drop target
    return (
      <View 
        ref={viewRef}
        onLayout={handleLayout}
        className={`h-20 flex-row items-center px-3 border-2 border-dashed rounded-lg ${
          isHighlighted 
            ? 'border-green-400 bg-green-50' 
            : 'border-gray-300 bg-gray-50'
        }`}
      >
        <LoadingSpinner size="small" />
        <Text className="ml-3 text-sm text-gray-400">Waiting for player...</Text>
      </View>
    );
  }

  return (
    <View 
      ref={viewRef}
      onLayout={handleLayout}
    >
      {/* Placeholder - shows at original position during drag */}
      <Animated.View 
        style={placeholderStyle}
        className="h-20 p-3 border-2 border-blue-400 border-dashed rounded-lg bg-blue-50"
      >
        <View className="flex-row items-center py-2">
          <View className="w-10 h-10 bg-blue-200 rounded-full" />
          <View className="flex-1 ml-3">
            <View className="w-24 h-4 mb-1 bg-blue-200 rounded" />
            <View className="w-16 h-3 bg-blue-100 rounded" />
          </View>
        </View>
      </Animated.View>

      {/* Draggable card - moves during drag */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
        <GestureDetector gesture={composedGesture}>
          <Animated.View style={animatedStyle}>
            <View 
              onLayout={handleCardSizeLayout}
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
              <View className="flex-1 ml-3">
                {/* Username + Badges (inline) */}
                <View className="flex-row flex-wrap items-center gap-2">
                  <Text className="font-semibold text-gray-900">
                    {player.displayName}
                  </Text>
                  {isHostPlayer && (
                    <Text className="text-xs text-blue-600">Host</Text>
                  )}
                  {isCurrentUser && (
                    <Text className="text-xs text-green-600">You</Text>
                  )}
                </View>
                
                {/* Rating (below username) */}
                <Text className="text-sm text-gray-600 mt-0.5">
                  {playerRating} points
                </Text>
              </View>
              {isHost && canDrag && (
                <View className="ml-2">
                  <ChevronsUpDown size={20} color="#9CA3AF" />
                </View>
              )}
            </View>
          </Animated.View>
        </GestureDetector>
      </View>
    </View>
  );
});

DraggablePlayerSlot.displayName = 'DraggablePlayerSlot';
