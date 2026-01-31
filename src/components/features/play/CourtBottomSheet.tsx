/**
 * Court Bottom Sheet - Enhanced with tabs and collapsing header
 * Google Maps + Apple Maps inspired design with animated header
 */

import { memo, useRef, useEffect, useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  ScrollView,
  Image,
  Animated,
  Modal,
  Dimensions,
  StatusBar,
} from 'react-native';
import type { NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import {
  X,
  Navigation,
  CheckCircle2,
  Users,
  Lightbulb,
  Clock,
  Car,
  Droplet,
  Archive,
  Trees,
  Accessibility,
  Info,
  Calendar,
  TrendingUp,
} from 'lucide-react-native';
import type { Court } from '@/types/court';
import { openMaps } from '@/lib/maps';
import {
  getCourtStatus,
  getLightingStatus,
  shouldDisablePlay,
  formatAccessType,
  formatFees,
  getTodayHours,
  formatTime,
} from '@/lib/courtHours';

interface CourtBottomSheetProps {
  court: Court | null;
  onClose: () => void;
}

type TabType = 'overview' | 'checkins' | 'reviews' | 'activity';

const COLLAPSE_THRESHOLD = 60;
const COLLAPSE_HYSTERESIS = 10;

// Animated Handle Component
interface AnimatedHandleProps {
  court: Court | null;
  scrollY: Animated.Value;
  onClose: () => void;
  onGetDirections: () => void;
}

const AnimatedHandle = memo(
  ({ court, scrollY, onClose, onGetDirections }: AnimatedHandleProps) => {
    if (!court) return null;

    const isVerified = court.curation.confidenceLevel === 'HIGH';
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Track collapse state for pointer events
    useEffect(() => {
      const listenerId = scrollY.addListener(({ value }) => {
        setIsCollapsed(value >= 40);
      });
      return () => scrollY.removeListener(listenerId);
    }, [scrollY]);

    // Interpolations for collapse animation
    const titleFontSize = scrollY.interpolate({
      inputRange: [0, COLLAPSE_THRESHOLD],
      outputRange: [22, 18],
      extrapolate: 'clamp',
    });

    const addressOpacity = scrollY.interpolate({
      inputRange: [0, 40, COLLAPSE_THRESHOLD],
      outputRange: [1, 0.5, 0],
      extrapolate: 'clamp',
    });

    const addressHeight = scrollY.interpolate({
      inputRange: [0, COLLAPSE_THRESHOLD],
      outputRange: [20, 0],
      extrapolate: 'clamp',
    });

    const directionButtonOpacity = scrollY.interpolate({
      inputRange: [40, COLLAPSE_THRESHOLD],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });

    const directionButtonScale = scrollY.interpolate({
      inputRange: [40, COLLAPSE_THRESHOLD],
      outputRange: [0.8, 1],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.handleContainer}>
        {/* Handle Indicator */}
        <View style={styles.handleIndicator} />

        <View style={styles.handleContent}>
          {/* Title Row */}
          <View style={styles.titleRow}>
            <View style={styles.titleContainer}>
              <Animated.Text
                style={[styles.courtName, { fontSize: titleFontSize }]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {court.name}
              </Animated.Text>
              {isVerified && (
                <View className="ml-2">
                  <CheckCircle2 size={18} color="#3b82f6" fill="#3b82f6" />
                </View>
              )}
            </View>

            {/* Compact direction button (appears when collapsed) */}
            <Animated.View
              style={[
                styles.compactDirectionButton,
                {
                  opacity: directionButtonOpacity,
                  transform: [{ scale: directionButtonScale }],
                },
              ]}
              pointerEvents={isCollapsed ? 'auto' : 'none'}
            >
              <Pressable
                onPress={onGetDirections}
                style={styles.compactIconButton}
              >
                <Navigation size={18} color="#3b82f6" />
              </Pressable>
            </Animated.View>

            {/* Close Button */}
            <Pressable style={styles.closeButton} onPress={onClose}>
              <View style={styles.closeButtonCircle}>
                <X size={20} color="#000000" />
              </View>
            </Pressable>
          </View>

          {/* Address (collapses) */}
          <Animated.View
            style={[
              styles.addressContainer,
              {
                opacity: addressOpacity,
                height: addressHeight,
              },
            ]}
          >
            <Text style={styles.addressText} numberOfLines={1}>
              {court.address}
            </Text>
          </Animated.View>
        </View>
      </View>
    );
  }
);

AnimatedHandle.displayName = 'AnimatedHandle';

// Actions Section Component
interface ActionsSectionProps {
  court: Court;
  onPlay: () => void;
  onGetDirections: () => void;
}

const ActionsSection = memo(
  ({ court, onPlay, onGetDirections }: ActionsSectionProps) => {
    const playStatus = shouldDisablePlay(court);

    return (
      <View style={styles.actionsSection}>
        <View className="flex-row gap-3">
          {/* Play Button */}
          <Pressable
            onPress={onPlay}
            disabled={playStatus.disabled}
            className={`flex-1 py-3.5 rounded-lg ${
              playStatus.disabled
                ? 'bg-gray-300'
                : 'bg-green-500 active:bg-green-600'
            }`}
          >
            <Text
              className={`text-center font-semibold text-base ${
                playStatus.disabled ? '!text-gray-500' : '!text-white'
              }`}
            >
              Play
            </Text>
            {playStatus.reason && (
              <Text className="text-xs text-center !text-gray-600 mt-0.5">
                {playStatus.reason}
              </Text>
            )}
          </Pressable>

          {/* Directions Button */}
          <Pressable
            onPress={onGetDirections}
            className="flex-1 py-3.5 bg-blue-500 rounded-lg active:bg-blue-600"
          >
            <Text className="text-center font-semibold text-base !text-white">
              Directions
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }
);

ActionsSection.displayName = 'ActionsSection';

// Photo Viewer Modal Component
interface PhotoViewerProps {
  visible: boolean;
  photos: Court['photos'];
  initialIndex: number;
  onClose: () => void;
}

const PhotoViewer = memo(({ visible, photos, initialIndex, onClose }: PhotoViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const scrollViewRef = useRef<ScrollView>(null);
  const { width, height } = Dimensions.get('window');
  
  // Gesture animation values
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const gestureState = useRef({ isActive: false });

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    if (visible && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ x: currentIndex * width, animated: false });
      // Reset animation values when opening
      translateY.setValue(0);
      opacity.setValue(1);
    }
  }, [visible, currentIndex, width, translateY, opacity]);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / width);
    if (index !== currentIndex && index >= 0 && index < photos.length) {
      setCurrentIndex(index);
    }
  }, [currentIndex, width, photos.length]);

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: translateY } }],
    { 
      useNativeDriver: true,
      listener: (event: any) => {
        const translationY = event.nativeEvent.translationY;
        
        // Only allow downward drag
        if (translationY > 0) {
          // Update opacity based on drag distance
          const newOpacity = Math.max(0.3, 1 - translationY / (height / 2));
          opacity.setValue(newOpacity);
        }
      }
    }
  );

  const onHandlerStateChange = useCallback((event: any) => {
    if (event.nativeEvent.state === State.END) {
      const { translationY, velocityY } = event.nativeEvent;
      
      // Close if dragged down > 150px OR fast downward velocity
      const shouldClose = translationY > 150 || velocityY > 1000;
      
      if (shouldClose) {
        // Animate out and close
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: height,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onClose();
          // Reset values after close
          translateY.setValue(0);
          opacity.setValue(1);
        });
      } else {
        // Snap back to original position
        Animated.parallel([
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            friction: 8,
          }),
          Animated.spring(opacity, {
            toValue: 1,
            useNativeDriver: true,
            friction: 8,
          }),
        ]).start();
      }
    }
  }, [translateY, opacity, height, onClose]);

  if (!visible) return null;

  const currentPhoto = photos[currentIndex];

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
        activeOffsetY={10}
        failOffsetY={-10}
        failOffsetX={[-20, 20]}
      >
        <Animated.View 
          style={[
            styles.photoViewerContainer,
            {
              transform: [{ translateY }],
              opacity,
            },
          ]}
        >
        <StatusBar hidden />
        
        {/* Header */}
        <View style={styles.photoViewerHeader}>
          <View style={styles.photoViewerInfo}>
            <Text style={styles.photoViewerCounter}>
              {currentIndex + 1} / {photos.length}
            </Text>
            <Text style={styles.photoViewerType}>
              {currentPhoto.photoType}
            </Text>
          </View>
          <Pressable onPress={onClose} style={styles.photoViewerCloseButton}>
            <X size={24} color="#FFFFFF" />
          </Pressable>
        </View>

        {/* Photos ScrollView */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          bounces={false}
        >
          {photos.map((photo) => (
            <View
              key={photo.id}
              style={[styles.photoViewerPage, { width, height }]}
            >
              <Image
                source={{ uri: photo.url }}
                style={styles.photoViewerImage}
                resizeMode="contain"
              />
            </View>
          ))}
        </ScrollView>

        {/* Footer with dots indicator */}
        {photos.length > 1 && (
          <View style={styles.photoViewerFooter}>
            <View style={styles.dotsContainer}>
              {photos.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    index === currentIndex && styles.dotActive,
                  ]}
                />
              ))}
            </View>
          </View>
        )}
        </Animated.View>
      </PanGestureHandler>
    </Modal>
  );
});

