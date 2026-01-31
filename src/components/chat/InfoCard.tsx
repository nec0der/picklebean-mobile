/**
 * InfoCard - iOS Settings-style card container for chat info screens
 * Used in ChatInfoScreen and GroupInfoScreen
 */

import { memo, type ReactNode } from 'react';
import { View, Text, Pressable } from 'react-native';
import { ChevronRight } from 'lucide-react-native';

// Card Container - Groups multiple InfoCardItems
interface InfoCardProps {
  children: ReactNode;
  className?: string;
}

export const InfoCard = memo(({ children, className = '' }: InfoCardProps) => {
  return (
    <View className={`mx-4 mb-4 overflow-hidden bg-gray-100 rounded-xl ${className}`}>
      {children}
    </View>
  );
});

InfoCard.displayName = 'InfoCard';

// Card Item - Individual row in a card
interface InfoCardItemProps {
  icon?: ReactNode;
  label: string;
  value?: string;
  onPress?: () => void;
  showChevron?: boolean;
  destructive?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  disabled?: boolean;
  rightElement?: ReactNode;
}

export const InfoCardItem = memo(({
  icon,
  label,
  value,
  onPress,
  showChevron = true,
  destructive = false,
  isFirst = false,
  isLast = false,
  disabled = false,
  rightElement,
}: InfoCardItemProps) => {
  const textColor = destructive ? '!text-red-500' : '!text-gray-900';
  const valueColor = destructive ? '!text-red-400' : '!text-gray-500';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || !onPress}
      className={`flex-row items-center px-4 py-3.5 bg-gray-100 active:bg-gray-200 ${!isLast ? 'border-b border-gray-200' : ''}`}
    >
      {icon && (
        <View className="items-center justify-center w-8 h-8 mr-3">
          {icon}
        </View>
      )}
      <Text className={`flex-1 text-base font-normal ${textColor}`}>
        {label}
      </Text>
      {value && (
        <Text className={`text-base mr-1 ${valueColor}`}>
          {value}
        </Text>
      )}
      {rightElement}
      {showChevron && onPress && (
        <ChevronRight size={20} color={destructive ? '#EF4444' : '#9CA3AF'} />
      )}
    </Pressable>
  );
});

InfoCardItem.displayName = 'InfoCardItem';

// Quick Action Button - Card-style button for actions
interface QuickActionButtonProps {
  icon: ReactNode;
  label: string;
  onPress: () => void;
  active?: boolean;
}

export const QuickActionButton = memo(({
  icon,
  label,
  onPress,
  active = false,
}: QuickActionButtonProps) => {
  return (
    <Pressable
      onPress={onPress}
      className={`items-center justify-center flex-1 py-3 mx-1 rounded-xl ${active ? 'bg-sky-100' : 'bg-gray-100'} active:bg-gray-200`}
    >
      <View className="items-center justify-center w-10 h-10">
        {icon}
      </View>
      <Text className={`mt-1 text-xs font-medium ${active ? '!text-sky-600' : '!text-gray-700'}`}>
        {label}
      </Text>
    </Pressable>
  );
});

QuickActionButton.displayName = 'QuickActionButton';

// Section Header - For labeling sections
interface SectionHeaderProps {
  title: string;
  rightElement?: ReactNode;
}

export const SectionHeader = memo(({ title, rightElement }: SectionHeaderProps) => {
  return (
    <View className="flex-row items-center justify-between px-4 pt-6 pb-2">
      <Text className="text-sm font-medium uppercase !text-gray-500">{title}</Text>
      {rightElement}
    </View>
  );
});

SectionHeader.displayName = 'SectionHeader';
