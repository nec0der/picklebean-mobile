import { memo } from 'react';
import { View, Text } from 'react-native';
import { Trophy, TrendingUp } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';

interface StatItemProps {
  icon: LucideIcon | string;
  value: string | number;
  label: string;
  iconColor?: string;
}

const StatItem = memo(({ icon, value, label, iconColor = '#6b7280' }: StatItemProps) => {
  const isStringIcon = typeof icon === 'string';

  return (
    <View className="items-center flex-1">
      {isStringIcon ? (
        <Text className="text-xl">{icon}</Text>
      ) : (
        (() => {
          const Icon = icon as LucideIcon;
          return <Icon size={20} color={iconColor} />;
        })()
      )}
      <Text className="mt-1 text-xl font-bold text-gray-900">{value}</Text>
      <Text className="text-xs text-gray-500">{label}</Text>
    </View>
  );
});

StatItem.displayName = 'StatItem';

interface CompactStatBarProps {
  totalMatches: number;
  winRate: string;
  streak: {
    type: 'win' | 'loss' | null;
    count: number;
  };
}

export const CompactStatBar = memo(({ totalMatches, winRate, streak }: CompactStatBarProps) => {
  const streakIcon = streak.type === 'win' ? '🔥' : streak.type === 'loss' ? '💔' : '➖';
  const streakLabel = streak.type === 'win' ? 'Win Streak' : streak.type === 'loss' ? 'Loss Streak' : 'No Streak';

  return (
    <View className="p-4 mb-4 bg-white border border-gray-200 rounded-lg">
      <View className="flex-row justify-between">
        <StatItem icon={Trophy} value={totalMatches} label="Matches" iconColor="#f59e0b" />
        <View className="w-px bg-gray-200" />
        <StatItem icon={TrendingUp} value={`${winRate}%`} label="Win Rate" iconColor="#10b981" />
        <View className="w-px bg-gray-200" />
        <StatItem icon={streakIcon} value={streak.count} label={streakLabel} />
      </View>
    </View>
  );
});

CompactStatBar.displayName = 'CompactStatBar';
