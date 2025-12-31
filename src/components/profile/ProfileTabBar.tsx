import { memo } from 'react';
import { View, Text, Pressable } from 'react-native';

export type ProfileTab = 'matches' | 'statistics' | 'posts';

interface ProfileTabBarProps {
  activeTab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
}

export const ProfileTabBar = memo(({ activeTab, onTabChange }: ProfileTabBarProps) => {
  const tabs: { id: ProfileTab; label: string }[] = [
    { id: 'matches', label: 'Matches' },
    { id: 'statistics', label: 'Statistics' },
    { id: 'posts', label: 'Posts' },
  ];

  return (
    <View className="flex-row bg-white border-b border-gray-200">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        
        return (
          <Pressable
            key={tab.id}
            onPress={() => onTabChange(tab.id)}
            className="flex-1 py-4 active:bg-gray-50"
          >
            <Text
              className={`text-center text-sm ${
                isActive ? 'font-bold !text-gray-900' : 'font-medium !text-gray-500'
              }`}
            >
              {tab.label}
            </Text>
            {isActive && (
              <View className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600" />
            )}
          </Pressable>
        );
      })}
    </View>
  );
});

ProfileTabBar.displayName = 'ProfileTabBar';
