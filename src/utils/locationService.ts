/**
 * Continuous Background Location Tracking Service
 * 
 * Requirements:
 * - Runs continuously for 5-6 days without interruption
 * - Works when app is minimized or device is locked
 * - Survives OS restrictions and battery optimization
 */

import Geolocation from 'react-native-geolocation-service';
import BackgroundService from 'react-native-background-actions';
import { Platform, PermissionsAndroid, Alert, Linking, AppState } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { getCurrentUser } from './firebaseConfig';

export interface LocationData {
  latitude: number;
  longitude: number;
  altitude: number | null;
  accuracy: number;
  speed: number | null;
  heading: number | null;
  timestamp: number;
}

interface LocationUpdate {
  uid: string;
  location: LocationData;
  updatedAt: any; // Firestore Timestamp
  deviceInfo: {
    platform: string;
    battery?: number;
    isBackground: boolean;
  };
}

// Configuration
const LOCATION_TASK_NAME = 'Location Tracking';
const LOCATION_TASK_DESC = 'Tracking your location in the background';
const UPDATE_INTERVAL = 30000; // 30 seconds (adjust as needed)
const MIN_DISTANCE_FILTER = 10; // Minimum 10 meters between updates

// Global state
let isTracking = false;
let locationWatchId: number | null = null;

/**
 * Request location permissions for Android
 */
export const requestLocationPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'ios') {
    // iOS permissions are handled differently
    const auth = await Geolocation.requestAuthorization('always');
    return auth === 'granted';
  }

  try {
    // Android 10+ requires background location permission
    if (typeof Platform.Version === 'number' && Platform.Version >= 29) {
      const backgroundGranted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION
      );

      if (!backgroundGranted) {
        Alert.alert(
          'Background Location Permission',
          'This app needs access to your location in the background to track your position continuously. Please select "Allow all the time" in the next screen.',
          [
            {
              text: 'OK',
              onPress: async () => {
                const result = await PermissionsAndroid.request(
                  PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
                  {
                    title: 'Background Location Permission',
                    message: 'Allow location access all the time for continuous tracking',
                    buttonPositive: 'Allow',
                  }
                );
                return result === PermissionsAndroid.RESULTS.GRANTED;
              },
            },
          ]
        );
      }
    }

    // Request fine location permission
    const fineLocationGranted = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );

    if (!fineLocationGranted) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'This app needs access to your location',
          buttonPositive: 'Allow',
        }
      );

      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        return false;
      }
    }

    return true;
  } catch (err) {
    console.error('Error requesting location permission:', err);
    return false;
  }
};

/**
 * Save location to Firestore
 */
const saveLocationToFirestore = async (location: LocationData): Promise<void> => {
  try {
    const user = getCurrentUser();
    if (!user) {
      console.log('No user logged in, skipping location save');
      return;
    }

    const locationUpdate: LocationUpdate = {
      uid: user.uid,
      location,
      updatedAt: firestore.FieldValue.serverTimestamp(),
      deviceInfo: {
        platform: Platform.OS,
        isBackground: AppState.currentState !== 'active',
      },
    };

    // Save to user's current location
    await firestore()
      .collection('users')
      .doc(user.uid)
      .update({
        currentLocation: location,
        lastLocationUpdate: firestore.FieldValue.serverTimestamp(),
      });

    // Save to location history (for tracking over time)
    await firestore()
      .collection('locationHistory')
      .add(locationUpdate);

    console.log('Location saved to Firestore:', {
      lat: location.latitude,
      lng: location.longitude,
      accuracy: location.accuracy,
    });
  } catch (error) {
    console.error('Error saving location to Firestore:', error);
  }
};

/**
 * Background task that runs continuously
 */
const backgroundLocationTask = async (taskDataArguments: any) => {
  const { delay } = taskDataArguments;

  await new Promise(async (resolve) => {
    // This loop runs indefinitely
    while (BackgroundService.isRunning()) {
      try {
        // Get current location
        Geolocation.getCurrentPosition(
          async (position) => {
            const locationData: LocationData = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              altitude: position.coords.altitude,
              accuracy: position.coords.accuracy,
              speed: position.coords.speed,
              heading: position.coords.heading,
              timestamp: position.timestamp,
            };

            // Save to Firestore
            await saveLocationToFirestore(locationData);

            // Update notification (Android)
            if (Platform.OS === 'android') {
              await BackgroundService.updateNotification({
                taskTitle: LOCATION_TASK_NAME,
                taskDesc: `Last update: ${new Date().toLocaleTimeString()}`,
                progressBar: {
                  max: 100,
                  value: Math.floor(Math.random() * 100), // Just for visual feedback
                },
              });
            }
          },
          (error) => {
            console.error('Location error:', error);
          },
          {
            accuracy: {
              android: 'high',
              ios: 'bestForNavigation',
            },
            enableHighAccuracy: true,
            distanceFilter: MIN_DISTANCE_FILTER,
            forceRequestLocation: true,
            showLocationDialog: true,
            timeout: 15000,
            maximumAge: 10000,
          }
        );

        // Wait before next update
        await new Promise<void>((resolve) => setTimeout(() => resolve(), delay));
      } catch (error) {
        console.error('Background task error:', error);
        await new Promise<void>((resolve) => setTimeout(() => resolve(), delay));
      }
    }
  });
};

