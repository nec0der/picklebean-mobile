/**
 * SwipeableMessage - Wrapper for swipe-to-reply gesture
 * Swipe right to trigger reply action (WhatsApp-style)
 */

import { memo, useRef, useCallback } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { Swipeable, GestureHandlerRootView } from 'react-native-gesture-handler';
import { Reply } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import type { Message } from '@/types/chat';

interface SwipeableMessageProps {
  message: Message;
  isOwnMessage: boolean;
  onReply: (message: Message) => void;
  children: React.ReactNode;
}

const SWIPE_THRESHOLD = 50;

export const SwipeableMessage = memo(({
  message,
  isOwnMessage,
  onReply,
  children,
}: SwipeableMessageProps) => {
  const swipeableRef = useRef<Swipeable>(null);
  const hasTriggeredHaptic = useRef(false);

  // Render the reply indicator on the left side
  const renderLeftActions = useCallback((
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    // Scale animation for the reply icon
    const scale = dragX.interpolate({
      inputRange: [0, SWIPE_THRESHOLD],
      outputRange: [0.5, 1],
      extrapolate: 'clamp',
    });

    const opacity = dragX.interpolate({
      inputRange: [0, SWIPE_THRESHOLD / 2, SWIPE_THRESHOLD],
      outputRange: [0, 0.5, 1],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View
        style={[
          styles.replyAction,
          {
            opacity,
            transform: [{ scale }],
          },
        ]}
      >
        <View style={styles.replyIcon}>
          <Reply size={20} color="#0EA5E9" />
        </View>
      </Animated.View>
    );
  }, []);

  // Handle swipe open - trigger reply
  const handleSwipeableOpen = useCallback((direction: 'left' | 'right') => {
    if (direction === 'left') {
      // Swipe right triggers left-side action
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onReply(message);
    }
    // Close the swipeable immediately
    swipeableRef.current?.close();
  }, [message, onReply]);

  // Track drag progress for haptic feedback
  const handleSwipeableWillOpen = useCallback((direction: 'left' | 'right') => {
    if (direction === 'left' && !hasTriggeredHaptic.current) {
      hasTriggeredHaptic.current = true;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  // Reset haptic flag when closed
  const handleSwipeableClose = useCallback(() => {
    hasTriggeredHaptic.current = false;
  }, []);

  return (
    <Swipeable
      ref={swipeableRef}
      renderLeftActions={renderLeftActions}
      onSwipeableOpen={handleSwipeableOpen}
      onSwipeableWillOpen={handleSwipeableWillOpen}
      onSwipeableClose={handleSwipeableClose}
      leftThreshold={SWIPE_THRESHOLD}
      friction={2}
      overshootLeft={false}
      overshootFriction={8}
      hitSlop={{ left: -20 }}
    >
      {children}
    </Swipeable>
  );
});

const styles = StyleSheet.create({
  replyAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    paddingLeft: 16,
  },
  replyIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E0F2FE', // sky-100
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export type { SwipeableMessageProps };
