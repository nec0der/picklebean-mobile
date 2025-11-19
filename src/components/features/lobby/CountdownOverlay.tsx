import { View, Text, Animated } from 'react-native';
import { useEffect, useRef } from 'react';
import * as Haptics from 'expo-haptics';

interface CountdownOverlayProps {
  visible: boolean;
  value: 1 | 2 | 'START!' | null;
}

export const CountdownOverlay = ({ visible, value }: CountdownOverlayProps) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && value) {
      // Trigger haptic feedback
      if (value === 'START!') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      // Reset and start animations
      scaleAnim.setValue(0);
      fadeAnim.setValue(1);

      // Scale up animation
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
    } else {
      // Fade out when hiding
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, value, scaleAnim, fadeAnim]);

  if (!visible) {
    return null;
  }

  const isStart = value === 'START!';
  const displayText = value === 1 || value === 2 ? '0' : value;

  return (
    <View className="absolute inset-0 z-50 flex items-center justify-center bg-white/95">
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }}
        className="items-center"
      >
        {/* Main countdown text */}
        <Text
          className={`font-bold ${
            isStart ? 'text-green-600' : 'text-gray-900'
          }`}
          style={{ fontSize: isStart ? 72 : 96 }}
        >
          {displayText}
        </Text>
      </Animated.View>
    </View>
  );
};

export type { CountdownOverlayProps };