PhotoViewer.displayName = 'PhotoViewer';

// Photos Section Component
interface PhotosSectionProps {
  photos: Court['photos'];
  onPhotoPress: (index: number) => void;
}

const PhotosSection = memo(({ photos, onPhotoPress }: PhotosSectionProps) => {
  if (photos.length === 0) return null;

  return (
    <View style={styles.photosSection}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.photosScrollContent}
      >
        {photos.slice(0, 3).map((photo, index) => (
          <Pressable
            key={photo.id}
            onPress={() => onPhotoPress(index)}
            style={[
              styles.photoContainer,
              index === 0 && styles.photoContainerFirst,
              index === photos.length - 1 && styles.photoContainerLast
            ]}
          >
            <Image
              source={{ uri: photo.url }}
              style={styles.photo}
              resizeMode="cover"
            />
            <View style={styles.photoBadge}>
              <Text className="text-xs font-medium !text-white">
                {photo.photoType}
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
});

PhotosSection.displayName = 'PhotosSection';

// Tab Bar Component
interface TabBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const TabBar = memo(({ activeTab, onTabChange }: TabBarProps) => {
  return (
    <View style={styles.tabBar}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabScrollContent}
      >
        {(['overview', 'checkins', 'reviews', 'activity'] as TabType[]).map(
          (tab) => (
            <Pressable
              key={tab}
              onPress={() => onTabChange(tab)}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.tabTextActive,
                ]}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
              {activeTab === tab && <View style={styles.tabIndicator} />}
            </Pressable>
          )
        )}
      </ScrollView>
    </View>
  );
});

