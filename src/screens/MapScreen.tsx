/**
 * Map Screen - Map-based court discovery
 * Shows courts on map with location functionality
 */

import { memo, useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { View, Text, Pressable, TextInput, StyleSheet, Animated } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import MapView, { Marker } from 'react-native-maps';
import { Search } from 'lucide-react-native';
import type { TabScreenProps } from '@/types/navigation';
import { useMapRegion } from '@/hooks/common/useMapRegion';
import { MOCK_COURTS } from '@/mocks/courts';
import type { Court } from '@/types/court';
import { CourtBottomSheet } from '@/components/features/play/CourtBottomSheet';
import { usePlayNowEngine } from '@/features/play-now/usePlayNowEngine';
import { PlayNowEngineShell } from '@/features/play-now/components/PlayNowEngineShell';
import { MapWithLocation } from '@/components/features/play/MapWithLocation';

// Animated Marker Component with smooth spring animation
interface AnimatedMarkerProps {
  courtId: string;
  coordinate: { latitude: number; longitude: number };
  color: string;
  isSelected: boolean;
  isTracking: boolean;
  onPress: () => void;
}

const AnimatedMarker = memo(({
  courtId,
  coordinate,
  color,
  isSelected,
  isTracking,
  onPress,
}: AnimatedMarkerProps) => {
  // Animated scale value
  const scale = useRef(new Animated.Value(1)).current;

  // Animate scale when selection changes
  useEffect(() => {
    Animated.spring(scale, {
      toValue: isSelected ? 1.2 : 1,
      friction: 6,
      tension: 100,
      useNativeDriver: true,
    }).start();
  }, [isSelected, scale]);

  return (
    <Marker
      key={courtId}
      coordinate={coordinate}
      onPress={onPress}
      tracksViewChanges={isTracking}
      anchor={{ x: 0.5, y: 0.5 }}
    >
      <Animated.View
        style={[
          styles.markerContainer,
          {
            transform: [{ scale }],
          },
        ]}
      >
        <View style={[styles.marker, { backgroundColor: color }]} />
      </Animated.View>
    </Marker>
  );
});

AnimatedMarker.displayName = 'AnimatedMarker';

export const MapScreen = memo(({}: TabScreenProps<'Map'>) => {
  const { region, updateRegion } = useMapRegion();
  const [selectedCourtId, setSelectedCourtId] = useState<string | null>(null);
  const [showEngine, setShowEngine] = useState<boolean>(false);
  const [trackingMarkers, setTrackingMarkers] = useState<Set<string>>(new Set());
  const markerPressGuardRef = useRef(false);
  const mapRef = useRef<MapView>(null);
  const previousSelectedIdRef = useRef<string | null>(null);

  // Play Now engine (location handled by MapWithLocation)
  const engineOutput = usePlayNowEngine({ location: null });

  // Find selected court - now using full Court type
  const selectedCourt = useMemo<Court | null>(
    () => MOCK_COURTS.find((c) => c.id === selectedCourtId) || null,
    [selectedCourtId]
  );

  // Transition tracking: Enable tracksViewChanges for markers that are transitioning
  // This allows smooth scaling for both selection and deselection
  useEffect(() => {
    const toTrack = new Set<string>();
    
    // Track the currently selected marker (for scaling up)
    if (selectedCourtId) {
      toTrack.add(selectedCourtId);
    }
    
    // Track the previously selected marker (for scaling down)
    if (previousSelectedIdRef.current && previousSelectedIdRef.current !== selectedCourtId) {
      toTrack.add(previousSelectedIdRef.current);
    }
    
    // Update tracking set
    setTrackingMarkers(toTrack);
    
    // Auto-disable tracking after 1 second to save resources
    const timer = setTimeout(() => {
      setTrackingMarkers(new Set());
    }, 1000);
    
    // Update the previous selection ref
    previousSelectedIdRef.current = selectedCourtId;
    
    return () => clearTimeout(timer);
  }, [selectedCourtId]);

  // Handle marker press - show info bar and center map
  const handleMarkerPress = useCallback((courtId: string) => {
    markerPressGuardRef.current = true;
    console.log(`Selected: ${MOCK_COURTS.find((c) => c.id === courtId)?.name}`);
    
    // Center map on selected pin
    const court = MOCK_COURTS.find((c) => c.id === courtId);
    if (court && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: court.latitude,
        longitude: court.longitude,
        latitudeDelta: region.latitudeDelta,
        longitudeDelta: region.longitudeDelta,
      }, 300);
    }
    
    setSelectedCourtId(courtId);
    
    // Clear guard in next tick
    setTimeout(() => {
      markerPressGuardRef.current = false;
    }, 0);
  }, [region]);

  // Handle map press - close info bar only if open
  const handleMapPress = useCallback(() => {
    // Ignore map press if it was triggered by a marker tap
    if (markerPressGuardRef.current) {
      return;
    }
    
    if (selectedCourtId !== null) {
      setSelectedCourtId(null);
    }
  }, [selectedCourtId]);

  const handleCloseSheet = useCallback(() => {
    console.log('Closing sheet, resetting selected court');
    setSelectedCourtId(null);
  }, []);

  // Phase 1: Play Now - simplified (no location logic)
  const handlePlayNowPress = useCallback(() => {
    setShowEngine(true);
  }, []);

  const handleCloseEngine = useCallback(() => {
    setShowEngine(false);
  }, []);

  // Show engine shell if triggered
  if (showEngine) {
    return (
      <GestureHandlerRootView style={styles.container}>
        <View className="absolute inset-0 z-50 bg-white">
          <PlayNowEngineShell output={engineOutput} />
          <Pressable
            onPress={handleCloseEngine}
            className="absolute items-center justify-center w-10 h-10 bg-gray-200 rounded-full top-12 right-4"
          >
            <Text className="text-xl text-gray-700">×</Text>
          </Pressable>
        </View>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <View className="flex-1">
        {/* Map with location functionality */}
        <MapWithLocation
          ref={mapRef}
          region={region}
          onRegionChangeComplete={updateRegion}
          onPress={handleMapPress}
        >
          {/* Court markers - custom animated markers with activity colors */}
          {MOCK_COURTS.map((court) => {
            const isSelected = selectedCourtId === court.id;
            const isTracking = trackingMarkers.has(court.id);
            // Derive activity level from activePlayersNow
            const activityLevel = court.derived.activePlayersNow >= 12 ? 'high' :
                                  court.derived.activePlayersNow >= 6 ? 'medium' : 'low';
            const color =
              activityLevel === 'high'
                ? '#10b981'
                : activityLevel === 'medium'
                  ? '#f59e0b'
                  : '#6b7280';

            return (
              <AnimatedMarker
                key={court.id}
                courtId={court.id}
                coordinate={{
                  latitude: court.latitude,
                  longitude: court.longitude,
                }}
                color={color}
                isSelected={isSelected}
                isTracking={isTracking}
                onPress={() => handleMarkerPress(court.id)}
              />
            );
          })}
        </MapWithLocation>

        {/* Search bar overlay */}
        <View className="absolute top-0 left-0 right-0 px-4 pt-12">
          <View className="flex-row items-center px-4 py-3 bg-white rounded-lg shadow-lg">
            <Search size={20} color="#9ca3af" />
            <TextInput
              placeholder="Search courts..."
              placeholderTextColor="#9ca3af"
              editable={false}
              className="flex-1 ml-3 text-base text-gray-900"
            />
          </View>
        </View>

        {/* Play Now button */}
        {/* <View className="absolute left-0 right-0 items-center bottom-24">
          <Pressable
            onPress={handlePlayNowPress}
            className="px-8 py-4 bg-green-600 rounded-full shadow-lg active:bg-green-700"
          >
            <Text className="text-lg font-semibold text-white">Play Now</Text>
          </Pressable>
        </View> */}

        {/* Court bottom sheet */}
        <CourtBottomSheet court={selectedCourt} onClose={handleCloseSheet} />
      </View>
    </GestureHandlerRootView>
  );
});

MapScreen.displayName = 'MapScreen';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  marker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
