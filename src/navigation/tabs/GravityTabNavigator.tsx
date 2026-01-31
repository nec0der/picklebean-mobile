/**
 * GravityTabNavigator - Compact tab navigation for Gravity product
 * AllTrails-inspired design: Grounded, full-width, labels below icons
 */

import { memo } from 'react';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapPin, MessageCircle, User } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

// Gravity Screens
import { GravityMapScreen } from '@/screens/gravity/GravityMapScreen';
import { ChatsScreen } from '@/screens/ChatsScreen';
import { GravityProfileScreen } from '@/screens/gravity/GravityProfileScreen';

// Hooks
import { useChats } from '@/hooks/firestore/useChats';

// Filter state type for GravityMap
export interface MapFilterState {
  mode: 'activity' | 'social' | 'explore' | 'events' | 'train';
  activityFilter: 'all' | 'business';
  socialFilter: 'all' | 'following' | 'followers';
  exploreFilter: 'all' | 'indoor' | 'outdoor';
  eventsFilter: 'all' | 'upcoming' | 'this_week';
  trainFilter: 'beginner' | 'intermediate' | 'advanced';
}

// Navigation types for Gravity
export type GravityTabParamList = {
  GravityMap: { filterState?: MapFilterState } | undefined;
  Chats: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<GravityTabParamList>();

// Tab config
const TAB_CONFIG = [
  { name: 'GravityMap', label: 'Map', icon: MapPin },
  { name: 'Chats', label: 'Chats', icon: MessageCircle },
  { name: 'Profile', label: 'Profile', icon: User },
] as const;

// Compact tab bar dimensions
const TAB_HEIGHT = 50;
const ICON_SIZE = 22;

// Colors
const ACTIVE_COLOR = '#3B82F6'; // blue-500
const INACTIVE_COLOR = '#9CA3AF'; // gray-400

// Export height for screens that need bottom padding
export const COMPACT_TAB_BAR_HEIGHT = TAB_HEIGHT;
// Keep legacy export for backward compatibility
export const FLOATING_TAB_BAR_HEIGHT = TAB_HEIGHT;

// Chat Badge Component
const ChatBadge = memo(() => {
  const { totalUnread } = useChats();
  
  if (totalUnread === 0) return null;
  
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>
        {totalUnread > 99 ? '99+' : totalUnread}
      </Text>
    </View>
  );
});

ChatBadge.displayName = 'ChatBadge';

// Compact Tab Bar - AllTrails style
const CompactTabBar = memo(({ state, navigation }: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const config = TAB_CONFIG[index];
          const IconComponent = config.icon;
          const color = isFocused ? ACTIVE_COLOR : INACTIVE_COLOR;
          
          const onPress = () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };
          
          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={styles.tab}
            >
              <View style={styles.tabContent}>
                <View style={styles.iconContainer}>
                  <IconComponent
                    size={ICON_SIZE}
                    color={color}
                    strokeWidth={isFocused ? 2.5 : 2}
                  />
                  {/* Badge for Chats tab */}
                  {config.name === 'Chats' && <ChatBadge />}
                </View>
                
                <Text style={[styles.label, { color }]}>
                  {config.label}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
});

CompactTabBar.displayName = 'CompactTabBar';

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB',
  },
  tabBar: {
    flexDirection: 'row',
    height: TAB_HEIGHT,
    alignItems: 'center',
  },
  tab: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContent: {
    alignItems: 'center',
    gap: 2,
  },
  iconContainer: {
    position: 'relative',
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -10,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
});

export const GravityTabNavigator = memo(() => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CompactTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="GravityMap" component={GravityMapScreen} />
      <Tab.Screen name="Chats" component={ChatsScreen} />
      <Tab.Screen name="Profile" component={GravityProfileScreen} />
    </Tab.Navigator>
  );
});

GravityTabNavigator.displayName = 'GravityTabNavigator';
