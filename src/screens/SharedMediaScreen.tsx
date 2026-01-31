/**
 * SharedMediaScreen - Grid of shared photos in a chat
 * Features:
 * - Grid layout with 3 columns
 * - Full-screen image preview on tap
 * - Loading states
 */

import { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  FlatList,
  Modal,
  StatusBar,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronLeft, X } from 'lucide-react-native';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';

import { useMessages } from '@/hooks/firestore/useMessages';
import type { RootStackParamList } from '@/types/navigation';

type SharedMediaRouteProp = RouteProp<RootStackParamList, 'SharedMedia'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_GAP = 2;
const NUM_COLUMNS = 3;
const TILE_SIZE = (SCREEN_WIDTH - GRID_GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

interface SharedImage {
  id: string;
  url: string;
  width: number;
  height: number;
  timestamp: number;
}

export const SharedMediaScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<SharedMediaRouteProp>();
  const { chatId, groupName } = route.params;

  const { messages, loading } = useMessages(chatId);
  
  const [fullscreenImage, setFullscreenImage] = useState<SharedImage | null>(null);
  const [fullscreenImageLoading, setFullscreenImageLoading] = useState(true);

  // Extract shared images from messages
  const sharedImages = useMemo((): SharedImage[] => {
    return messages
      .filter((msg) => msg.type === 'image' && msg.image)
      .map((msg) => ({
        id: msg.id,
        url: msg.image!.url,
        width: msg.image!.width,
        height: msg.image!.height,
        timestamp: msg.createdAt?.seconds || 0,
      }))
      .sort((a, b) => b.timestamp - a.timestamp); // Newest first
  }, [messages]);

  // Handle go back
  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // Handle image tap
  const handleImageTap = useCallback((image: SharedImage) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFullscreenImageLoading(true);
    setFullscreenImage(image);
  }, []);

  // Render grid item
  const renderItem = useCallback(
    ({ item, index }: { item: SharedImage; index: number }) => (
      <Pressable
        onPress={() => handleImageTap(item)}
        style={{
          width: TILE_SIZE,
          height: TILE_SIZE,
          marginRight: (index + 1) % NUM_COLUMNS === 0 ? 0 : GRID_GAP,
          marginBottom: GRID_GAP,
        }}
      >
        <Image
          source={{ uri: item.url }}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={200}
        />
      </Pressable>
    ),
    [handleImageTap]
  );

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
        <Pressable
          onPress={handleGoBack}
          className="p-1 mr-2 -ml-2"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ChevronLeft size={28} color="#374151" />
        </Pressable>
        
        <View className="flex-1">
          <Text className="text-lg font-semibold !text-gray-900" numberOfLines={1}>
            Shared Media
          </Text>
          <Text className="text-sm !text-gray-500" numberOfLines={1}>
            {groupName}
          </Text>
        </View>
        
        <Text className="text-sm !text-gray-500">
          {sharedImages.length} photos
        </Text>
      </View>

      {/* Content */}
      {loading ? (
        <View className="items-center justify-center flex-1">
          <ActivityIndicator size="large" color="#0EA5E9" />
        </View>
      ) : sharedImages.length === 0 ? (
        <View className="items-center justify-center flex-1">
          <Text className="text-lg font-medium !text-gray-500">No photos shared yet</Text>
          <Text className="mt-1 text-sm !text-gray-400">
            Photos shared in this chat will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={sharedImages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={NUM_COLUMNS}
          contentContainerStyle={{
            paddingBottom: insets.bottom + 20,
          }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Fullscreen Image Modal */}
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

          {/* Image */}
          <Pressable
            onPress={() => setFullscreenImage(null)}
            className="items-center justify-center flex-1"
          >
            {fullscreenImage && (
              <View style={{ position: 'relative' }}>
                {fullscreenImageLoading && (
                  <View
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      justifyContent: 'center',
                      alignItems: 'center',
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
                      (SCREEN_WIDTH / fullscreenImage.width) * fullscreenImage.height,
                      Dimensions.get('window').height * 0.8
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
        </View>
      </Modal>
    </View>
  );
};
