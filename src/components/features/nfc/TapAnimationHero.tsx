import { memo, useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { Smartphone } from 'lucide-react-native';

interface TapAnimationHeroProps {
  state: 'idle' | 'tapping' | 'success';
}

/**
 * Animated hero showing paddle tapping phone
 * - Idle: Paddle bounces gently above phone
 * - Tapping: Paddle moves to phone with ripple effect
 * - Success: Celebration with scale animation
 */
export const TapAnimationHero = memo(({ state }: TapAnimationHeroProps) => {
  const paddleY = useSharedValue(0);
  const paddleScale = useSharedValue(1);
  const rippleScale = useSharedValue(0);
  const rippleOpacity = useSharedValue(0);
  const successScale = useSharedValue(1);

  // Idle animation: gentle bounce
  useEffect(() => {
    if (state === 'idle') {
      paddleY.value = withRepeat(
        withSequence(
          withTiming(-20, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 1200, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    }
  }, [state, paddleY]);

  // Tapping animation: move down and create ripple
  useEffect(() => {
    if (state === 'tapping') {
      paddleY.value = withSpring(40, { damping: 15, stiffness: 150 });
      paddleScale.value = withSpring(0.95);
      
      // Ripple effect
      rippleScale.value = 0;
      rippleOpacity.value = 0.6;
      rippleScale.value = withRepeat(
        withTiming(1, { duration: 1500, easing: Easing.out(Easing.ease) }),
        -1,
        false
      );
      rippleOpacity.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: 0 }),
          withTiming(0, { duration: 1500, easing: Easing.out(Easing.ease) })
        ),
        -1,
        false
      );
    }
  }, [state, paddleY, paddleScale, rippleScale, rippleOpacity]);

  // Success animation: scale up
  useEffect(() => {
    if (state === 'success') {
      successScale.value = withSequence(
        withSpring(1.15, { damping: 8, stiffness: 200 }),
        withSpring(1, { damping: 10, stiffness: 150 })
      );
    }
  }, [state, successScale]);

  const paddleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: paddleY.value },
      { scale: paddleScale.value * successScale.value },
    ],
  }));

  const rippleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rippleScale.value }],
    opacity: rippleOpacity.value,
  }));

  return (
    <View className="items-center justify-center h-64">
      {/* Phone */}
      <View className="items-center justify-center">
        {/* Ripple effect (shown during tapping) */}
        {state === 'tapping' && (
          <Animated.View
            style={[rippleAnimatedStyle]}
            className="absolute w-32 h-32 border-4 border-blue-400 rounded-full"
          />
        )}
        
        {/* Phone graphic */}
        <View className="items-center justify-center w-24 h-40 border-4 border-gray-800 bg-gray-50 rounded-2xl">
          <Smartphone size={40} color="#9CA3AF" />
        </View>
      </View>

      {/* Paddle (animated) */}
      <Animated.View
        style={[paddleAnimatedStyle]}
        className="absolute top-8"
      >
        {/* Simple paddle representation */}
        <View className="items-center">
          {/* Paddle face */}
          <View className="w-20 border-4 border-blue-700 shadow-lg h-28 bg-gradient-to-b from-blue-500 to-blue-600 rounded-3xl" />
          {/* Paddle handle */}
          <View className="w-8 h-12 mt-1 bg-blue-800 rounded-full" />
        </View>
      </Animated.View>

      {/* Success indicator */}
      {state === 'success' && (
        <View className="absolute -translate-x-6 -translate-y-6 top-1/2 left-1/2">
          <Animated.View
            style={[{ transform: [{ scale: successScale.value }] }]}
            className="items-center justify-center w-12 h-12 bg-green-500 rounded-full"
          >
            <View className="w-6 h-3 transform -rotate-45 -translate-y-1 border-b-4 border-l-4 border-white" />
          </Animated.View>
        </View>
      )}
    </View>
  );
});

TapAnimationHero.displayName = 'TapAnimationHero';
