import { memo, useRef, useState } from 'react';
import { View, Text, Pressable, Dimensions, ScrollView } from 'react-native';
import { Zap, Users, Heart } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface OnboardingCarouselProps {
  onComplete: () => void;
  onSkip: () => void;
}

const slides = [
  {
    icon: Zap,
    title: 'Stop Explaining.\nStart Playing.',
    description: 'Your stats show up instantly.\nNo more "What\'s your rating?"',
    color: '#3B82F6', // blue-500
  },
  {
    icon: Users,
    title: 'Tap to Join Games',
    description: 'Walk up. Tap paddle.\nYou\'re added to the match.',
    color: '#10B981', // green-500
  },
  {
    icon: Heart,
    title: 'Tap to Connect',
    description: 'Share your profile instantly.\nMake friends. Build community.',
    color: '#F59E0B', // amber-500
  },
];

export const OnboardingCarousel = memo(({ onComplete, onSkip }: OnboardingCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      scrollViewRef.current?.scrollTo({ x: width * nextIndex, animated: true });
    } else {
      onComplete();
    }
  };

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / width);
    setCurrentIndex(index);
  };

  const isLastSlide = currentIndex === slides.length - 1;

  return (
    <View className="flex-1 bg-white">
      {/* Header with Skip */}
      <View className="flex-row items-center justify-between px-6 pt-4 pb-2">
        <Pressable onPress={onSkip} className="py-2 active:opacity-70">
          <Text className="text-base !text-gray-600">Skip</Text>
        </Pressable>
        <Text className="text-sm !text-gray-400">
          {currentIndex + 1}/{slides.length}
        </Text>
      </View>

      {/* Slides */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {slides.map((slide, index) => (
          <View
            key={index}
            style={{ width }}
            className="items-center justify-center flex-1 px-8"
          >
            {/* Icon/Illustration */}
            <View
              className="items-center justify-center w-32 h-32 mb-8 rounded-full"
              style={{ backgroundColor: `${slide.color}15` }}
            >
              <slide.icon size={64} color={slide.color} />
            </View>

            {/* Title */}
            <Text className="mb-4 text-3xl font-bold text-center !text-gray-900">
              {slide.title}
            </Text>

            {/* Description */}
            <Text className="text-base text-center leading-6 !text-gray-600">
              {slide.description}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Dots Indicator */}
      <View className="flex-row justify-center gap-2 mb-6">
        {slides.map((_, index) => (
          <View
            key={index}
            className={`h-2 rounded-full ${
              index === currentIndex
                ? 'w-8 bg-blue-500'
                : 'w-2 bg-gray-300'
            }`}
          />
        ))}
      </View>

      {/* Next/Get Started Button */}
      <View className="px-6 pb-8">
        <Pressable
          onPress={handleNext}
          className="items-center justify-center py-4 rounded-2xl bg-[#007AFF] active:bg-[#0051D5]"
        >
          <Text className="text-lg font-semibold !text-white">
            {isLastSlide ? 'Get Started' : 'Next'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
});

OnboardingCarousel.displayName = 'OnboardingCarousel';
