/**
 * ChatDetailScreen - Individual conversation view
 * Supports both existing chats (chatId) and draft mode (recipientUser)
 * Supports text, image, and location messages
 */

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Keyboard,
  Animated,
  Dimensions,
  Linking,
  Image as RNImage,
  Modal,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useNavigation,
  useRoute,
  RouteProp,
  useFocusEffect,
} from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  Send,
  Plus,
  X,
  Search,
} from "lucide-react-native";
import { Input, InputField, InputSlot } from "@gluestack-ui/themed";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Haptics from "expo-haptics";

import { useMessages } from "@/hooks/firestore/useMessages";
import {
  getChat,
  getOrCreateIndividualChat,
  sendMessage as sendChatMessage,
} from "@/services/chatService";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Avatar } from "@/components/ui/Avatar";
import { AttachmentPickerSheet } from "@/components/chat/AttachmentPickerSheet";
import { ImagePreviewSheet } from "@/components/chat/ImagePreviewSheet";
import { MessageContextMenu } from "@/components/chat/MessageContextMenu";
import { SwipeableMessage } from "@/components/chat/SwipeableMessage";
import { uploadChatImage } from "@/lib/storage";
import type { RootStackParamList } from "@/types/navigation";
import type {
  Chat,
  Message,
  ChatParticipant,
  ImageAttachment,
  LocationAttachment,
  ReplyTo,
} from "@/types/chat";

type ChatDetailRouteProp = RouteProp<RootStackParamList, "ChatDetail">;

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const IMAGE_MAX_WIDTH = SCREEN_WIDTH * 0.65;
const IMAGE_MAX_HEIGHT = 250;
const MAP_PREVIEW_HEIGHT = 120;

