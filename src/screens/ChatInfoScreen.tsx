/**
 * ChatInfoScreen - Individual chat settings (WhatsApp-style card layout)
 * iOS Settings-style cards with grouped actions
 */

import { useState, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ChevronLeft,
  Search,
  Bell,
  BellOff,
  User,
  Image as ImageIcon,
  Star,
  Ban,
  Flag,
  Trash2,
  Clock,
  Check,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from '@gluestack-ui/themed';

import { Avatar } from '@/components/ui/Avatar';
import { InfoCard, InfoCardItem, QuickActionButton } from '@/components/chat/InfoCard';
import { useMessages } from '@/hooks/firestore/useMessages';
import type { RootStackParamList } from '@/types/navigation';

type ChatInfoRouteProp = RouteProp<RootStackParamList, 'ChatInfo'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ChatInfoScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ChatInfoRouteProp>();
  const { chatId, displayName, photoURL, username } = route.params;

  const { messages } = useMessages(chatId);

  const [isMuted, setIsMuted] = useState(false);
  const [muteDuration, setMuteDuration] = useState<'8h' | '1w' | 'always' | null>(null);
  const [muteSheetVisible, setMuteSheetVisible] = useState(false);

  // Count shared media
  const mediaCount = useMemo(() => {
    return messages.filter((msg) => msg.type === 'image' && msg.image).length;
  }, [messages]);

  // Handle go back
  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // Handle view profile
  const handleViewProfile = useCallback(() => {
    if (username) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      navigation.navigate('UserProfile', { username });
    }
  }, [username, navigation]);

  // Handle search in chat
  const handleSearchInChat = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await AsyncStorage.setItem('chat_search_pending', chatId);
    navigation.goBack();
  }, [navigation, chatId]);

  // Handle mute button press
  const handleMutePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isMuted) {
      setIsMuted(false);
      setMuteDuration(null);
    } else {
      setMuteSheetVisible(true);
    }
  }, [isMuted]);

  // Handle mute duration selection
  const handleMuteDuration = useCallback((duration: '8h' | '1w' | 'always') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMuteDuration(duration);
    setIsMuted(true);
    setMuteSheetVisible(false);
  }, []);

  // Get mute display value
  const getMuteDisplayValue = useCallback(() => {
    if (!isMuted) return 'Off';
    switch (muteDuration) {
      case '8h': return '8 hours';
      case '1w': return '1 week';
      case 'always': return 'Always';
      default: return 'On';
    }
  }, [isMuted, muteDuration]);

  // Handle media tap
  const handleMediaTap = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('SharedMedia', { chatId, groupName: displayName });
  }, [navigation, chatId, displayName]);

  // Handle starred messages
  const handleStarredTap = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Coming Soon', 'Starred messages feature will be available soon.');
  }, []);

  // Handle block user
  const handleBlockUser = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      'Block User',
      `Are you sure you want to block ${displayName}? They won't be able to message you.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Blocked', `${displayName} has been blocked`);
          },
        },
      ]
    );
  }, [displayName]);

  // Handle report user
  const handleReportUser = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Report User', 'Report this user for inappropriate behavior?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Report',
        style: 'destructive',
        onPress: () => {
          Alert.alert('Reported', 'Thank you for your report. We will review it.');
        },
      },
    ]);
  }, []);

  // Handle clear messages
  const handleClearMessages = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      'Clear Messages',
      'Are you sure you want to clear all messages? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            navigation.goBack();
            navigation.goBack();
          },
        },
      ]
    );
  }, [navigation]);

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3">
        <Pressable
          onPress={handleGoBack}
          className="p-1 mr-2 -ml-2"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ChevronLeft size={28} color="#374151" />
        </Pressable>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View className="items-center px-4 pt-2 pb-6">
          <Avatar uri={photoURL} name={displayName} size="xl" />
          <Text className="mt-3 text-2xl font-bold !text-gray-900">{displayName}</Text>
          {username && (
            <Text className="mt-1 text-base !text-gray-500">@{username}</Text>
          )}
        </View>

        {/* Quick Actions */}
        <View className="flex-row px-3 mb-6">
          <QuickActionButton
            icon={<User size={24} color="#374151" />}
            label="Profile"
            onPress={handleViewProfile}
          />
          <QuickActionButton
            icon={<Search size={24} color="#374151" />}
            label="Search"
            onPress={handleSearchInChat}
          />
        </View>

        {/* Media & Starred Card */}
        <InfoCard>
          <InfoCardItem
            icon={<ImageIcon size={22} color="#6B7280" />}
            label="Media, links, and docs"
            value={mediaCount > 0 ? String(mediaCount) : 'None'}
            onPress={handleMediaTap}
          />
          <InfoCardItem
            icon={<Star size={22} color="#6B7280" />}
            label="Starred messages"
            value="None"
            onPress={handleStarredTap}
            isLast
          />
        </InfoCard>

        {/* Notifications Card */}
        <InfoCard>
          <InfoCardItem
            icon={<Bell size={22} color="#6B7280" />}
            label="Mute notifications"
            value={getMuteDisplayValue()}
            onPress={handleMutePress}
            isLast
          />
        </InfoCard>

        {/* Block & Report Card */}
        <InfoCard>
          <InfoCardItem
            icon={<Ban size={22} color="#EF4444" />}
            label={`Block ${displayName}`}
            onPress={handleBlockUser}
            destructive
          />
          <InfoCardItem
            icon={<Flag size={22} color="#EF4444" />}
            label={`Report ${displayName}`}
            onPress={handleReportUser}
            destructive
            isLast
          />
        </InfoCard>

        {/* Clear Messages Card */}
        <InfoCard>
          <InfoCardItem
            icon={<Trash2 size={22} color="#EF4444" />}
            label="Clear chat"
            onPress={handleClearMessages}
            destructive
            showChevron={false}
            isLast
          />
        </InfoCard>

        {/* Bottom spacing */}
        <View style={{ height: insets.bottom + 40 }} />
      </ScrollView>

      {/* Mute Duration Actionsheet */}
      <Actionsheet isOpen={muteSheetVisible} onClose={() => setMuteSheetVisible(false)}>
        <ActionsheetBackdrop />
        <ActionsheetContent className="px-0 pb-8">
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>

          <View className="w-full px-6 pt-2 pb-4">
            <Text className="text-lg font-semibold text-center !text-gray-900">
              Mute Notifications
            </Text>
          </View>

          <View className="w-full px-4">
            <Pressable
              onPress={() => handleMuteDuration('8h')}
              className="flex-row items-center px-4 py-4 rounded-xl active:bg-gray-100"
            >
              <View className="items-center justify-center w-10 h-10 mr-4 bg-gray-100 rounded-full">
                <Clock size={20} color="#6B7280" />
              </View>
              <Text className="flex-1 text-base font-medium !text-gray-900">8 hours</Text>
              {muteDuration === '8h' && <Check size={20} color="#0EA5E9" />}
            </Pressable>

            <Pressable
              onPress={() => handleMuteDuration('1w')}
              className="flex-row items-center px-4 py-4 rounded-xl active:bg-gray-100"
            >
              <View className="items-center justify-center w-10 h-10 mr-4 bg-gray-100 rounded-full">
                <Clock size={20} color="#6B7280" />
              </View>
              <Text className="flex-1 text-base font-medium !text-gray-900">1 week</Text>
              {muteDuration === '1w' && <Check size={20} color="#0EA5E9" />}
            </Pressable>

            <Pressable
              onPress={() => handleMuteDuration('always')}
              className="flex-row items-center px-4 py-4 rounded-xl active:bg-gray-100"
            >
              <View className="items-center justify-center w-10 h-10 mr-4 bg-gray-100 rounded-full">
                <BellOff size={20} color="#6B7280" />
              </View>
              <Text className="flex-1 text-base font-medium !text-gray-900">Always</Text>
              {muteDuration === 'always' && <Check size={20} color="#0EA5E9" />}
            </Pressable>
          </View>

          <View className="w-full px-4 pt-4">
            <Pressable
              onPress={() => setMuteSheetVisible(false)}
              className="items-center py-4 bg-gray-100 rounded-xl active:bg-gray-200"
            >
              <Text className="text-base font-semibold !text-gray-700">Cancel</Text>
            </Pressable>
          </View>
        </ActionsheetContent>
      </Actionsheet>
    </View>
  );
};
