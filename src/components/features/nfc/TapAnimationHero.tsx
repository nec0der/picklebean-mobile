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

interface TapAnimationHeroProps {
  state: 'idle' | 'tapping' | 'success';
}

/**
 * Animated hero showing realistic paddle tapping iPhone
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
      {/* iPhone */}
      <View className="items-center justify-center">
        {/* Ripple effect (shown during tapping) */}
        {state === 'tapping' && (
          <Animated.View
            style={[rippleAnimatedStyle]}
            className="absolute w-32 h-32 border-4 border-blue-400 rounded-full"
          />
        )}
        
        {/* iPhone 14 Pro Style */}
        <View className="relative w-32 h-64 overflow-hidden bg-black border-4 border-gray-900 rounded-[32px]">
          {/* Dynamic Island */}
          <View className="absolute self-center w-24 h-8 bg-black top-2 rounded-3xl" />
          
          {/* Screen */}
          <View className="absolute inset-0 m-1 bg-white rounded-[28px]">
            {/* Status bar hint */}
            <View className="h-12" />
            {/* Screen content hint - subtle grid/app icons */}
            <View className="flex-row flex-wrap justify-around px-4 py-2">
              {[...Array(12)].map((_, i) => (
                <View key={i} className="w-6 h-6 m-1 bg-gray-200 rounded-xl" />
              ))}
            </View>
          </View>
        </View>
      </View>

      {/* Realistic Pickleball Paddle (animated) */}
      <Animated.View
        style={[paddleAnimatedStyle]}
        className="absolute top-0"
      >
        <View className="items-center">
          {/* Paddle Face - Circular with perforations */}
          <View className="relative items-center justify-center w-24 h-32 overflow-hidden bg-gray-900 rounded-[48px] border-4 border-gray-800">
            {/* Inner face - colored area */}
            <View className="absolute inset-2 bg-green-500 rounded-[40px]" />
            
            {/* Perforation pattern (holes) - 5x7 grid */}
            <View className="relative z-10 flex-row flex-wrap items-center justify-center w-20 h-28">
              {[...Array(35)].map((_, i) => (
                <View 
                  key={i} 
                  className="w-2 h-2 m-0.5 bg-gray-900 rounded-full"
                />
              ))}
            </View>
          </View>
          
          {/* Paddle Handle */}
          <View className="w-6 h-16 mt-1 bg-gray-800 rounded-full">
            {/* Grip texture lines */}
            <View className="absolute w-full h-px bg-gray-700 top-3" />
            <View className="absolute w-full h-px bg-gray-700 top-6" />
            <View className="absolute w-full h-px bg-gray-700 top-9" />
            <View className="absolute w-full h-px bg-gray-700 top-12" />
          </View>
        </View>
      </Animated.View>

      {/* Success indicator */}
      {state === 'success' && (
        <View className="absolute items-center justify-center w-20 h-20 -translate-x-10 -translate-y-10 bg-white rounded-full top-1/2 left-1/2">
          <Animated.View
            style={[{ transform: [{ scale: successScale.value }] }]}
            className="items-center justify-center w-16 h-16 bg-green-500 rounded-full"
          >
            {/* Checkmark */}
            <View className="w-8 h-4 transform -rotate-45 translate-y-[-2px]">
              <View className="absolute bottom-0 left-0 w-2 h-full bg-white rounded-full" />
              <View className="absolute bottom-0 right-0 w-2 h-4 bg-white rounded-full" />
            </View>
          </Animated.View>
        </View>
      )}
    </View>
  );
});

TapAnimationHero.displayName = 'TapAnimationHero';