/**
 * Start continuous location tracking
 */
export const startLocationTracking = async (): Promise<boolean> => {
  try {
    // Check if already tracking
    if (isTracking) {
      console.log('Location tracking already active');
      return true;
    }

    // Request permissions
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      Alert.alert(
        'Permission Required',
        'Location permission is required for tracking. Please enable it in settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ]
      );
      return false;
    }

    // Configure background service options
    const options = {
      taskName: LOCATION_TASK_NAME,
      taskTitle: LOCATION_TASK_NAME,
      taskDesc: LOCATION_TASK_DESC,
      taskIcon: {
        name: 'ic_launcher',
        type: 'mipmap',
      },
      color: '#0b74de',
      linkingURI: 'videocalling://location',
      parameters: {
        delay: UPDATE_INTERVAL,
      },
    };

    // Start background service
    await BackgroundService.start(backgroundLocationTask, options);
    isTracking = true;

    console.log('✅ Location tracking started successfully');
    return true;
  } catch (error) {
    console.error('Error starting location tracking:', error);
    Alert.alert('Error', 'Failed to start location tracking. Please try again.');
    return false;
  }
};

/**
 * Stop location tracking
 */
export const stopLocationTracking = async (): Promise<void> => {
  try {
    if (!isTracking) {
      console.log('Location tracking is not active');
      return;
    }

    // Stop background service
    await BackgroundService.stop();
    
    // Stop location watch if active
    if (locationWatchId !== null) {
      Geolocation.clearWatch(locationWatchId);
      locationWatchId = null;
    }

    isTracking = false;
    console.log('✅ Location tracking stopped');
  } catch (error) {
    console.error('Error stopping location tracking:', error);
  }
};

/**
 * Check if location tracking is currently active
 */
export const isLocationTrackingActive = (): boolean => {
  return isTracking && BackgroundService.isRunning();
};

/**
 * Get current location once (not continuous)
 */
export const getCurrentLocation = (): Promise<LocationData> => {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          altitude: position.coords.altitude,
          accuracy: position.coords.accuracy,
          speed: position.coords.speed,
          heading: position.coords.heading,
          timestamp: position.timestamp,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );
  });
};

/**
 * Subscribe to location updates from Firestore for a specific user
 */
export const subscribeToUserLocation = (
  userId: string,
  onUpdate: (location: LocationData | null) => void
) => {
  return firestore()
    .collection('users')
    .doc(userId)
    .onSnapshot(
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          const location = data?.currentLocation;
          onUpdate(location || null);
        } else {
          onUpdate(null);
        }
      },
      (error) => {
        console.error('Error subscribing to user location:', error);
        onUpdate(null);
      }
    );
};

/**
 * Get location history for a user
 */
export const getLocationHistory = async (
  userId: string,
  limit: number = 100
): Promise<LocationUpdate[]> => {
  try {
    const snapshot = await firestore()
      .collection('locationHistory')
      .where('uid', '==', userId)
      .orderBy('updatedAt', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map((doc) => doc.data() as LocationUpdate);
  } catch (error) {
    console.error('Error fetching location history:', error);
    return [];
  }
};

/**
 * Clear old location history (cleanup function)
 * Call this periodically to prevent database bloat
 */
export const clearOldLocationHistory = async (daysToKeep: number = 7): Promise<void> => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const user = getCurrentUser();
    if (!user) return;

    const snapshot = await firestore()
      .collection('locationHistory')
      .where('uid', '==', user.uid)
      .where('updatedAt', '<', firestore.Timestamp.fromDate(cutoffDate))
      .get();

    const batch = firestore().batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`Cleared ${snapshot.size} old location records`);
  } catch (error) {
    console.error('Error clearing old location history:', error);
  }
};

export default {
  startLocationTracking,
  stopLocationTracking,
  isLocationTrackingActive,
  getCurrentLocation,
  requestLocationPermission,
  subscribeToUserLocation,
  getLocationHistory,
  clearOldLocationHistory,
};