export const ChatDetailScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ChatDetailRouteProp>();
  const {
    chatId: initialChatId,
    recipientUser,
    searchMode: initialSearchMode,
  } = route.params;
  const { userDocument } = useAuth();
  const flatListRef = useRef<FlatList>(null);
  const searchInputRef = useRef<any>(null);

  // Draft mode = have recipientUser but no chatId
  const isDraftMode = !initialChatId && !!recipientUser;

  const [chatId, setChatId] = useState<string | null>(initialChatId || null);

  // Search mode state
  const [isSearchMode, setIsSearchMode] = useState(initialSearchMode || false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [chat, setChat] = useState<Chat | null>(null);
  const [chatLoading, setChatLoading] = useState(!isDraftMode);
  const [inputText, setInputText] = useState("");
  const [localSending, setLocalSending] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [attachmentSheetOpen, setAttachmentSheetOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState<{
    uri: string;
    width: number;
    height: number;
  } | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<{
    url: string;
    width: number;
    height: number;
    caption?: string;
  } | null>(null);
  const [fullscreenImageLoading, setFullscreenImageLoading] = useState(true);
  const [pendingUploadImage, setPendingUploadImage] = useState<{
    uri: string;
    width: number;
    height: number;
    caption?: string;
  } | null>(null);

  // Context menu state
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [messagePosition, setMessagePosition] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  // Reply-to state
  const [replyTo, setReplyTo] = useState<Message | null>(null);

  // Animation for send button
  const sendButtonAnim = useRef(new Animated.Value(0)).current;
  const hasText = inputText.trim().length > 0;

  // Animate send button visibility
  useEffect(() => {
    Animated.spring(sendButtonAnim, {
      toValue: hasText ? 1 : 0,
      useNativeDriver: true,
      friction: 8,
      tension: 100,
    }).start();
  }, [hasText, sendButtonAnim]);

  // Track keyboard visibility
  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardWillShow", () =>
      setKeyboardVisible(true),
    );
    const hideSub = Keyboard.addListener("keyboardWillHide", () =>
      setKeyboardVisible(false),
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Only use messages hook if we have a chatId
  const { messages, loading, sendMessage, sending } = useMessages(chatId || "");

  const userId = userDocument?.uid;

  // Load chat details (only for existing chats)
  useEffect(() => {
    if (!chatId) {
      setChatLoading(false);
      return;
    }

    const loadChat = async () => {
      try {
        const chatData = await getChat(chatId);
        setChat(chatData);
      } catch (error) {
        console.error("Error loading chat:", error);
      } finally {
        setChatLoading(false);
      }
    };

    loadChat();
  }, [chatId]);

  // Get display info for the chat
  const getDisplayInfo = useCallback(() => {
    // Use recipientUser prop immediately if passed (avoids loading flash)
    if (recipientUser) {
      return {
        name: recipientUser.displayName,
        photoURL: recipientUser.photoURL,
        username: recipientUser.username,
      };
    }

    if (!chat || !userId)
      return { name: "Chat", photoURL: null, username: null };

    if (chat.type === "group") {
      return {
        name: chat.name || "Group Chat",
        photoURL: chat.photoURL || null,
        username: null,
        memberCount: chat.participantIds?.length || 0,
      };
    }

    const otherUserId = chat.participantIds.find((id) => id !== userId);
    const otherUser = otherUserId ? chat.participantInfo[otherUserId] : null;

    return {
      name: otherUser?.displayName || otherUser?.username || "Unknown User",
      photoURL: otherUser?.photoURL || null,
      username: otherUser?.username || null,
    };
  }, [chat, userId, isDraftMode, recipientUser]);

  const displayInfo = getDisplayInfo();

  // Ensure chat exists for attachments (create if in draft mode)
  const ensureChatExists = useCallback(async (): Promise<string | null> => {
    if (chatId) return chatId;

    if (!isDraftMode || !recipientUser || !userDocument) return null;

    // Build participant info
    const currentUserParticipant: ChatParticipant = {
      userId: userDocument.uid,
      username: userDocument.username || "",
      displayName:
        userDocument.displayName || userDocument.username || "Unknown",
      photoURL: userDocument.photoURL || null,
    };

    const otherUserParticipant: ChatParticipant = {
      userId: recipientUser.uid,
      username: recipientUser.username,
      displayName: recipientUser.displayName,
      photoURL: recipientUser.photoURL,
    };

    // Create or get the chat
    const newChatId = await getOrCreateIndividualChat(
      currentUserParticipant,
      otherUserParticipant,
    );
    setChatId(newChatId);
    return newChatId;
  }, [chatId, isDraftMode, recipientUser, userDocument]);

  // Handle image captured from picker (shows preview)
  const handleImageCaptured = useCallback(
    (image: { uri: string; width: number; height: number }) => {
      setPreviewImage(image);
    },
    [],
  );

  // Handle image confirmed from preview (uploads and sends)
  const handleImageConfirmed = useCallback(
    async (image: ImageAttachment & { localUri: string; caption?: string }) => {
      setPreviewImage(null); // Close preview
      if (!userDocument) return;

      try {
        setUploadingImage(true);
        // Store pending upload for optimistic UI
        setPendingUploadImage({
          uri: image.localUri,
          width: image.width,
          height: image.height,
          caption: image.caption,
        });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        // Ensure chat exists
        const targetChatId = await ensureChatExists();
        if (!targetChatId) {
          Alert.alert("Error", "Could not create chat");
          return;
        }

        // Upload image
        const imageUrl = await uploadChatImage(
          targetChatId,
          userDocument.uid,
          image.localUri,
        );

        // Send image message with caption as text
        await sendChatMessage({
          chatId: targetChatId,
          senderId: userDocument.uid,
          senderName:
            userDocument.displayName || userDocument.username || "Unknown",
          text: image.caption || "📷 Photo",
          type: "image",
          image: {
            url: imageUrl,
            width: image.width,
            height: image.height,
          },
        });

        // Scroll to bottom (inverted list: offset 0 = bottom)
        setTimeout(() => {
          flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
        }, 100);
      } catch (error) {
        console.error("Error sending image:", error);
        Alert.alert("Error", "Failed to send image");
      } finally {
        setUploadingImage(false);
        setPendingUploadImage(null);
      }
    },
    [userDocument, ensureChatExists],
  );

  // Handle preview cancel
  const handlePreviewCancel = useCallback(() => {
    setPreviewImage(null);
  }, []);

  // Handle location selected from picker
  const handleLocationSelected = useCallback(
    async (location: LocationAttachment) => {
      if (!userDocument) return;

      try {
        setLocalSending(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        // Ensure chat exists
        const targetChatId = await ensureChatExists();
        if (!targetChatId) {
          Alert.alert("Error", "Could not create chat");
          return;
        }

        // Send location message
        await sendChatMessage({
          chatId: targetChatId,
          senderId: userDocument.uid,
          senderName:
            userDocument.displayName || userDocument.username || "Unknown",
          text: location.address || "📍 Location",
          type: "location",
          location,
        });

        // Scroll to bottom (inverted list: offset 0 = bottom)
        setTimeout(() => {
          flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
        }, 100);
      } catch (error) {
        console.error("Error sending location:", error);
        Alert.alert("Error", "Failed to send location");
      } finally {
        setLocalSending(false);
      }
    },
    [userDocument, ensureChatExists],
  );

  // Handle send message
  const handleSend = useCallback(async () => {
    if (!inputText.trim() || sending || localSending || !userDocument) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const text = inputText.trim();
    const currentReplyTo = replyTo; // Capture current reply state
    setInputText("");
    setReplyTo(null); // Clear reply after sending

    // Build replyTo data if replying
    const replyToData: ReplyTo | undefined = currentReplyTo
      ? {
          messageId: currentReplyTo.id,
          text:
            currentReplyTo.type === "image"
              ? "📷 Photo"
              : currentReplyTo.type === "location"
                ? "📍 Location"
                : currentReplyTo.text,
          senderName: currentReplyTo.senderName,
          senderId: currentReplyTo.senderId,
          type: currentReplyTo.type,
        }
      : undefined;

    try {
      // Draft mode - first message creates the chat
      if (isDraftMode && !chatId && recipientUser) {
        setLocalSending(true);

        // Build participant info
        const currentUserParticipant: ChatParticipant = {
          userId: userDocument.uid,
          username: userDocument.username || "",
          displayName:
            userDocument.displayName || userDocument.username || "Unknown",
          photoURL: userDocument.photoURL || null,
        };

        const otherUserParticipant: ChatParticipant = {
          userId: recipientUser.uid,
          username: recipientUser.username,
          displayName: recipientUser.displayName,
          photoURL: recipientUser.photoURL,
        };

        // Create or get the chat
        const newChatId = await getOrCreateIndividualChat(
          currentUserParticipant,
          otherUserParticipant,
        );
        setChatId(newChatId);

        // Send the message to the new chat
        await sendChatMessage({
          chatId: newChatId,
          senderId: userDocument.uid,
          senderName:
            userDocument.displayName || userDocument.username || "Unknown",
          text,
          type: "text",
          replyTo: replyToData,
        });

        setLocalSending(false);

        // Scroll to bottom after sending (inverted list: offset 0 = bottom)
        setTimeout(() => {
          flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
        }, 100);

        return;
      }

      // Normal mode - send to existing chat with optional replyTo
      await sendMessage(text, replyToData);

      // Scroll to bottom after sending (inverted list: offset 0 = bottom)
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      }, 100);
    } catch (error) {
      console.error("Error sending message:", error);
      // Restore input on error
      setInputText(text);
      setReplyTo(currentReplyTo); // Restore reply on error
      setLocalSending(false);
      Alert.alert("Error", "Failed to send message");
    }
  }, [
    inputText,
    sending,
    localSending,
    userDocument,
    isDraftMode,
    chatId,
    recipientUser,
    sendMessage,
    replyTo,
  ]);

  // Handle go back
  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // Handle tapping on header to view chat info or profile
  const handleUserPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // For existing chats, navigate to info screen (Group or Individual)
    if (chatId) {
      // Navigate to GroupInfoScreen for group chats
      if (chat?.type === 'group') {
        navigation.navigate("GroupInfo", { chatId });
      } else {
        // Navigate to ChatInfoScreen for individual chats
        navigation.navigate("ChatInfo", {
          chatId,
          displayName: displayInfo.name,
          photoURL: displayInfo.photoURL,
          username: displayInfo.username || undefined,
        });
      }
      return;
    }

    // For draft mode (no chat yet), navigate to user profile
    if (displayInfo.username) {
      navigation.navigate("UserProfile", { username: displayInfo.username });
    }
  }, [chatId, displayInfo, navigation]);

  // Handle opening attachment picker
  const handleOpenAttachmentPicker = useCallback(() => {
    Keyboard.dismiss();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAttachmentSheetOpen(true);
  }, []);

  // Handle tapping on location message to open in Maps
  const handleLocationPress = useCallback((location: LocationAttachment) => {
    const url = Platform.select({
      ios: `maps:0,0?q=${location.latitude},${location.longitude}`,
      android: `geo:${location.latitude},${location.longitude}?q=${location.latitude},${location.longitude}`,
    });
    if (url) {
      Linking.openURL(url).catch(() => {
        // Fallback to Google Maps web
        Linking.openURL(
          `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`,
        );
      });
    }
  }, []);

  // ===== SEARCH MODE LOGIC =====
  // Check for pending search flag on focus (from ChatInfoScreen)
  useFocusEffect(
    useCallback(() => {
      const checkPendingSearch = async () => {
        const pendingChatId = await AsyncStorage.getItem("chat_search_pending");
        if (pendingChatId === chatId) {
          setIsSearchMode(true);
          await AsyncStorage.removeItem("chat_search_pending");
        }
      };
      checkPendingSearch();
    }, [chatId]),
  );

  // Dedupe messages by id (prevent double-counting bug)
  const uniqueMessages = useMemo(() => {
    if (isDraftMode && !chatId) return [];
    const seen = new Set<string>();
    const filtered = messages.filter((msg) => {
      if (seen.has(msg.id)) return false;
      seen.add(msg.id);
      return true;
    });
    // DEBUG: Log message counts to investigate double-counting
    console.log(
      "[Search Debug] Messages:",
      messages.length,
      "Unique:",
      filtered.length,
    );
    console.log(
      "[Search Debug] Message IDs:",
      messages.map((m) => m.id).join(", "),
    );
    return filtered;
  }, [messages, isDraftMode, chatId]);

  // Reversed messages for display (inverted FlatList)
  const reversedMessages = useMemo(() => {
    return [...uniqueMessages].reverse();
  }, [uniqueMessages]);

  // Find matching message indices in reversed array (for inverted FlatList)
  const matchIndices = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    console.log("reversedMessages: ", reversedMessages);
    return reversedMessages
      .map((msg, idx) => (msg.text?.toLowerCase().includes(query) ? idx : -1))
      .filter((idx) => idx !== -1);
  }, [reversedMessages, searchQuery]);

  // Auto-focus search input when entering search mode
  useEffect(() => {
    if (isSearchMode) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isSearchMode]);

  // Scroll to current match when it changes (or when first match is found)
  useEffect(() => {
    if (matchIndices.length > 0 && isSearchMode) {
      const targetIndex = matchIndices[currentMatchIndex];
      console.log(
        "[Search Debug] Scrolling to index:",
        targetIndex,
        "Match:",
        currentMatchIndex + 1,
        "of",
        matchIndices.length,
      );
      setTimeout(() => {
        try {
          flatListRef.current?.scrollToIndex({
            index: targetIndex,
            animated: true,
            viewPosition: 0.5,
          });
        } catch (error) {
          console.log("[Search Debug] scrollToIndex error, using fallback");
        }
      }, 150);
    }
  }, [currentMatchIndex, matchIndices, isSearchMode]);

  // Handle scrollToIndex failure (can happen with variable height items)
  const handleScrollToIndexFailed = useCallback(
    (info: {
      index: number;
      highestMeasuredFrameIndex: number;
      averageItemLength: number;
    }) => {
      console.log("[Search Debug] scrollToIndex failed:", info);
      // Wait and retry - this gives more time for items to be measured
      setTimeout(() => {
        if (flatListRef.current) {
          flatListRef.current.scrollToIndex({
            index: info.index,
            animated: true,
            viewPosition: 0.5,
          });
        }
      }, 200);
    },
    [],
  );

  // Reset match index when search query changes
  useEffect(() => {
    setCurrentMatchIndex(0);
  }, [searchQuery]);

  // Handle exit search mode
  const handleExitSearch = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsSearchMode(false);
    setSearchQuery("");
    setCurrentMatchIndex(0);
    Keyboard.dismiss();
  }, []);

  // Handle previous match
  const handlePrevMatch = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentMatchIndex((prev) =>
      prev > 0 ? prev - 1 : matchIndices.length - 1,
    );
  }, [matchIndices.length]);

  // Handle next match
  const handleNextMatch = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentMatchIndex((prev) =>
      prev < matchIndices.length - 1 ? prev + 1 : 0,
    );
  }, [matchIndices.length]);

  // ===== CONTEXT MENU HANDLERS =====
  // Handle long press on message to show context menu
  const handleMessageLongPress = useCallback((message: Message, event: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Get the position from the event target
    event.target.measure(
      (
        x: number,
        y: number,
        width: number,
        height: number,
        pageX: number,
        pageY: number,
      ) => {
        setMessagePosition({ x: pageX, y: pageY, width, height });
        setSelectedMessage(message);
        setContextMenuVisible(true);
      },
    );
  }, []);

  // Handle reply from context menu
  const handleContextMenuReply = useCallback((message: Message) => {
    setReplyTo(message);
    // Focus the input (optional - could use ref)
  }, []);

  // Handle copy from context menu
  const handleContextMenuCopy = useCallback((text: string) => {
    // Toast notification would be nice here
    Alert.alert("Copied", "Message copied to clipboard");
  }, []);

  // Handle forward from context menu (placeholder)
  const handleContextMenuForward = useCallback((message: Message) => {
    Alert.alert("Forward", "Forward functionality coming soon!");
  }, []);

  // Handle star from context menu (placeholder)
  const handleContextMenuStar = useCallback((message: Message) => {
    Alert.alert("Star", "Star functionality coming soon!");
  }, []);

  // Handle close context menu
  const handleCloseContextMenu = useCallback(() => {
    setContextMenuVisible(false);
    setSelectedMessage(null);
    setMessagePosition(null);
  }, []);

  // Handle cancel reply
  const handleCancelReply = useCallback(() => {
    setReplyTo(null);
  }, []);

  // Get the message ID of the current highlighted match
  const highlightedMessageId = useMemo(() => {
    if (matchIndices.length === 0 || !isSearchMode) return null;
    const targetIndex = matchIndices[currentMatchIndex];
    return reversedMessages[targetIndex]?.id || null;
  }, [matchIndices, currentMatchIndex, reversedMessages, isSearchMode]);

  // Format message timestamp
  const formatMessageTime = (timestamp: { seconds: number } | null): string => {
    if (!timestamp) return "";
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Calculate image dimensions to fit within max bounds
  const getImageDimensions = (width: number, height: number) => {
    const aspectRatio = width / height;
    let displayWidth = IMAGE_MAX_WIDTH;
    let displayHeight = displayWidth / aspectRatio;

    if (displayHeight > IMAGE_MAX_HEIGHT) {
      displayHeight = IMAGE_MAX_HEIGHT;
      displayWidth = displayHeight * aspectRatio;
    }

    return { width: displayWidth, height: displayHeight };
  };

  // Render message bubble
  const renderMessage = useCallback(
    ({ item, index }: { item: Message; index: number }) => {
      const isOwnMessage = item.senderId === userId;
      const previousMessage = index > 0 ? messages[index - 1] : null;
      const showSender =
        chat?.type === "group" &&
        !isOwnMessage &&
        previousMessage?.senderId !== item.senderId;

      const messageType = item.type || "text";

      // Image message
      if (messageType === "image" && item.image) {
        const { width, height } = getImageDimensions(
          item.image.width,
          item.image.height,
        );
        // Caption is stored in text field (not the default "📷 Photo")
        const hasCaption = item.text && item.text !== "📷 Photo";
        const bubbleWidth = IMAGE_MAX_WIDTH;
        const imagePadding = 2; // Padding around image inside bubble
        const imageWidth = bubbleWidth - imagePadding * 2;
        const imageHeight = (imageWidth / item.image.width) * item.image.height;
        const clampedImageHeight = Math.min(imageHeight, IMAGE_MAX_HEIGHT);
        // Check if this image message is highlighted during search
        const isHighlighted = item.id === highlightedMessageId;

        return (
          <SwipeableMessage
            message={item}
            isOwnMessage={isOwnMessage}
            onReply={handleContextMenuReply}
          >
            <View
              className={`px-4 py-1 ${isOwnMessage ? "items-end" : "items-start"}`}
            >
              {showSender && (
                <Text className="mb-1 ml-3 text-xs text-gray-500">
                  {item.senderName}
                </Text>
              )}
              {/* Bubble container */}
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setFullscreenImage({
                    url: item.image!.url,
                    width: item.image!.width,
                    height: item.image!.height,
                    caption: hasCaption ? item.text : undefined,
                  });
                }}
                onLongPress={(e) => handleMessageLongPress(item, e)}
                delayLongPress={300}
                className={`rounded-2xl ${isOwnMessage ? "bg-sky-500" : "bg-gray-100"}`}
                style={[
                  {
                    width: bubbleWidth,
                    padding: imagePadding,
                  },
                  isHighlighted && {
                    borderWidth: 2,
                    borderColor: "#F59E0B", // amber-500
                  },
                ]}
              >
                {/* Image container with relative positioning for overlay timestamp */}
                <View style={{ position: "relative" }}>
                  <Image
                    source={{ uri: item.image.url }}
                    style={{
                      width: imageWidth,
                      height: clampedImageHeight,
                      borderRadius: 12,
                    }}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                    transition={200}
                  />
                  {/* Timestamp overlay on image (only if no caption) */}
                  {!hasCaption && (
                    <View
                      style={{
                        position: "absolute",
                        bottom: 6,
                        right: 6,
                        backgroundColor: "rgba(0,0,0,0.5)",
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        borderRadius: 8,
                      }}
                    >
                      <Text className="text-xs !text-white">
                        {formatMessageTime(item.createdAt as any)}
                      </Text>
                    </View>
                  )}
                </View>
                {/* Caption row with timestamp at end (only if has caption) */}
                {hasCaption && (
                  <View className="flex-row items-end justify-between px-2 pt-2 pb-1">
                    <Text
                      className={`text-base flex-1 mr-2 ${isOwnMessage ? "!text-white" : "text-gray-900"}`}
                    >
                      {item.text}
                    </Text>
                    <Text
                      className={`text-xs ${isOwnMessage ? "!text-white/70" : "text-gray-500"}`}
                    >
                      {formatMessageTime(item.createdAt as any)}
                    </Text>
                  </View>
                )}
              </Pressable>
            </View>
          </SwipeableMessage>
        );
      }

      // Location message
      if (messageType === "location" && item.location) {
        const bubbleWidth = IMAGE_MAX_WIDTH;
        const mapPadding = 2; // Same padding as image bubble
        const mapWidth = bubbleWidth - mapPadding * 2;

        return (
          <SwipeableMessage
            message={item}
            isOwnMessage={isOwnMessage}
            onReply={handleContextMenuReply}
          >
            <View
              className={`px-4 py-1 ${isOwnMessage ? "items-end" : "items-start"}`}
            >
              {showSender && (
                <Text className="mb-1 ml-3 text-xs text-gray-500">
                  {item.senderName}
                </Text>
              )}
              {/* Bubble container - matches image style */}
              <Pressable
                onPress={() => handleLocationPress(item.location!)}
                onLongPress={(e) => handleMessageLongPress(item, e)}
                delayLongPress={300}
                className={`rounded-2xl ${isOwnMessage ? "bg-sky-500" : "bg-gray-100"}`}
                style={{
                  width: bubbleWidth,
                  padding: mapPadding,
                }}
              >
                {/* Map container with relative positioning for overlay timestamp */}
                <View
                  style={{
                    position: "relative",
                    width: mapWidth,
                    height: MAP_PREVIEW_HEIGHT,
                    borderRadius: 12,
                    overflow: "hidden",
                  }}
                >
                  {/* Mini MapView preview - made taller to clip Apple logo */}
                  <View
                    style={{ width: mapWidth, height: MAP_PREVIEW_HEIGHT + 30 }}
                    pointerEvents="none"
                  >
                    <MapView
                      style={{ flex: 1 }}
                      provider={
                        Platform.OS === "android" ? PROVIDER_GOOGLE : undefined
                      }
                      initialRegion={{
                        latitude: item.location.latitude,
                        longitude: item.location.longitude,
                        latitudeDelta: 0.003,
                        longitudeDelta: 0.003,
                      }}
                      scrollEnabled={false}
                      zoomEnabled={false}
                      rotateEnabled={false}
                      pitchEnabled={false}
                      showsUserLocation={false}
                      showsMyLocationButton={false}
                      showsCompass={false}
                      toolbarEnabled={false}
                      loadingEnabled
                    >
                      <Marker
                        coordinate={{
                          latitude: item.location.latitude,
                          longitude: item.location.longitude,
                        }}
                      />
                    </MapView>
                  </View>
                  {/* Timestamp overlay on map bottom-right */}
                  <View
                    style={{
                      position: "absolute",
                      bottom: 6,
                      right: 6,
                      backgroundColor: "rgba(0,0,0,0.5)",
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                      borderRadius: 8,
                    }}
                  >
                    <Text className="text-xs !text-white">
                      {formatMessageTime(item.createdAt as any)}
                    </Text>
                  </View>
                </View>
              </Pressable>
            </View>
          </SwipeableMessage>
        );
      }

      // Text message (default)
      const isHighlighted = item.id === highlightedMessageId;
      const hasReply = !!item.replyTo;

      return (
        <SwipeableMessage
          message={item}
          isOwnMessage={isOwnMessage}
          onReply={handleContextMenuReply}
        >
          <View
            className={`px-4 py-1 ${isOwnMessage ? "items-end" : "items-start"}`}
          >
            {showSender && (
              <Text className="mb-1 ml-3 text-xs text-gray-500">
                {item.senderName}
              </Text>
            )}
            <Pressable
              onLongPress={(e) => handleMessageLongPress(item, e)}
              delayLongPress={300}
            >
              <View
                className={`max-w-[80%] rounded-2xl overflow-hidden ${
                  isOwnMessage
                    ? "bg-sky-500 rounded-br-sm"
                    : "bg-gray-100 rounded-bl-sm"
                }`}
                style={
                  isHighlighted
                    ? {
                        borderWidth: 2,
                        borderColor: "#F59E0B", // amber-500
                        backgroundColor: isOwnMessage ? "#0284C7" : "#FEF3C7", // sky-600 / amber-100
                      }
                    : undefined
                }
              >
                {/* Reply Preview - WhatsApp style: full width wrapper at top of bubble */}
                {hasReply && item.replyTo && (
                  <View
                    className={`flex-row p-1 `}
                  >
                    <View className={`flex-row  min-w-[100px] rounded-xl overflow-hidden ${
                      isOwnMessage ? "bg-sky-700/50" : "bg-gray-200"
                    }`}>
                      {/* Left accent border */}
                      <View
                        className={`w-1 self-stretch ${isOwnMessage ? "bg-white/50" : "bg-gray-400"}`}
                      />
                      {/* Content */}
                      <View className="flex-1 px-3 py-2">
                        <Text
                          className={`text-sm font-semibold ${
                            isOwnMessage ? "!text-white/90" : "text-sky-600"
                          }`}
                        >
                          {item.replyTo.senderName}
                        </Text>
                        <Text
                          className={`text-sm ${
                            isOwnMessage ? "!text-white/70" : "text-gray-500"
                          }`}
                          numberOfLines={1}
                        >
                          {item.replyTo.text}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}
                {/* Main message content - inline timestamp like WhatsApp */}
                <View className="flex-row items-end px-3 py-2">
                  <Text
                    className={`text-base mr-2 ${isOwnMessage ? "!text-white" : "!text-gray-900"}`}
                  >
                    {item.text}
                  </Text>
                  <Text
                    className={`text-xs ${
                      isOwnMessage ? "!text-white/70" : "!text-gray-500"
                    }`}
                  >
                    {formatMessageTime(item.createdAt as any)}
                  </Text>
                </View>
              </View>
            </Pressable>
          </View>
        </SwipeableMessage>
      );
    },
    [userId, messages, chat?.type, handleLocationPress, highlightedMessageId],
  );

  // No loading gate - show UI immediately, images load from cache
  // Header is tappable for all existing chats and draft mode
  const isHeaderTappable = !!chatId || isDraftMode;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
      keyboardVerticalOffset={0}
    >
      <View className="flex-1" style={{ paddingTop: insets.top }}>
        {/* Header - Normal or Search mode */}
        {isSearchMode ? (
          // Search Header - only search input and close button
          <View className="flex-row items-center px-4 py-2 border-b border-gray-100">
            {/* Search Input */}
            <Input
              variant="rounded"
              size="lg"
              className="flex-1 bg-gray-100 border-0"
              style={{ height: 44 }}
            >
              <InputSlot className="pl-3">
                <Search size={20} color="#9CA3AF" />
              </InputSlot>
              <InputField
                ref={searchInputRef}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search in chat"
                placeholderTextColor="#9CA3AF"
                className="text-base"
                returnKeyType="search"
                autoCorrect={false}
                autoCapitalize="none"
              />
              {/* Clear X icon */}
              {searchQuery.length > 0 && (
                <InputSlot className="pr-3" onPress={() => setSearchQuery("")}>
                  <View className="items-center justify-center w-5 h-5 bg-gray-400 rounded-full">
                    <X size={12} color="#FFFFFF" strokeWidth={2.5} />
                  </View>
                </InputSlot>
              )}
            </Input>

            {/* Close Button */}
            <Pressable
              onPress={handleExitSearch}
              className="items-center justify-center ml-2 bg-gray-100 border border-gray-200 rounded-full"
              style={{ width: 44, height: 44 }}
            >
              <X size={22} color="#374151" />
            </Pressable>
          </View>
        ) : (
          // Normal Header
          <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
            <Pressable
              onPress={handleGoBack}
              className="p-1 mr-2 -ml-2"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <ChevronLeft size={28} color="#374151" />
            </Pressable>

            {/* Avatar + Name - Tappable for individual chats and draft mode */}
            <Pressable
              onPress={isHeaderTappable ? handleUserPress : undefined}
              disabled={!isHeaderTappable}
              className="flex-row items-center flex-1"
            >
              {chat?.type === "group" ? (
                <View className="items-center justify-center w-10 h-10 mr-3 overflow-hidden bg-green-500 rounded-full">
                  {displayInfo.photoURL ? (
                    <Image
                      source={{ uri: displayInfo.photoURL }}
                      style={{ width: 40, height: 40 }}
                      contentFit="cover"
                    />
                  ) : (
                    <Text className="text-lg font-bold !text-white">
                      {displayInfo.name.charAt(0).toUpperCase()}
                    </Text>
                  )}
                </View>
              ) : (
                <View className="mr-3">
                  <Avatar
                    uri={displayInfo.photoURL}
                    name={displayInfo.name}
                    size="xs"
                  />
                </View>
              )}

              <View className="flex-1">
                <Text
                  className="text-lg font-semibold text-gray-900"
                  numberOfLines={1}
                >
                  {displayInfo.name}
                </Text>
                {chat?.type === "group" && 'memberCount' in displayInfo && (
                  <Text className="text-sm text-gray-500">
                    {displayInfo.memberCount} members
                  </Text>
                )}
              </View>
            </Pressable>
          </View>
        )}

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={reversedMessages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          extraData={highlightedMessageId}
          inverted
          onScrollToIndexFailed={handleScrollToIndexFailed}
          contentContainerStyle={{ paddingVertical: 16, flexGrow: 1 }}
          ListEmptyComponent={
            loading && !isDraftMode ? (
              <View className="items-center justify-center flex-1 py-20">
                <ActivityIndicator size="large" color="#3B82F6" />
              </View>
            ) : (
              <View className="items-center justify-center flex-1 py-20">
                <Text className="text-gray-500">No messages yet</Text>
                <Text className="mt-1 text-sm text-gray-400">
                  Send a message to start the conversation
                </Text>
              </View>
            )
          }
          ListFooterComponent={
            pendingUploadImage ? (
              <View className="items-end px-4 py-1">
                <View
                  style={{
                    width: IMAGE_MAX_WIDTH,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: "#E5E7EB",
                    overflow: "hidden",
                  }}
                >
                  {/* Image with opacity overlay */}
                  <View style={{ position: "relative" }}>
                    <Image
                      source={{ uri: pendingUploadImage.uri }}
                      style={{
                        width: IMAGE_MAX_WIDTH - 2,
                        height: getImageDimensions(
                          pendingUploadImage.width,
                          pendingUploadImage.height,
                        ).height,
                        opacity: 0.6,
                        borderTopLeftRadius: 15,
                        borderTopRightRadius: 15,
                        borderBottomLeftRadius: pendingUploadImage.caption
                          ? 0
                          : 15,
                        borderBottomRightRadius: pendingUploadImage.caption
                          ? 0
                          : 15,
                      }}
                      contentFit="cover"
                    />
                    {/* Loading overlay */}
                    <View
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <View className="items-center justify-center w-12 h-12 rounded-full bg-black/50">
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      </View>
                    </View>
                  </View>
                  {/* Caption */}
                  {pendingUploadImage.caption && (
                    <View className="px-3 py-2 bg-sky-500">
                      <Text className="text-sm !text-white" numberOfLines={3}>
                        {pendingUploadImage.caption}
                      </Text>
                    </View>
                  )}
                </View>
                <Text className="mt-1 text-xs text-gray-400">Sending...</Text>
              </View>
            ) : null
          }
        />

        {/* Bottom Bar - Input or Search Navigation */}
        {isSearchMode ? (
          // Search Navigation Bar (replaces input bar)
          <View
            className="flex-row items-center justify-between px-4 py-3 bg-white border-t border-gray-100"
            style={{
              paddingBottom: keyboardVisible ? 8 : Math.max(insets.bottom, 12),
            }}
          >
            {/* Match Counter */}
            <Text className="text-base text-gray-600">
              {searchQuery.trim().length === 0
                ? "Type to search"
                : matchIndices.length === 0
                  ? "No results"
                  : `${currentMatchIndex + 1} of ${matchIndices.length}`}
            </Text>

            {/* Navigation Buttons */}
            <View className="flex-row">
              {/* Previous Match */}
              <Pressable
                onPress={handlePrevMatch}
                disabled={matchIndices.length === 0}
                className="items-center justify-center w-12 h-12 bg-gray-100 rounded-full"
                style={{ opacity: matchIndices.length === 0 ? 0.4 : 1 }}
              >
                <ChevronUp size={24} color="#374151" />
              </Pressable>
              {/* Next Match */}
              <Pressable
                onPress={handleNextMatch}
                disabled={matchIndices.length === 0}
                className="items-center justify-center w-12 h-12 ml-3 bg-gray-100 rounded-full"
                style={{ opacity: matchIndices.length === 0 ? 0.4 : 1 }}
              >
                <ChevronDown size={24} color="#374151" />
              </Pressable>
            </View>
          </View>
        ) : (
          // Normal Input Bar
          <View className="bg-white border-t border-gray-100">
            {/* Reply Preview - WhatsApp style */}
            {replyTo && (
              <View className="flex-row items-center bg-gray-50">
                {/* Left accent border */}
                <View className="self-stretch w-1 bg-sky-500" />
                {/* Content */}
                <View className="flex-1 px-3 py-2">
                  <Text className="text-base font-semibold text-sky-600">
                    {replyTo.senderName}
                  </Text>
                  <Text className="text-base text-gray-600" numberOfLines={1}>
                    {replyTo.type === "image"
                      ? "📷 Photo"
                      : replyTo.type === "location"
                        ? "📍 Location"
                        : replyTo.text}
                  </Text>
                </View>
                {/* Close button */}
                <Pressable
                  onPress={handleCancelReply}
                  className="items-center justify-center w-10 h-10 mr-2"
                >
                  <X size={20} color="#6B7280" />
                </Pressable>
              </View>
            )}

            <View
              className="flex-row items-end px-4 py-2"
              style={{
                paddingBottom: keyboardVisible
                  ? 8
                  : Math.max(insets.bottom, 12),
              }}
            >
              {/* Attach Button */}
              <Pressable
                onPress={handleOpenAttachmentPicker}
                disabled={uploadingImage || localSending}
                className="items-center justify-center mr-2 bg-gray-100 rounded-full"
                style={{
                  width: 44,
                  height: 44,
                  opacity: uploadingImage ? 0.5 : 1,
                }}
              >
                <Plus size={22} color="#6B7280" />
              </Pressable>

              {/* Input container with relative positioning for absolute send button */}
              <View className="flex-1" style={{ position: "relative" }}>
                {/* Native TextInput - Multiline with matching font size */}
                <TextInput
                  value={inputText}
                  onChangeText={setInputText}
                  placeholder="Message..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  maxLength={2000}
                  scrollEnabled
                  className="px-4 text-gray-900 bg-gray-100"
                  style={{
                    fontSize: 17,
                    minHeight: 44,
                    maxHeight: 300,
                    paddingTop: 12,
                    paddingBottom: 12,
                    paddingRight: hasText ? 52 : 16,
                    borderRadius: 22,
                  }}
                />

                {/* Send Button - Absolute positioned, slides in from right */}
                <Animated.View
                  style={{
                    position: "absolute",
                    right: 4,
                    bottom: 4,
                    transform: [
                      {
                        scale: sendButtonAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.5, 1],
                        }),
                      },
                    ],
                    opacity: sendButtonAnim,
                  }}
                  pointerEvents={hasText ? "auto" : "none"}
                >
                  <Pressable
                    onPress={handleSend}
                    disabled={!hasText || sending || localSending}
                    className="items-center justify-center rounded-full bg-sky-500"
                    style={{ width: 36, height: 36 }}
                  >
                    <Send size={18} color="#FFFFFF" />
                  </Pressable>
                </Animated.View>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Message Context Menu */}
      <MessageContextMenu
        visible={contextMenuVisible}
        message={selectedMessage}
        messagePosition={messagePosition}
        isOwnMessage={selectedMessage?.senderId === userId}
        onClose={handleCloseContextMenu}
        onReply={handleContextMenuReply}
        onCopy={handleContextMenuCopy}
        onForward={handleContextMenuForward}
        onStar={handleContextMenuStar}
      />

      {/* Attachment Picker Sheet */}
      <AttachmentPickerSheet
        isOpen={attachmentSheetOpen}
        onClose={() => setAttachmentSheetOpen(false)}
        onImageCaptured={handleImageCaptured}
        onLocationSelected={handleLocationSelected}
      />

      {/* Image Preview Sheet */}
      <ImagePreviewSheet
        isVisible={previewImage !== null}
        image={previewImage}
        onSend={handleImageConfirmed}
        onCancel={handlePreviewCancel}
      />

      {/* Fullscreen Image Viewer Modal */}
      <Modal
        visible={fullscreenImage !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setFullscreenImage(null)}
        statusBarTranslucent
      >
        <View className="flex-1 bg-black">
          <StatusBar barStyle="light-content" />

          {/* Header */}
          <View
            className="absolute top-0 left-0 right-0 z-10 flex-row items-center justify-between px-4"
            style={{ paddingTop: insets.top + 8, paddingBottom: 12 }}
          >
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setFullscreenImage(null);
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              className="items-center justify-center w-10 h-10 rounded-full bg-white/20"
            >
              <X size={24} color="#FFFFFF" />
            </Pressable>
          </View>

          {/* Image - Tap to close */}
          <Pressable
            onPress={() => setFullscreenImage(null)}
            className="items-center justify-center flex-1"
          >
            {fullscreenImage && (
              <View style={{ position: "relative" }}>
                {/* Loading spinner - shown until image loads */}
                {fullscreenImageLoading && (
                  <View
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      justifyContent: "center",
                      alignItems: "center",
                      zIndex: 1,
                    }}
                  >
                    <ActivityIndicator size="large" color="#FFFFFF" />
                  </View>
                )}
                <Image
                  source={{ uri: fullscreenImage.url }}
                  style={{
                    width: SCREEN_WIDTH,
                    height: Math.min(
                      (SCREEN_WIDTH / fullscreenImage.width) *
                        fullscreenImage.height,
                      Dimensions.get("window").height * 0.8,
                    ),
                  }}
                  contentFit="contain"
                  cachePolicy="memory-disk"
                  onLoadStart={() => setFullscreenImageLoading(true)}
                  onLoad={() => setFullscreenImageLoading(false)}
                />
              </View>
            )}
          </Pressable>

          {/* Caption at bottom */}
          {fullscreenImage?.caption && (
            <View
              className="absolute bottom-0 left-0 right-0 px-4 bg-black/60"
              style={{ paddingBottom: insets.bottom + 16, paddingTop: 16 }}
            >
              <Text className="text-base text-center text-white">
                {fullscreenImage.caption}
              </Text>
            </View>
          )}
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};