TabBar.displayName = 'TabBar';

// Overview Tab (now without photos and actions)
const OverviewTab = memo(({ court }: { court: Court }) => {
  const status = getCourtStatus(court);
  const lightingStatus = getLightingStatus(court);
  const checkedInCount = court.derived.activePlayersNow;
  const todayHours = getTodayHours(court);
  const fees = formatFees(court.access);

  return (
    <View style={styles.tabContent}>
      {/* Live Status Strip */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 16 }}
        className="mb-6"
      >
        {checkedInCount > 0 && (
          <View style={styles.statusChip}>
            <Users size={14} color="#10b981" />
            <Text className="text-sm font-medium !text-gray-700 ml-1.5">
              {checkedInCount} checked in
            </Text>
          </View>
        )}
        {lightingStatus && (
          <View style={styles.statusChip}>
            <Lightbulb size={14} color="#f59e0b" />
            <Text className="text-sm font-medium !text-gray-700 ml-1.5">
              {lightingStatus}
            </Text>
          </View>
        )}
        <View style={[styles.statusChip, { borderColor: status.color }]}>
          <Clock size={14} color={status.color} />
          <Text className="text-sm font-medium !text-gray-700 ml-1.5">
            {status.text}
          </Text>
        </View>
      </ScrollView>

      {/* About Section */}
      <View className="mb-6">
        <Text style={styles.sectionTitle}>About this court</Text>
        <View style={styles.aboutCard}>
          <Text className="text-sm !text-gray-700 mb-2">
            <Text className="font-semibold">
              {court.numberOfCourts}{' '}
              {court.numberOfCourts === 1 ? 'court' : 'courts'}
            </Text>
            {' • '}
            {court.isIndoor ? 'Indoor' : 'Outdoor'}
            {' • '}
            {court.courtSurface} surface
          </Text>
          <Text className="text-sm !text-gray-700 mb-2">
            <Text className="font-semibold">Condition:</Text>{' '}
            {court.courtCondition}
          </Text>
          {court.curation.verificationNotes && (
            <Text className="text-sm !text-gray-600 leading-5 mt-2">
              {court.curation.verificationNotes}
            </Text>
          )}
        </View>
      </View>

      {/* Amenities */}
      <View className="mb-6">
        <Text style={styles.sectionTitle}>Amenities</Text>
        <View className="flex-row flex-wrap gap-2">
          {court.amenities.parking.available && (
            <View style={styles.amenityPill}>
              <Car size={14} color="#10b981" />
              <Text className="text-xs font-medium !text-gray-700 ml-1.5">
                {court.amenities.parking.type} Parking
              </Text>
            </View>
          )}
          {court.amenities.restrooms && (
            <View style={styles.amenityPill}>
              <Archive size={14} color="#10b981" />
              <Text className="text-xs font-medium !text-gray-700 ml-1.5">
                Restrooms
              </Text>
            </View>
          )}
          {court.amenities.waterFountain && (
            <View style={styles.amenityPill}>
              <Droplet size={14} color="#10b981" />
              <Text className="text-xs font-medium !text-gray-700 ml-1.5">
                Water
              </Text>
            </View>
          )}
          {court.amenities.shade !== 'NONE' && (
            <View style={styles.amenityPill}>
              <Trees size={14} color="#10b981" />
              <Text className="text-xs font-medium !text-gray-700 ml-1.5">
                {court.amenities.shade} Shade
              </Text>
            </View>
          )}
          {court.amenities.wheelchairAccessible && (
            <View style={styles.amenityPill}>
              <Accessibility size={14} color="#10b981" />
              <Text className="text-xs font-medium !text-gray-700 ml-1.5">
                Accessible
              </Text>
            </View>
          )}
          {court.lighting.available && (
            <View style={styles.amenityPill}>
              <Lightbulb size={14} color="#10b981" />
              <Text className="text-xs font-medium !text-gray-700 ml-1.5">
                Lights ({court.lighting.quality})
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Operating Hours */}
      <View className="mb-6">
        <Text style={styles.sectionTitle}>Hours</Text>
        <View style={styles.infoCard}>
          <Text className="text-sm font-semibold !text-gray-900 mb-2">
            Today: {formatTime(todayHours.open)} -{' '}
            {formatTime(todayHours.close)}
            <Text className="font-normal !text-green-600">
              {' '}
              • {status.text}
            </Text>
          </Text>
        </View>
      </View>

      {/* Access & Fees */}
      <View className="mb-6">
        <Text style={styles.sectionTitle}>Access</Text>
        <View style={styles.infoCard}>
          <Text className="text-sm !text-gray-700 mb-1">
            {formatAccessType(court.access.type)}
          </Text>
          {fees && (
            <Text className="text-sm font-semibold !text-gray-900 mb-1">
              {fees}
            </Text>
          )}
          <Text className="text-sm !text-gray-600">
            Reservation:{' '}
            {court.access.reservationRequired ? 'Required' : 'Not required'}
          </Text>
        </View>
      </View>

      {/* Verification Info */}
      <View className="mb-4">
        <View style={styles.verificationCard}>
          <Info size={14} color="#3b82f6" />
          <View className="flex-1 ml-2">
            <Text className="text-xs !text-gray-600">
              Verified court • Last confirmed{' '}
              {new Date(court.curation.lastVerified).toLocaleDateString(
                'en-US',
                {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                }
              )}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
});

OverviewTab.displayName = 'OverviewTab';

// Check-ins Tab
const CheckinsTab = memo(({ court }: { court: Court }) => {
  const checkedInCount = court.derived.activePlayersNow;

  return (
    <View style={styles.tabContent}>
      {checkedInCount > 0 ? (
        <>
          <Text style={styles.sectionTitle}>
            Checked in now ({checkedInCount})
          </Text>
          <View className="items-center py-12">
            <Users size={48} color="#d1d5db" />
            <Text className="text-base !text-gray-500 mt-4">
              Check-in feature coming soon
            </Text>
          </View>
        </>
      ) : (
        <View className="items-center py-12">
          <Text className="mb-3 text-2xl">👻</Text>
          <Text className="text-lg font-semibold !text-gray-900 mb-2">
            No one here yet
          </Text>
          <Text className="text-sm !text-gray-600 text-center px-8 mb-6">
            Be the first to check in and let others know this court is active!
          </Text>
          <Pressable className="px-6 py-3 bg-green-500 rounded-lg active:bg-green-600">
            <Text className="font-semibold !text-white">Check in now</Text>
          </Pressable>
        </View>
      )}

      {/* Check-in Stats */}
      <View className="mt-6">
        <Text style={styles.sectionTitle}>Check-in history</Text>
        <View style={styles.statsCard}>
          <View className="flex-row items-center mb-3">
            <TrendingUp size={16} color="#10b981" />
            <Text className="text-sm font-semibold !text-gray-900 ml-2">
              {court.derived.matchesLast7Days} check-ins this week
            </Text>
          </View>
          <Text className="text-xs !text-gray-600">
            Based on match activity • Last 7 days
          </Text>
        </View>
      </View>
    </View>
  );
});

CheckinsTab.displayName = 'CheckinsTab';

// Reviews Tab
const ReviewsTab = memo(() => {
  return (
    <View style={styles.tabContent}>
      <View className="items-center py-12">
        <Text className="mb-3 text-2xl">📝</Text>
        <Text className="text-lg font-semibold !text-gray-900 mb-2">
          No reviews yet
        </Text>
        <Text className="text-sm !text-gray-600 text-center px-8 mb-6">
          Share your experience to help the community!
        </Text>
        <Pressable className="px-6 py-3 bg-blue-500 rounded-lg active:bg-blue-600">
          <Text className="font-semibold !text-white">Write first review</Text>
        </Pressable>
      </View>
    </View>
  );
});

ReviewsTab.displayName = 'ReviewsTab';

// Activity Tab
const ActivityTab = memo(({ court }: { court: Court }) => {
  const plannedCount = court.derived.plannedGamesToday;

  return (
    <View style={styles.tabContent}>
      {plannedCount > 0 ? (
        <>
          <Text style={styles.sectionTitle}>
            Planned games ({plannedCount})
          </Text>
          <View className="items-center py-12">
            <Calendar size={48} color="#d1d5db" />
            <Text className="text-base !text-gray-500 mt-4">
              Planned games coming soon
            </Text>
          </View>
        </>
      ) : (
        <View className="items-center py-12">
          <Text className="mb-3 text-2xl">🎾</Text>
          <Text className="text-lg font-semibold !text-gray-900 mb-2">
            No games planned yet
          </Text>
          <Text className="text-sm !text-gray-600 text-center px-8 mb-6">
            Start a game and invite others!
          </Text>
          <Pressable className="px-6 py-3 bg-green-500 rounded-lg active:bg-green-600">
            <Text className="font-semibold !text-white">Plan a game</Text>
          </Pressable>
        </View>
      )}

      {/* Activity Stats */}
      <View className="mt-6">
        <Text style={styles.sectionTitle}>Match history</Text>
        <View style={styles.statsCard}>
          <Text className="text-sm !text-gray-700 mb-2">
            <Text className="font-semibold">
              ⚡ {court.derived.matchesLast7Days}
            </Text>{' '}
            matches last week
          </Text>
          <Text className="text-sm !text-gray-700">
            <Text className="font-semibold">
              🏆 {court.derived.matchesLast30Days}
            </Text>{' '}
            matches last month
          </Text>
        </View>
      </View>
    </View>
  );
});

ActivityTab.displayName = 'ActivityTab';

// Main Component
export const CourtBottomSheet = memo(
  ({ court, onClose }: CourtBottomSheetProps) => {
    const bottomSheetRef = useRef<BottomSheet>(null);
    const [sheetIndex, setSheetIndex] = useState(-1);
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [photoViewerVisible, setPhotoViewerVisible] = useState(false);
    const [photoViewerIndex, setPhotoViewerIndex] = useState(0);

    // Animated scroll value
    const scrollY = useRef(new Animated.Value(0)).current;
    const scrollYRef = useRef(0);
    const dragStartYRef = useRef(0);
    const isCollapsedRef = useRef(false);
    const scrollViewRef = useRef<any>(null);

    // Calculate snap threshold (mid-point of photos section)
    // Actions (~80px) + Photos top padding (16px) + Half of photo height (70px) = ~166px
    const SNAP_THRESHOLD = 166;
    // Position to snap to when scrolling forward (just past photos, at tabs)
    const SNAP_TO_TABS_POSITION = 252;

    // Snap points
    const snapPoints = useMemo(() => ['30%', '92%'], []);

    // Open to collapsed when court is selected
    useEffect(() => {
      if (court) {
        bottomSheetRef.current?.snapToIndex(0);
        setActiveTab('overview');
        scrollY.setValue(0);
        isCollapsedRef.current = false;
      } else {
        bottomSheetRef.current?.close();
      }
    }, [court, scrollY]);

    // Monitor scroll for collapse threshold (Option C)
    useEffect(() => {
      const listenerId = scrollY.addListener(({ value }) => {
        scrollYRef.current = value;

        // Snap to collapsed when crossing threshold
        if (value >= COLLAPSE_THRESHOLD && !isCollapsedRef.current) {
          isCollapsedRef.current = true;
        } else if (
          value < COLLAPSE_THRESHOLD - COLLAPSE_HYSTERESIS &&
          isCollapsedRef.current
        ) {
          isCollapsedRef.current = false;
        }
      });

      return () => scrollY.removeListener(listenerId);
    }, [scrollY]);

    const handleClose = useCallback(() => {
      onClose();
    }, [onClose]);

    const handlePlay = useCallback(() => {
      console.log('Play at court:', court?.id);
      // TODO: Implement play flow
    }, [court?.id]);

    const handleGetDirections = useCallback(() => {
      if (court) {
        openMaps({
          latitude: court.latitude,
          longitude: court.longitude,
          name: court.name,
          address: court.address,
        });
      }
    }, [court]);

    const handlePhotoPress = useCallback((index: number) => {
      setPhotoViewerIndex(index);
      setPhotoViewerVisible(true);
    }, []);

    const handlePhotoViewerClose = useCallback(() => {
      setPhotoViewerVisible(false);
    }, []);

    const renderHandle = useCallback(
      () => (
        <AnimatedHandle
          court={court}
          scrollY={scrollY}
          onClose={handleClose}
          onGetDirections={handleGetDirections}
        />
      ),
      [court, scrollY, handleClose, handleGetDirections]
    );

    return (
      <BottomSheet
        ref={bottomSheetRef}
        index={sheetIndex}
        snapPoints={snapPoints}
        handleComponent={renderHandle}
        backgroundStyle={styles.bottomSheetBackground}
        enableDynamicSizing={false}
        enableOverDrag={false}
        enablePanDownToClose={false}
        enableContentPanningGesture={true}
        enableHandlePanningGesture={true}
        activeOffsetY={[-20, 20]}
        onChange={setSheetIndex}
      >
        {court && (
          <BottomSheetScrollView
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            bounces={false}
            overScrollMode="never"
            scrollEventThrottle={16}
            scrollEnabled={sheetIndex !== 0}
            stickyHeaderIndices={[2]}
            onScroll={(e: NativeSyntheticEvent<NativeScrollEvent>) => {
              // Manually update animated value to avoid Worklets conflict
              const offsetY = e.nativeEvent.contentOffset.y;
              scrollY.setValue(offsetY);
            }}
            onScrollBeginDrag={(
              e: NativeSyntheticEvent<NativeScrollEvent>
            ) => {
              dragStartYRef.current = e.nativeEvent.contentOffset.y;
            }}
            onScrollEndDrag={(e: NativeSyntheticEvent<NativeScrollEvent>) => {
              const endY = e.nativeEvent.contentOffset.y;
              const velocityY = e.nativeEvent.velocity?.y ?? 0;

              // Collapse sheet if at top AND downward swipe
              if (
                dragStartYRef.current <= 0 &&
                endY <= 0 &&
                velocityY < -0.1
              ) {
                bottomSheetRef.current?.snapToIndex(0);
                return;
              }

              // Google Maps style snap behavior:
              // If scroll stopped before mid-point of photos → snap back to top
              // If scroll passed mid-point → snap forward to tabs
              if (endY > 0 && endY < SNAP_TO_TABS_POSITION) {
                if (endY < SNAP_THRESHOLD) {
                  // Before mid-point → snap back to top (reset header)
                  scrollViewRef.current?.scrollTo({ y: 0, animated: true });
                } else {
                  // Past mid-point → snap forward to tabs
                  scrollViewRef.current?.scrollTo({
                    y: SNAP_TO_TABS_POSITION,
                    animated: true,
                  });
                }
              }
            }}
          >
            {/* Actions Section - Index 0 */}
            <ActionsSection
              court={court}
              onPlay={handlePlay}
              onGetDirections={handleGetDirections}
            />

            {/* Photos Section - Index 1 */}
            <PhotosSection 
              photos={court.photos} 
              onPhotoPress={handlePhotoPress}
            />

            {/* Tab Bar - Index 2 (STICKY) */}
            <TabBar activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Tab Content - Index 3 */}
            {activeTab === 'overview' && <OverviewTab court={court} />}
            {activeTab === 'checkins' && <CheckinsTab court={court} />}
            {activeTab === 'reviews' && <ReviewsTab />}
            {activeTab === 'activity' && <ActivityTab court={court} />}
          </BottomSheetScrollView>
        )}

        {/* Photo Viewer Modal */}
        {court && (
          <PhotoViewer
            visible={photoViewerVisible}
            photos={court.photos}
            initialIndex={photoViewerIndex}
            onClose={handlePhotoViewerClose}
          />
        )}
      </BottomSheet>
    );
  }
);

