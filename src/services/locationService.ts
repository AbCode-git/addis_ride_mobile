// Future Location Service
// Use this when you're ready to add "Use My Location" feature

import * as Location from 'expo-location';

export const LocationService = {
    /**
     * Request location permissions from the user
     * @returns {Promise<boolean>} true if granted, false if denied
     */
    async requestPermissions(): Promise<boolean> {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            return status === 'granted';
        } catch (error) {
            console.error('Error requesting location permissions:', error);
            return false;
        }
    },

    /**
     * Get the user's current location
     * @returns {Promise<{latitude: number, longitude: number} | null>}
     */
    async getCurrentLocation(): Promise<{ latitude: number; longitude: number } | null> {
        try {
            const hasPermission = await this.requestPermissions();
            if (!hasPermission) {
                return null;
            }

            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });

            return {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            };
        } catch (error) {
            console.error('Error getting current location:', error);
            return null;
        }
    },

    /**
     * Reverse geocode: Convert coordinates to address
     * @param latitude 
     * @param longitude 
     * @returns {Promise<string | null>} Location name/address
     */
    async reverseGeocode(latitude: number, longitude: number): Promise<string | null> {
        try {
            const results = await Location.reverseGeocodeAsync({ latitude, longitude });
            if (results.length > 0) {
                const { street, city, region, country } = results[0];
                return `${street || ''}, ${city || ''}, ${region || ''}, ${country || ''}`.replace(/^,\s*/, '');
            }
            return null;
        } catch (error) {
            console.error('Error reverse geocoding:', error);
            return null;
        }
    }
};

// Example usage in HomeScreen:
/*
import { LocationService } from '../services/locationService';

// Add a "Use My Location" button
<TouchableOpacity onPress={async () => {
  const location = await LocationService.getCurrentLocation();
  if (location) {
    const address = await LocationService.reverseGeocode(location.latitude, location.longitude);
    setPickup(address || 'Current Location');
    setPickupCoord({ lat: location.latitude, lng: location.longitude });
  } else {
    Alert.alert('Location Error', 'Unable to get your location. Please enable location services.');
  }
}}>
  <Text>📍 Use My Location</Text>
</TouchableOpacity>
*/
