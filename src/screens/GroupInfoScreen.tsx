/**
 * GroupInfoScreen - Group chat settings (WhatsApp-style card layout)
 * iOS Settings-style cards with grouped actions
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  Share,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Bell,
  BellOff,
  Link,
  UserPlus,
  Image as ImageIcon,
  Star,
  Flag,
  Trash2,
  LogOut,
  Check,
  Clock,
  Crown,
  Plus,
  User,
  MessageCircle,
  ShieldCheck,
  UserMinus,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from '@gluestack-ui/themed';
import { doc, onSnapshot } from 'firebase/firestore';

import { useAuth } from '@/contexts/AuthContext';
import { Avatar } from '@/components/ui/Avatar';
import { InfoCard, InfoCardItem, QuickActionButton, SectionHeader } from '@/components/chat/InfoCard';
import { useMessages } from '@/hooks/firestore/useMessages';
import { firestore } from '@/config/firebase';
import type { RootStackParamList } from '@/types/navigation';
import type { Chat, ChatParticipant } from '@/types/chat';

type GroupInfoRouteProp = RouteProp<RootStackParamList, 'GroupInfo'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const GroupInfoScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<GroupInfoRouteProp>();
  const { chatId } = route.params;
  const { userDocument } = useAuth();

  const [chat, setChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [muteDuration, setMuteDuration] = useState<'8h' | '1w' | 'always' | null>(null);
  const [muteSheetVisible, setMuteSheetVisible] = useState(false);
  const [memberActionUser, setMemberActionUser] = useState<ChatParticipant | null>(null);

  const { messages } = useMessages(chatId);

  // Fetch chat data
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(firestore, 'chats', chatId), (snapshot) => {
      if (snapshot.exists()) {
        setChat({ id: snapshot.id, ...snapshot.data() } as Chat);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [chatId]);

  const groupName = chat?.name || 'Group';
  const participants = useMemo(() => {
    if (!chat?.participantInfo) return [];
    return Object.values(chat.participantInfo);
  }, [chat]);

  const isAdmin = useMemo(() => {
    if (!chat?.participantIds || !userDocument) return false;
    return chat.participantIds[0] === userDocument.uid;
  }, [chat, userDocument]);

  const mediaCount = useMemo(() => {
    return messages.filter((msg) => msg.type === 'image' && msg.image).length;
  }, [messages]);

  // Handle go back
  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // Handle edit group (open EditGroupScreen)
  const handleEditGroup = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('EditGroup', {
      chatId,
      currentName: groupName,
      currentPhotoURL: chat?.photoURL || null,
    });
  }, [navigation, chatId, groupName, chat?.photoURL]);

  // Handle search in chat
  const handleSearchInChat = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await AsyncStorage.setItem('chat_search_pending', chatId);
    navigation.goBack();
  }, [navigation, chatId]);

  // Handle mute
  const handleMutePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isMuted) {
      setIsMuted(false);
      setMuteDuration(null);
    } else {
      setMuteSheetVisible(true);
    }
  }, [isMuted]);

  const handleMuteDuration = useCallback((duration: '8h' | '1w' | 'always') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMuteDuration(duration);
    setIsMuted(true);
    setMuteSheetVisible(false);
  }, []);

  const getMuteDisplayValue = useCallback(() => {
    if (!isMuted) return 'Off';
    switch (muteDuration) {
      case '8h': return '8 hours';
      case '1w': return '1 week';
      case 'always': return 'Always';
      default: return 'On';
    }
  }, [isMuted, muteDuration]);

  // Handle invite link
  const handleInviteLink = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const inviteLink = `https://picklebean.app/join/${chatId}`;
    try {
      await Share.share({ message: `Join my group on Picklebean: ${inviteLink}`, url: inviteLink });
    } catch (error) {
      Alert.alert('Error', 'Could not share invite link');
    }
  }, [chatId]);

  // Handle add member
  const handleAddMember = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Coming Soon', 'Add member feature will be available soon.');
  }, []);

  // Handle media tap
  const handleMediaTap = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('SharedMedia', { chatId, groupName });
  }, [navigation, chatId, groupName]);

  // Handle starred messages
  const handleStarredTap = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Coming Soon', 'Starred messages feature will be available soon.');
  }, []);

  // Handle member tap
  const handleMemberTap = useCallback((member: ChatParticipant) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMemberActionUser(member);
  }, []);

  // Handle view profile
  const handleViewProfile = useCallback(() => {
    const member = memberActionUser;
    setMemberActionUser(null);
    if (!member) return;
    setTimeout(() => {
      navigation.navigate('UserProfile', { username: member.username });
    }, 300);
  }, [memberActionUser, navigation]);

  // Handle send message
  const handleSendMessage = useCallback(() => {
    const member = memberActionUser;
    setMemberActionUser(null);
    if (!member) return;
    setTimeout(() => {
      navigation.navigate('ChatDetail', {
        recipientUser: {
          uid: member.userId,
          username: member.username,
          displayName: member.displayName,
          photoURL: member.photoURL,
        },
      });
    }, 300);
  }, [memberActionUser, navigation]);

  // Handle make admin
  const handleMakeAdmin = useCallback(() => {
    const member = memberActionUser;
    if (!member) return;
    
    Alert.alert(
      'Make Group Admin',
      `Are you sure you want to make ${member.displayName} an admin? They will be able to edit the group and manage members.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Make Admin',
          onPress: () => {
            setMemberActionUser(null);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            // TODO: Implement make admin functionality
          },
        },
      ]
    );
  }, [memberActionUser]);

  // Handle remove member
  const handleRemoveMember = useCallback(() => {
    const member = memberActionUser;
    if (!member) return;
    
    Alert.alert(
      'Remove from Group',
      `Are you sure you want to remove ${member.displayName} from this group?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setMemberActionUser(null);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            // TODO: Implement remove member functionality
          },
        },
      ]
    );
  }, [memberActionUser]);

  // Handle clear messages
  const handleClearMessages = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Clear Messages', 'Are you sure you want to clear all messages?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => {} },
    ]);
  }, []);

  // Handle exit group
  const handleExitGroup = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Exit Group', 'Are you sure you want to leave this group?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Exit', style: 'destructive', onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Tabs' }] }) },
    ]);
  }, [navigation]);

  // Handle report group
  const handleReportGroup = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Report Group', 'Report this group for inappropriate content?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Report', style: 'destructive', onPress: () => Alert.alert('Reported', 'Thank you for your report.') },
    ]);
  }, []);

  // Handle delete group (admin only)
  const handleDeleteGroup = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Delete Group', 'Are you sure you want to delete this group? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Tabs' }] }) },
    ]);
  }, [navigation]);

  if (loading) {
    return (
      <View className="items-center justify-center flex-1 bg-white">
        <ActivityIndicator size="large" color="#0EA5E9" />
      </View>
    );
  }

  if (!chat) {
    return (
      <View className="items-center justify-center flex-1 bg-white">
        <Text className="!text-gray-500">Group not found</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {/* Header with Edit button */}
      <View className="flex-row items-center px-4 py-3">
        <Pressable onPress={handleGoBack} className="p-1 mr-2 -ml-2" hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <ChevronLeft size={28} color="#374151" />
        </Pressable>
        <Text className="flex-1 text-lg font-semibold text-center !text-gray-900">Group Info</Text>
        {isAdmin && (
          <Pressable onPress={handleEditGroup} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text className="text-base font-medium !text-sky-500">Edit</Text>
          </Pressable>
        )}
        {!isAdmin && <View style={{ width: 28 }} />}
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Profile Header - simplified, no edit actions */}
        <View className="items-center px-4 pt-2 pb-6">
          <View className="items-center justify-center overflow-hidden bg-green-500 rounded-full w-28 h-28">
            {chat.photoURL ? (
              <Image
                source={{ uri: chat.photoURL }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <Text className="text-4xl font-bold !text-white">{groupName.charAt(0).toUpperCase()}</Text>
            )}
          </View>
          <Text className="mt-3 text-2xl font-bold !text-gray-900">{groupName}</Text>
          <Text className="mt-1 text-base !text-gray-500">Group · {participants.length} members</Text>
        </View>

        {/* Quick Actions - only Add and Search */}
        <View className="flex-row justify-center px-3 mb-6">
          <QuickActionButton icon={<UserPlus size={24} color="#374151" />} label="Add" onPress={handleAddMember} />
          <QuickActionButton icon={<Search size={24} color="#374151" />} label="Search" onPress={handleSearchInChat} />
        </View>

        {/* Media & Starred Card */}
        <InfoCard>
          <InfoCardItem icon={<ImageIcon size={22} color="#6B7280" />} label="Media, links, and docs" value={mediaCount > 0 ? String(mediaCount) : 'None'} onPress={handleMediaTap} />
          <InfoCardItem icon={<Star size={22} color="#6B7280" />} label="Starred messages" value="None" onPress={handleStarredTap} isLast />
        </InfoCard>

        {/* Notifications Card */}
        <InfoCard>
          <InfoCardItem icon={<Bell size={22} color="#6B7280" />} label="Mute notifications" value={getMuteDisplayValue()} onPress={handleMutePress} isLast />
        </InfoCard>

        {/* Members Section - consolidated with Add/Invite */}
        <SectionHeader title={`${participants.length} members`} />
        <InfoCard>
          {/* Add members and Invite link at top */}
          <InfoCardItem icon={<Plus size={22} color="#22C55E" />} label="Add members" onPress={handleAddMember} showChevron={false} />
          <InfoCardItem icon={<Link size={22} color="#22C55E" />} label="Invite via link" onPress={handleInviteLink} showChevron={false} />
          
          {/* Members list */}
          {participants.map((member, index) => {
            const isCurrentUser = member.userId === userDocument?.uid;
            const isMemberAdmin = chat.participantIds[0] === member.userId;
            return (
              <Pressable
                key={member.userId}
                onPress={() => !isCurrentUser && handleMemberTap(member)}
                className={`flex-row items-center px-4 py-3 bg-gray-100 active:bg-gray-200 ${index < participants.length - 1 ? 'border-b border-gray-200' : ''}`}
              >
                <Avatar uri={member.photoURL} name={member.displayName} size="sm" />
                <View className="flex-1 ml-3">
                  <View className="flex-row items-center">
                    <Text className="text-base font-medium !text-gray-900">{isCurrentUser ? 'You' : member.displayName}</Text>
                    {isMemberAdmin && (
                      <View className="flex-row items-center px-2 py-0.5 ml-2 bg-yellow-100 rounded-full">
                        <Crown size={12} color="#EAB308" />
                        <Text className="ml-1 text-xs !text-yellow-700">Admin</Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-sm !text-gray-500">@{member.username}</Text>
                </View>
                {!isCurrentUser && <ChevronRight size={20} color="#9CA3AF" />}
              </Pressable>
            );
          })}
        </InfoCard>

        {/* Actions Card - Clear chat is red */}
        <InfoCard>
          <InfoCardItem icon={<Trash2 size={22} color="#EF4444" />} label="Clear chat" onPress={handleClearMessages} destructive showChevron={false} />
          <InfoCardItem icon={<LogOut size={22} color="#EF4444" />} label="Exit group" onPress={handleExitGroup} destructive showChevron={false} />
          <InfoCardItem icon={<Flag size={22} color="#EF4444" />} label="Report group" onPress={handleReportGroup} destructive showChevron={false} isLast={!isAdmin} />
          {isAdmin && <InfoCardItem icon={<Trash2 size={22} color="#EF4444" />} label="Delete group" onPress={handleDeleteGroup} destructive showChevron={false} isLast />}
        </InfoCard>

        <View style={{ height: insets.bottom + 40 }} />
      </ScrollView>

      {/* Mute Duration Actionsheet */}
      <Actionsheet isOpen={muteSheetVisible} onClose={() => setMuteSheetVisible(false)}>
        <ActionsheetBackdrop />
        <ActionsheetContent className="px-0 pb-8">
          <ActionsheetDragIndicatorWrapper><ActionsheetDragIndicator /></ActionsheetDragIndicatorWrapper>
          <View className="w-full px-6 pt-2 pb-4"><Text className="text-lg font-semibold text-center !text-gray-900">Mute Notifications</Text></View>
          <View className="w-full px-4">
            <Pressable onPress={() => handleMuteDuration('8h')} className="flex-row items-center px-4 py-4 rounded-xl active:bg-gray-100">
              <View className="items-center justify-center w-10 h-10 mr-4 bg-gray-100 rounded-full"><Clock size={20} color="#6B7280" /></View>
              <Text className="flex-1 text-base font-medium !text-gray-900">8 hours</Text>
              {muteDuration === '8h' && <Check size={20} color="#0EA5E9" />}
            </Pressable>
            <Pressable onPress={() => handleMuteDuration('1w')} className="flex-row items-center px-4 py-4 rounded-xl active:bg-gray-100">
              <View className="items-center justify-center w-10 h-10 mr-4 bg-gray-100 rounded-full"><Clock size={20} color="#6B7280" /></View>
              <Text className="flex-1 text-base font-medium !text-gray-900">1 week</Text>
              {muteDuration === '1w' && <Check size={20} color="#0EA5E9" />}
            </Pressable>
            <Pressable onPress={() => handleMuteDuration('always')} className="flex-row items-center px-4 py-4 rounded-xl active:bg-gray-100">
              <View className="items-center justify-center w-10 h-10 mr-4 bg-gray-100 rounded-full"><BellOff size={20} color="#6B7280" /></View>
              <Text className="flex-1 text-base font-medium !text-gray-900">Always</Text>
              {muteDuration === 'always' && <Check size={20} color="#0EA5E9" />}
            </Pressable>
          </View>
          <View className="w-full px-4 pt-4">
            <Pressable onPress={() => setMuteSheetVisible(false)} className="items-center py-4 bg-gray-100 rounded-xl active:bg-gray-200">
              <Text className="text-base font-semibold !text-gray-700">Cancel</Text>
            </Pressable>
          </View>
        </ActionsheetContent>
      </Actionsheet>

      {/* Member Action Sheet */}
      <Actionsheet isOpen={memberActionUser !== null} onClose={() => setMemberActionUser(null)}>
        <ActionsheetBackdrop />
        <ActionsheetContent className="px-0 pb-16">
          <ActionsheetDragIndicatorWrapper><ActionsheetDragIndicator /></ActionsheetDragIndicatorWrapper>
          
          {memberActionUser && (
            <>
              {/* Member Info Header */}
              <View className="items-center w-full pt-4 pb-6">
                <Avatar uri={memberActionUser.photoURL} name={memberActionUser.displayName} size="xl" />
                <Text className="mt-3 text-xl font-bold !text-gray-900">{memberActionUser.displayName}</Text>
                <Text className="mt-1 text-base !text-gray-500">@{memberActionUser.username}</Text>
              </View>

              {/* Quick Action Buttons */}
              <View className="flex-row justify-center w-full gap-4 px-4 pb-6">
                <Pressable
                  onPress={handleViewProfile}
                  className="items-center flex-1 py-4 bg-gray-100 rounded-xl active:bg-gray-200"
                >
                  <User size={24} color="#374151" />
                  <Text className="mt-2 text-sm font-medium !text-gray-700">Profile</Text>
                </Pressable>
                <Pressable
                  onPress={handleSendMessage}
                  className="items-center flex-1 py-4 bg-gray-100 rounded-xl active:bg-gray-200"
                >
                  <MessageCircle size={24} color="#374151" />
                  <Text className="mt-2 text-sm font-medium !text-gray-700">Message</Text>
                </Pressable>
              </View>

              {/* Admin Actions (only if admin and not self) */}
              {isAdmin && memberActionUser.userId !== userDocument?.uid && (
                <View className="w-full px-4 mb-4">
                  <View className="overflow-hidden bg-gray-100 rounded-xl">
                    <Pressable
                      onPress={handleMakeAdmin}
                      className="flex-row items-center px-4 py-4 border-gray-200 active:bg-gray-200"
                    >
                      <ShieldCheck size={22} color="#6B7280" />
                      <Text className="flex-1 ml-3 text-base font-medium !text-gray-900">Make group admin</Text>
                      <ChevronRight size={20} color="#9CA3AF" />
                    </Pressable>
                  </View>
                </View>
              )}

              {isAdmin && memberActionUser.userId !== userDocument?.uid && (
                <View className="w-full px-4">
                  <View className="overflow-hidden bg-gray-100 rounded-xl">
                    <Pressable
                      onPress={handleRemoveMember}
                      className="flex-row items-center px-4 py-4 active:bg-red-50"
                    >
                      <UserMinus size={22} color="#EF4444" />
                      <Text className="flex-1 ml-3 text-base font-medium !text-red-500">Remove from group</Text>
                      <ChevronRight size={20} color="#9CA3AF" />
                    </Pressable>
                  </View>
                </View>
              )}
            </>
          )}
        </ActionsheetContent>
      </Actionsheet>
    </View>
  );
};
