import { memo } from 'react';
import { View, Text } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';

interface StatCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  iconColor?: string;
  iconBgColor?: string;
}

export const StatCard = memo(({
  icon: Icon,
  value,
  label,
  iconColor = '#3b82f6',
  iconBgColor = 'bg-blue-100',
}: StatCardProps) => {
  return (
    <View className="flex-1 p-4 bg-white border border-gray-200 rounded-xl">
      <View className={`items-center justify-center w-10 h-10 mb-3 rounded-lg ${iconBgColor}`}>
        <Icon size={20} color={iconColor} />
      </View>
      <Text className="text-2xl font-bold text-gray-900">{value}</Text>
      <Text className="mt-1 text-sm text-gray-600">{label}</Text>
    </View>
  );
});

StatCard.displayName = 'StatCard';

export type { StatCardProps };
