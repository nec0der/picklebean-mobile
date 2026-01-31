import { memo } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Platform, StyleSheet } from 'react-native';
import { Home, Trophy, MapPin, User } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { PickleballIcon } from '@/components/ui/PickleballIcon';
import { isGravity } from '@/config/product';
import type { TabParamList } from '@/types/navigation';

// Import screens
import { DashboardScreen } from '@/screens/DashboardScreen';
import { LeaderboardScreen } from '@/screens/LeaderboardScreen';
import { PlayNowResultScreen } from '@/screens/PlayNowResultScreen';
import { PlayScreen } from '@/screens/PlayScreen';
import { MapScreen } from '@/screens/MapScreen';
import { ProfileScreen } from '@/screens/ProfileScreen';

// Product-specific navigators
import { GravityTabNavigator } from './tabs/GravityTabNavigator';

const Tab = createBottomTabNavigator<TabParamList>();

const styles = StyleSheet.create({
  playButton: {
    position: 'absolute',
    top: -20,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

// ELO Tab Navigator (original product)
const EloTabNavigator = memo(() => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          height: Platform.OS === 'ios' ? 88 : 70,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: true,
        headerStyle: {
          backgroundColor: '#FFFFFF',
          elevation: 0,
          shadowOpacity: 0,
          // borderBottomWidth: 1,
          borderBottomColor: '#E5E7EB',
        },
        headerTitleStyle: {
          fontSize: 20,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Home',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
        listeners={{
          tabPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          },
        }}
      />
      
      <Tab.Screen
        name="Leaderboard"
        component={LeaderboardScreen}
        options={{
          tabBarLabel: 'Leaderboard',
          tabBarIcon: ({ color, size }) => <Trophy color={color} size={size} />,
        }}
        listeners={{
          tabPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          },
        }}
      />
      
      <Tab.Screen
        name="Play"
        component={PlayScreen}
        options={{
          headerShown: true,
          tabBarLabel: '',
          tabBarIcon: () => (
            <View style={styles.playButton}>
              <PickleballIcon size={36} color="#FFFFFF" />
            </View>
          ),
        }}
        listeners={{
          tabPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          },
        }}
      />
      
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          tabBarLabel: 'Map',
          tabBarIcon: ({ color, size }) => <MapPin color={color} size={size} />,
          headerShown: false,
        }}
        listeners={{
          tabPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          },
        }}
      />
      
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
        listeners={{
          tabPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          },
        }}
      />
    </Tab.Navigator>
  );
});

EloTabNavigator.displayName = 'EloTabNavigator';

// Main TabNavigator - renders based on product flag
export const TabNavigator = memo(() => {
  if (isGravity) {
    return <GravityTabNavigator />;
  }
  
  return <EloTabNavigator />;
});

TabNavigator.displayName = 'TabNavigator';
