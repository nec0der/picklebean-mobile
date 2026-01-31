/**
 * Court Activity Level Configuration
 * Single source of truth for activity indicators
 */

export type ActivityLevel = 'low' | 'medium' | 'high';

interface ActivityConfig {
  color: string;
  label: string;
}

export const ACTIVITY_CONFIG: Record<ActivityLevel, ActivityConfig> = {
  low: {
    color: '#9CA3AF',
    label: 'low activity',
  },
  medium: {
    color: '#F59E0B',
    label: 'medium activity',
  },
  high: {
    color: '#10B981',
    label: 'high activity',
  },
};

export const getActivityConfig = (level: ActivityLevel): ActivityConfig => {
  return ACTIVITY_CONFIG[level];
};
