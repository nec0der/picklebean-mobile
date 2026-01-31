/**
 * GravityMapScreen - THE SACRED MAP SCREEN
 * 
 * Purpose: Answer one question instantly -
 * "Is it worth going to play right now?"
 * 
 * Design: Calm, confident, human.
 * The interface disappears when users focus on playing.
 */

import { memo, useState, useCallback, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  Pressable, 
  StyleSheet, 
  Platform,
  Linking,
  AppState,
} from 'react-native';
import type { AppStateStatus } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import MapView, { PROVIDER_DEFAULT } from 'react-native-maps';
import { Search, Navigation, SlidersHorizontal } from 'lucide-react-native';
import { TextInput, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import type { NavigationProp, RouteProp } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useMapRegion } from '@/hooks/common/useMapRegion';
import { useLocationPreference } from '@/hooks/common/useLocationPreference';
import { useLocation } from '@/hooks/common/useLocation';
import { requestLocationWithOutcome, checkLocationPermission } from '@/lib/location';
import { clusterCourts } from '@/lib/clustering';
import type { CourtCluster } from '@/lib/clustering';
import { MOCK_COURTS } from '@/mocks/courts';
import type { Court } from '@/types/court';
import { CourtBottomSheet } from '@/components/gravity/CourtBottomSheet';
import { CourtPin } from '@/components/gravity/CourtPin';
import { ClusterPin } from '@/components/gravity/ClusterPin';
import { MapModeToggle } from '@/components/gravity/MapModeToggle';
import type { MapMode } from '@/components/gravity/MapModeToggle';
import { SettingsPromptSheet } from '@/components/features/play/SettingsPromptSheet';
import { FLOATING_TAB_BAR_HEIGHT } from '@/navigation/tabs/GravityTabNavigator';
import type { GravityTabParamList, MapFilterState } from '@/navigation/tabs/GravityTabNavigator';
import type { RootStackParamList } from '@/types/navigation';

// =============================================================================
// DESIGN TOKENS (LOCKED)
// =============================================================================

const SPACING = {
  MICRO: 4,
  TIGHT: 8,
  DEFAULT: 16,
  RELAXED: 24,
  SECTION: 32,
} as const;

const COLORS = {
  PRIMARY: '#3B82F6',       // Blue - actions
  PRIMARY_LIGHT: '#60A5FA', // Lighter blue - calm equality
  ACCENT: '#10B981',        // Green - activity/presence
  NEUTRAL: '#6B7280',       // Gray - inactive
} as const;

// =============================================================================
// MAIN SCREEN
// =============================================================================

