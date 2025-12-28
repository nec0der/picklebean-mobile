import { memo, useRef, useEffect } from 'react';
import { View, Text, ScrollView, Dimensions, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const NUMBER_WIDTH = 60;
const NUMBER_GAP = 12;
const ITEM_WIDTH = NUMBER_WIDTH + NUMBER_GAP;

interface HorizontalNumberPickerProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  label: string;
  color: 'green' | 'blue';
}

export const HorizontalNumberPicker = memo(({
  value,
  onChange,
  min,
  max,
  label,
  color,
}: HorizontalNumberPickerProps) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const numbers = Array.from({ length: max - min + 1 }, (_, i) => i + min);
  
  // Calculate exact snap offsets for each number
  const snapOffsets = numbers.map((_, index) => index * ITEM_WIDTH);

  // Color scheme based on team
  const colorClasses = {
    green: {
      label: '!text-green-700',
      selectedText: '!text-green-900',
    },
    blue: {
      label: '!text-blue-700',
      selectedText: '!text-blue-900',
    },
  };

  const colors = colorClasses[color];

  // Scroll to default value on mount only
  useEffect(() => {
    const index = value - min;
    const offset = index * ITEM_WIDTH;
    
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        x: offset,
        animated: false,
      });
    }, 100);
  }, []); // Empty deps - only run once on mount

  // Handle scroll to auto-select centered number
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    // Simply divide scroll position by item width
    // The paddingHorizontal already centers items, so we just count how many we've scrolled
    const index = Math.round(offsetX / ITEM_WIDTH);
    const newValue = Math.max(min, Math.min(max, min + index));
    
    if (newValue !== value) {
      // Light haptic feedback on value change (subtle, like physical wheel)
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onChange(newValue);
    }
  };

  // Calculate distance-based styling for iOS wheel effect
  // Returns numeric values for smooth animations
  const getNumberStyle = (num: number, currentValue: number) => {
    const distance = Math.abs(num - currentValue);
    
    if (distance === 0) {
      // Centered number - largest and most visible
      return {
        opacity: 1,
        fontSize: 24,
      };
    } else if (distance === 1) {
      // Adjacent numbers - medium size
      return {
        opacity: 0.6,
        fontSize: 18,
      };
    } else {
      // Far numbers - smallest
      return {
        opacity: 0.3,
        fontSize: 16,
      };
    }
  };

  return (
    <View className="mb-6">
      {/* Label */}
      <Text className={`text-base px-4 font-semibold mb-3 ${colors.label}`}>
        {label}
      </Text>

      {/* Container with center indicator */}
      <View className="relative h-20">
        {/* Scrollable Numbers */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          scrollEnabled={true}
          showsHorizontalScrollIndicator={false}
          snapToOffsets={snapOffsets}
          snapToAlignment="center"
          decelerationRate="fast"
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={{ height: 80 }}
          contentContainerStyle={{
            paddingHorizontal: (SCREEN_WIDTH - NUMBER_WIDTH - NUMBER_GAP) / 2,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          {numbers.map((num) => {
            const style = getNumberStyle(num, value);
            const isSelected = num === value;
            
            return (
              <View
                key={num}
                style={{ 
                  width: NUMBER_WIDTH,
                  marginHorizontal: NUMBER_GAP / 2,
                  height: 80,
                  justifyContent: 'center',
                  alignItems: 'center',
                  opacity: style.opacity,
                }}
              >
                <Text
                  className={`font-bold ${isSelected ? colors.selectedText : '!text-gray-400'}`}
                  style={{ 
                    fontSize: style.fontSize,
                  }}
                >
                  {num}
                </Text>
              </View>
            );
          })}
        </ScrollView>

        {/* Fixed Center Selection Indicator (iOS-style) */}
        <View className="absolute inset-0 items-center justify-center pointer-events-none">
          <View 
            className={`
              w-16 h-16 rounded-lg border-2
              ${color === 'green' ? 'border-green-400 bg-green-50/30' : 'border-blue-400 bg-blue-50/30'}
            `}
          />
        </View>
      </View>
    </View>
  );
});

HorizontalNumberPicker.displayName = 'HorizontalNumberPicker';