CourtBottomSheet.displayName = 'CourtBottomSheet';

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  // Handle
  handleContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  handleIndicator: {
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 8,
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
  },
  handleContent: {
    paddingTop: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 8,
  },
  courtName: {
    fontWeight: 'bold',
    color: '#000000',
    lineHeight: 28,
    flexShrink: 1,
  },
  addressContainer: {
    overflow: 'hidden',
  },
  addressText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  compactDirectionButton: {
    marginRight: 8,
  },
  compactIconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    marginLeft: 'auto',
  },
  closeButtonCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Content Sections
  actionsSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  photosSection: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  photosScrollContent: {
    paddingRight: 20,
  },
  photoContainer: {
    marginRight: 12,
  },
  photoContainerFirst: {
    marginLeft: 20,
  },
  photoContainerLast: {
    marginRight: 20,
  },
  photo: {
    width: 140,
    height: 140,
    borderRadius: 12,
  },
  photoBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  // Tabs
  tabBar: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  tabScrollContent: {
    paddingHorizontal: 20,
    gap: 24,
  },
  tab: {
    paddingVertical: 12,
    position: 'relative',
  },
  tabActive: {},
  tabText: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '400',
  },
  tabTextActive: {
    color: '#000000',
    fontWeight: '600',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#10b981',
    borderRadius: 1,
  },
  // Content
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  tabContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  // Status Chips
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  // Cards
  aboutCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
  },
  infoCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
  },
  statsCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
  },
  verificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: 12,
  },
  // Amenities
  amenityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  // Photo Viewer
  photoViewerContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  photoViewerHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.select({ ios: 50, android: 40 }),
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 10,
  },
  photoViewerInfo: {
    flex: 1,
  },
  photoViewerCounter: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  photoViewerType: {
    fontSize: 14,
    color: '#D1D5DB',
  },
  photoViewerCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoViewerPage: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoViewerImage: {
    width: '100%',
    height: '100%',
  },
  photoViewerFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.select({ ios: 40, android: 30 }),
    paddingTop: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  dotActive: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
});