export const GravityMapScreen = memo(() => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<GravityTabParamList, 'GravityMap'>>();
  const { region, updateRegion } = useMapRegion();
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [showSettingsPrompt, setShowSettingsPrompt] = useState(false);
  const [mapMode, setMapMode] = useState<MapMode>('activity');
  const [activityFilter, setActivityFilter] = useState<'all' | 'business'>('all');
  const [socialFilter, setSocialFilter] = useState<'all' | 'following' | 'followers'>('all');
  const [exploreFilter, setExploreFilter] = useState<'all' | 'indoor' | 'outdoor'>('all');
  const [eventsFilter, setEventsFilter] = useState<'all' | 'upcoming' | 'this_week'>('all');
  const [trainFilter, setTrainFilter] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const mapRef = useRef<MapView>(null);

  // Handle incoming filter state from MapFilterScreen
  useFocusEffect(
    useCallback(() => {
      const filterState = route.params?.filterState;
      if (filterState) {
        setMapMode(filterState.mode);
        setActivityFilter(filterState.activityFilter);
        setSocialFilter(filterState.socialFilter);
        setExploreFilter(filterState.exploreFilter);
        setEventsFilter(filterState.eventsFilter);
        setTrainFilter(filterState.trainFilter);
        // Clear the params to prevent re-applying on next focus
        navigation.setParams({ filterState: undefined } as any);
      }
    }, [route.params?.filterState, navigation])
  );
  
  // Track if a marker was just pressed to prevent race condition
  const markerPressedRef = useRef(false);
  
  // Live region for real-time clustering while zooming
  const [liveRegion, setLiveRegion] = useState(region);
  
  // Sync liveRegion when region updates from async load
  useEffect(() => {
    setLiveRegion(region);
  }, [region]);
  
  // Update live region while user is zooming (real-time)
  const handleRegionChange = useCallback((newRegion: typeof region) => {
    setLiveRegion(newRegion);
  }, []);
  
  // Filter courts for social mode - only show courts with active players
  const courtsToDisplay = mapMode === 'social'
    ? MOCK_COURTS.filter(court => court.derived.activePlayersNow > 0)
    : MOCK_COURTS;
  
  // Cluster courts based on LIVE region (updates while zooming)
  const clusteredData = clusterCourts(courtsToDisplay, liveRegion.latitudeDelta, liveRegion.longitudeDelta, mapMode);
  
  // Location state management
  const {
    state: locationState,
    setPreference,
  } = useLocationPreference();

  // Map center for location hook
  const mapCenter = {
    lat: region.latitude,
    lng: region.longitude,
  };

  const { fetchGPS, recenterMap } = useLocation({
    preference: locationState.preference,
    mapCenter,
  });

  // Request permission on mount
  useEffect(() => {
    const requestInitialPermission = async () => {
      try {
        const current = await checkLocationPermission();
        
        if (current) {
          await setPreference('gps_active');
          return;
        }
        
        if (locationState.preference === 'undecided') {
          const result = await requestLocationWithOutcome();
          
          if (result.granted) {
            await setPreference('gps_active');
            await fetchGPS();
          } else if (result.denied) {
            await setPreference('map_preferred');
          }
        }
      } catch (error) {
        console.error('Error requesting initial permission:', error);
      }
    };

    requestInitialPermission();
  }, []);

  // Listen for app state changes (returning from Settings)
  useEffect(() => {
    const recheckPermission = async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        try {
          const current = await checkLocationPermission();
          if (current && locationState.preference !== 'gps_active') {
            await setPreference('gps_active');
          } else if (!current && locationState.preference === 'gps_active') {
            await setPreference('map_preferred');
          }
        } catch (error) {
          console.error('Error rechecking permission:', error);
        }
      }
    };

    const subscription = AppState.addEventListener('change', recheckPermission);
    return () => subscription.remove();
  }, [locationState.preference, setPreference]);
  
  // Handle pin press - center map and show preview
  const handlePinPress = useCallback((court: Court) => {
    markerPressedRef.current = true;
    setSelectedCourt(court);
    
    mapRef.current?.animateToRegion({
      latitude: court.latitude,
      longitude: court.longitude,
      latitudeDelta: region.latitudeDelta,
      longitudeDelta: region.longitudeDelta,
    }, 300);
    
    setTimeout(() => {
      markerPressedRef.current = false;
    }, 100);
  }, [region]);
  
  // Handle map press - dismiss sheet ONLY if not pressing a marker
  const handleMapPress = useCallback(() => {
    if (markerPressedRef.current) {
      return;
    }
    
    if (selectedCourt) {
      setSelectedCourt(null);
    }
  }, [selectedCourt]);
  
  // Handle search icon press
  const handleSearchPress = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    console.log('Search pressed');
  }, []);

  const handleFilterPress = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('MapFilter', {
      mode: mapMode,
      activityFilter,
      socialFilter,
      exploreFilter,
      eventsFilter,
      trainFilter,
    });
  }, [navigation, mapMode, activityFilter, socialFilter, exploreFilter, eventsFilter, trainFilter]);

  // Location button handler
  const handleLocationButtonPress = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    const pref = locationState.preference;

    if (pref === 'gps_active') {
      // Recenter map on user location
      // Pass fetched coords directly to avoid stale closure
      const coords = await fetchGPS();
      if (coords && mapRef.current) {
        recenterMap(mapRef as any, coords);
      }
    } else {
      // Show settings prompt (map_preferred or undecided)
      setShowSettingsPrompt(true);
    }
  }, [locationState.preference, fetchGPS, recenterMap]);

  // Settings prompt handlers
  const handleChangeSettings = useCallback(() => {
    setShowSettingsPrompt(false);
    Linking.openSettings();
  }, []);

  const handleMaybeLater = useCallback(() => {
    setShowSettingsPrompt(false);
  }, []);
  
  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.container}>
        {/* MAP - 90% of screen, edge-to-edge */}
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_DEFAULT}
          mapType="mutedStandard"
          region={region}
          onRegionChange={handleRegionChange}
          onRegionChangeComplete={updateRegion}
          onPress={handleMapPress}
          showsUserLocation={locationState.preference === 'gps_active'}
          showsMyLocationButton={false}
          showsCompass={false}
          showsPointsOfInterests={false}
          showsBuildings={false}
          showsTraffic={false}
          mapPadding={{
            top: insets.top + 56,
            bottom: FLOATING_TAB_BAR_HEIGHT + 20,
            left: 0,
            right: 0,
          }}
        >
          {/* Render clustered data - either individual courts or clusters */}
          {clusteredData.map((item) => {
            if (item.type === 'court') {
              return (
                <CourtPin
                  key={item.data.id}
                  court={item.data}
                  mode={mapMode}
                  isSelected={selectedCourt?.id === item.data.id}
                  onPress={() => handlePinPress(item.data)}
                />
              );
            } else {
              // It's a cluster - zoom in on press
              return (
                <ClusterPin
                  key={item.data.id}
                  cluster={item.data}
                  mode={mapMode}
                  onPress={() => {
                    // Calculate new zoomed-in region
                    const newRegion = {
                      latitude: item.data.latitude,
                      longitude: item.data.longitude,
                      latitudeDelta: liveRegion.latitudeDelta / 3,
                      longitudeDelta: liveRegion.longitudeDelta / 3,
                    };
                    // Update liveRegion IMMEDIATELY for instant re-clustering
                    setLiveRegion(newRegion);
                    // Then animate the map to match
                    mapRef.current?.animateToRegion(newRegion, 300);
                  }}
                />
              );
            }
          })}
        </MapView>
        
        {/* TOP CONTROLS - Search + Mode pills */}
        <View style={[styles.topControls, { top: insets.top + SPACING.TIGHT }]}>
          <View style={styles.searchBar}>
            <Search size={18} color={COLORS.NEUTRAL} />
            <TextInput
              placeholder="Search courts..."
              placeholderTextColor={COLORS.NEUTRAL}
              style={styles.searchInput}
              onPressIn={handleSearchPress}
            />
            <Pressable onPress={handleFilterPress} style={styles.filterButton}>
              <SlidersHorizontal size={18} color={COLORS.NEUTRAL} />
            </Pressable>
          </View>

          <View style={styles.modePillsRow}>
            <MapModeToggle mode={mapMode} onModeChange={setMapMode} />
          </View>
        </View>
        
        {/* LOCATION BUTTON - Bottom right, closer to tab bar */}
        <View 
          style={[
            styles.locationButtonContainer, 
            { bottom: 30 }
          ]}
        >
          <Pressable
            onPress={handleLocationButtonPress}
            style={styles.locationButton}
          >
            <Navigation size={22} color={COLORS.NEUTRAL} />
          </Pressable>
        </View>
        
        {/* COURT BOTTOM SHEET - V1 Locked Design */}
        <CourtBottomSheet
          court={selectedCourt}
          onClose={() => setSelectedCourt(null)}
        />

        {/* Settings prompt (AllTrails style) */}
        <SettingsPromptSheet
          visible={showSettingsPrompt}
          onChangeSettings={handleChangeSettings}
          onMaybeLater={handleMaybeLater}
        />
      </View>
    </GestureHandlerRootView>
  );
});

GravityMapScreen.displayName = 'GravityMapScreen';

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  
  // Top controls container
  topControls: {
    position: 'absolute',
    left: SPACING.DEFAULT,
    right: SPACING.DEFAULT,
    gap: SPACING.TIGHT,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingHorizontal: SPACING.DEFAULT,
    height: 44,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E7EB',
    gap: SPACING.TIGHT,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    padding: 0,
  },
  filterButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modePillsRow: {
    width: '100%',
    alignItems: 'flex-start',
  },
  
  // Location button - Bottom right
  locationButtonContainer: {
    position: 'absolute',
    right: SPACING.DEFAULT,
  },
  locationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E7EB',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
});
