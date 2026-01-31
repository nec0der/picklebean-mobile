import { memo, useRef, useEffect } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import type { GameCategory } from '@/types/lobby';

export type CategoryFilter =
  | 'all_singles'
  | 'mens_singles'
  | 'womens_singles'
  | 'all_doubles'
  | 'mens_doubles'
  | 'womens_doubles';

interface CategorySelectProps {
  value: CategoryFilter;
  onChange: (value: CategoryFilter) => void;
}

const categories: { value: CategoryFilter; label: string }[] = [
  { value: 'all_doubles', label: 'Doubles' },
  { value: 'all_singles', label: 'Singles' },
  { value: 'mens_doubles', label: "Men's Doubles" },
  { value: 'womens_doubles', label: "Women's Doubles" },
  { value: 'mens_singles', label: "Men's Singles" },
  { value: 'womens_singles', label: "Women's Singles" },
];

export const CategorySelect = memo(({ value, onChange }: CategorySelectProps) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const buttonLayouts = useRef<Record<string, { x: number; width: number }>>({});

  // Auto-scroll to selected category when value changes
  useEffect(() => {
    const selectedIndex = categories.findIndex((c) => c.value === value);
    if (selectedIndex !== -1 && buttonLayouts.current[value]) {
      const layout = buttonLayouts.current[value];
      const scrollX = Math.max(0, layout.x - 60); // Offset to center better
      
      scrollViewRef.current?.scrollTo({
        x: scrollX,
        animated: true,
      });
    }
  }, [value]);

  const handleLayout = (categoryValue: string, x: number, width: number) => {
    buttonLayouts.current[categoryValue] = { x, width };
  };

  return (
    <ScrollView
      ref={scrollViewRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      className="flex-row px-4 -mx-4"
      contentContainerStyle={{ paddingRight: 16 }}
    >
      {categories.map((category) => {
        const isSelected = value === category.value;
        return (
          <Pressable
            key={category.value}
            onPress={() => onChange(category.value)}
            onLayout={(event) => {
              const { x, width } = event.nativeEvent.layout;
              handleLayout(category.value, x, width);
            }}
            className={`mr-2 px-4 py-2 rounded-full border ${
              isSelected
                ? 'bg-blue-500 border-blue-500'
                : 'bg-white border-gray-300'
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                isSelected ? 'text-white' : 'text-gray-700'
              }`}
            >
              {category.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
});

CategorySelect.displayName = 'CategorySelect';

/**
 * Helper to convert CategoryFilter to GameCategory and gender
 */
export const parseCategoryFilter = (
  filter: CategoryFilter
): { category: GameCategory; gender: 'male' | 'female' | undefined } => {
  switch (filter) {
    case 'all_singles':
      return { category: 'singles', gender: undefined };
    case 'mens_singles':
      return { category: 'singles', gender: 'male' };
    case 'womens_singles':
      return { category: 'singles', gender: 'female' };
    case 'all_doubles':
      return { category: 'same_gender_doubles', gender: undefined };
    case 'mens_doubles':
      return { category: 'same_gender_doubles', gender: 'male' };
    case 'womens_doubles':
      return { category: 'same_gender_doubles', gender: 'female' };
  }
};

export type { CategorySelectProps };
