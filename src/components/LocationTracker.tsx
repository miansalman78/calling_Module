/**
 * Location Tracker Component
 * 
 * UI for controlling continuous background location tracking
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
  Platform,
  ScrollView,
} from 'react-native';
import {
  startLocationTracking,
  stopLocationTracking,
  isLocationTrackingActive,
  getCurrentLocation,
  type LocationData,
} from '../utils/locationService';

interface LocationTrackerProps {
  userId?: string;
}

export const LocationTracker: React.FC<LocationTrackerProps> = ({ userId }) => {
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if tracking is already active
    setIsTracking(isLocationTrackingActive());
  }, []);

  const handleToggleTracking = async () => {
    if (loading) return;

    setLoading(true);

    try {
      if (isTracking) {
        // Stop tracking
        await stopLocationTracking();
        setIsTracking(false);
        Alert.alert('Success', 'Location tracking stopped');
      } else {
        // Start tracking
        const started = await startLocationTracking();
        if (started) {
          setIsTracking(true);
          setLastUpdate(new Date());
          Alert.alert(
            'Success',
            'Location tracking started. Your location will be tracked continuously in the background.'
          );
        }
      }
    } catch (error) {
      console.error('Error toggling tracking:', error);
      Alert.alert('Error', 'Failed to toggle location tracking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGetCurrentLocation = async () => {
    setLoading(true);
    try {
      const location = await getCurrentLocation();
      setCurrentLocation(location);
      setLastUpdate(new Date());
      Alert.alert(
        'Location Retrieved',
        `Lat: ${location.latitude.toFixed(6)}\nLng: ${location.longitude.toFixed(6)}\nAccuracy: ${location.accuracy.toFixed(2)}m`
      );
    } catch (error: any) {
      Alert.alert('Error', `Failed to get location: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestBatteryOptimization = () => {
    if (Platform.OS === 'android') {
      Alert.alert(
        'Battery Optimization',
        'For continuous location tracking, please disable battery optimization for this app.\n\nThis ensures the app can track your location for extended periods (5-6 days) without being killed by the system.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Open Settings',
            onPress: () => {
              // Open battery optimization settings
              Linking.openSettings();
            },
          },
        ]
      );
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Never';
    return date.toLocaleString();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>📍 Location Tracking</Text>
        <Text style={styles.subtitle}>
          Continuous background location tracking for 5-6 days
        </Text>

        {/* Tracking Status */}
        <View style={styles.statusContainer}>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Tracking Status:</Text>
            <View style={[styles.statusBadge, isTracking ? styles.statusActive : styles.statusInactive]}>
              <Text style={styles.statusText}>
                {isTracking ? '🟢 Active' : '⚪ Inactive'}
              </Text>
            </View>
          </View>

          {lastUpdate && (
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Last Update:</Text>
              <Text style={styles.statusValue}>{formatDate(lastUpdate)}</Text>
            </View>
          )}

          {currentLocation && (
            <>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Latitude:</Text>
                <Text style={styles.statusValue}>
                  {currentLocation.latitude.toFixed(6)}
                </Text>
              </View>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Longitude:</Text>
                <Text style={styles.statusValue}>
                  {currentLocation.longitude.toFixed(6)}
                </Text>
              </View>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Accuracy:</Text>
                <Text style={styles.statusValue}>
                  {currentLocation.accuracy.toFixed(2)}m
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Main Toggle */}
        <View style={styles.toggleContainer}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleLabel}>Background Tracking</Text>
              <Text style={styles.toggleDescription}>
                {isTracking
                  ? 'Tracking your location continuously'
                  : 'Start continuous location tracking'}
              </Text>
            </View>
            <Switch
              value={isTracking}
              onValueChange={handleToggleTracking}
              disabled={loading}
              trackColor={{ false: '#ccc', true: '#4caf50' }}
              thumbColor={isTracking ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={handleGetCurrentLocation}
            disabled={loading}
          >
            <Text style={styles.buttonText}>📍 Get Current Location</Text>
          </TouchableOpacity>

          {Platform.OS === 'android' && (
            <TouchableOpacity
              style={[styles.button, styles.buttonWarning]}
              onPress={handleRequestBatteryOptimization}
            >
              <Text style={styles.buttonText}>🔋 Battery Settings</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Information */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>ℹ️ Important Information</Text>
          <Text style={styles.infoText}>
            • Location updates every 30 seconds{'\n'}
            • Runs continuously for 5-6 days{'\n'}
            • Works when app is minimized or locked{'\n'}
            • Uses GPS for high accuracy{'\n'}
            • Battery optimization must be disabled{'\n'}
            • Location data saved to Firestore
          </Text>
        </View>

        {/* Android Battery Warning */}
        {Platform.OS === 'android' && (
          <View style={styles.warningContainer}>
            <Text style={styles.warningTitle}>⚠️ Android Battery Optimization</Text>
            <Text style={styles.warningText}>
              For uninterrupted tracking, please disable battery optimization:
              {'\n\n'}
              1. Go to Settings → Apps → videocalling{'\n'}
              2. Tap "Battery"{'\n'}
              3. Select "Unrestricted" or "Don't optimize"{'\n'}
              {'\n'}
              This allows the app to run continuously in the background.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  card: {
    margin: 16,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  statusContainer: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  statusValue: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusActive: {
    backgroundColor: '#e8f5e9',
  },
  statusInactive: {
    backgroundColor: '#f5f5f5',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  toggleContainer: {
    marginBottom: 24,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleInfo: {
    flex: 1,
    marginRight: 16,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  toggleDescription: {
    fontSize: 13,
    color: '#666',
  },
  buttonContainer: {
    gap: 12,
    marginBottom: 24,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: '#0b74de',
  },
  buttonWarning: {
    backgroundColor: '#ff9800',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoContainer: {
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0b74de',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#333',
    lineHeight: 20,
  },
  warningContainer: {
    backgroundColor: '#fff3e0',
    padding: 16,
    borderRadius: 12,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f57c00',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 13,
    color: '#333',
    lineHeight: 20,
  },
});

export default LocationTracker;

