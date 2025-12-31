import { memo } from 'react';
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
  { value: 'all_singles', label: 'Singles (All)' },
  { value: 'mens_singles', label: "Men's Singles" },
  { value: 'womens_singles', label: "Women's Singles" },
  { value: 'all_doubles', label: 'Doubles (All)' },
  { value: 'mens_doubles', label: "Men's Doubles" },
  { value: 'womens_doubles', label: "Women's Doubles" },
];

export const CategorySelect = memo(({ value, onChange }: CategorySelectProps) => {
  return (
    <ScrollView
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
