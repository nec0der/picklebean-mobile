/**
 * MapWithLocation - Reusable map wrapper with location functionality
 * Requests permission on mount, provides location button
 */

import { memo, useState, useEffect, useCallback, forwardRef, ReactNode } from 'react';
import { View, Pressable, StyleSheet, AppState } from 'react-native';
import type { AppStateStatus } from 'react-native';
import MapView, { Region } from 'react-native-maps';
import { Navigation } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useLocationPreference } from '@/hooks/common/useLocationPreference';
import { useLocation } from '@/hooks/common/useLocation';
import { requestLocationWithOutcome, checkLocationPermission } from '@/lib/location';
import { SettingsPromptSheet } from './SettingsPromptSheet';
import { Linking } from 'react-native';

interface MapWithLocationProps {
  children?: ReactNode;
  region: Region;
  onRegionChangeComplete: (region: Region) => void;
  onPress?: () => void;
  showsUserLocation?: boolean;
  showsMyLocationButton?: boolean;
  toolbarEnabled?: boolean;
}

export const MapWithLocation = memo(forwardRef<MapView, MapWithLocationProps>(
  ({ children, region, onRegionChangeComplete, onPress, ...mapProps }, ref) => {
    const [showSettingsPrompt, setShowSettingsPrompt] = useState(false);
    
    const {
      state: locationState,
      setPreference,
      loading: prefLoading,
    } = useLocationPreference();

    // Map center as location coords
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
          // Check current permission status
          const current = await checkLocationPermission();
          
          if (current) {
            // Already granted
            await setPreference('gps_active');
            return;
          }
          
          // If undecided, request permission
          if (locationState.preference === 'undecided') {
            const result = await requestLocationWithOutcome();
            
            if (result.granted) {
              await setPreference('gps_active');
              await fetchGPS();
            } else if (result.denied) {
              await setPreference('map_preferred');
            }
            // If canceled, stays undecided (will ask again next visit)
          }
        } catch (error) {
          console.error('Error requesting initial permission:', error);
        }
      };

      requestInitialPermission();
    }, []); // Only on mount

    // Listen for app state changes (returning from Settings)
    useEffect(() => {
      const recheckPermission = async (nextAppState: AppStateStatus) => {
        if (nextAppState === 'active') {
          // App came to foreground - re-check permission
          try {
            const current = await checkLocationPermission();
            if (current && locationState.preference !== 'gps_active') {
              // Permission was granted in Settings - update immediately
              await setPreference('gps_active');
            } else if (!current && locationState.preference === 'gps_active') {
              // Permission was revoked in Settings - update immediately
              await setPreference('map_preferred');
            }
          } catch (error) {
            console.error('Error rechecking permission:', error);
          }
        }
      };

      const subscription = AppState.addEventListener('change', recheckPermission);

      return () => {
        subscription.remove();
      };
    }, [locationState.preference, setPreference]);

    // Location button handler
    const handleLocationButtonPress = useCallback(async () => {
      // Haptic feedback - medium impact for responsive feel
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      const pref = locationState.preference;

      if (pref === 'gps_active') {
        // Recenter map on user location
        await fetchGPS();
        if (ref && typeof ref !== 'function' && ref.current) {
          recenterMap(ref as any);
        }
      } else {
        // Show settings prompt (map_preferred or undecided)
        setShowSettingsPrompt(true);
      }
    }, [locationState.preference, fetchGPS, recenterMap, ref]);

    // Settings prompt handlers
    const handleChangeSettings = useCallback(() => {
      setShowSettingsPrompt(false);
      // Open iOS Settings > App > Location
      Linking.openSettings();
    }, []);

    const handleMaybeLater = useCallback(() => {
      setShowSettingsPrompt(false);
      // Just dismiss, continue using map
    }, []);

    return (
      <View style={styles.container}>
        {/* Map */}
        <MapView
          ref={ref}
          style={styles.map}
          region={region}
          onRegionChangeComplete={onRegionChangeComplete}
          onPress={onPress}
          showsUserLocation={locationState.preference === 'gps_active'}
          showsMyLocationButton={false}
          toolbarEnabled={false}
          showsCompass={true}
          {...mapProps}
        >
          {children}
        </MapView>

        {/* Location button - Always blue with Navigation icon */}
        <View style={styles.locationButtonContainer}>
          <Pressable
            onPress={handleLocationButtonPress}
            className="items-center justify-center bg-blue-600 rounded-full shadow-lg w-14 h-14 active:bg-blue-700"
          >
            <Navigation size={24} color="#ffffff" />
          </Pressable>
        </View>

        {/* Settings prompt (AllTrails style) */}
        <SettingsPromptSheet
          visible={showSettingsPrompt}
          onChangeSettings={handleChangeSettings}
          onMaybeLater={handleMaybeLater}
        />
      </View>
    );
  }
));

MapWithLocation.displayName = 'MapWithLocation';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  locationButtonContainer: {
    position: 'absolute',
    bottom: 24,
    right: 16,
  },
});
