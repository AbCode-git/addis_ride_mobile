import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
    FAVORITES: 'addis_ride_favorites',
    SETTINGS: 'addis_ride_settings',
    RECENT_SEARCHES: 'addis_ride_recents',
};

export const StorageService = {
    // Favorites
    saveFavorites: async (favorites: any[]) => {
        try {
            await AsyncStorage.setItem(KEYS.FAVORITES, JSON.stringify(favorites));
        } catch (error) {
            console.error('Error saving favorites:', error);
        }
    },

    loadFavorites: async () => {
        try {
            const data = await AsyncStorage.getItem(KEYS.FAVORITES);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error loading favorites:', error);
            return [];
        }
    },

    // Settings (for calibration later)
    saveSettings: async (settings: any) => {
        try {
            await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    },

    loadSettings: async () => {
        try {
            const data = await AsyncStorage.getItem(KEYS.SETTINGS);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error loading settings:', error);
            return null;
        }
    },

    // Recent Searches
    saveRecentSearch: async (pickup: string, dropoff: string) => {
        try {
            const data = await AsyncStorage.getItem(KEYS.RECENT_SEARCHES);
            let recents = data ? JSON.parse(data) : [];

            // Remove duplication and keep last 5
            const newSearch = { id: Date.now().toString(), pickup, dropoff };
            recents = [newSearch, ...recents.filter((r: any) =>
                !(r.pickup === pickup && r.dropoff === dropoff)
            )].slice(0, 5);

            await AsyncStorage.setItem(KEYS.RECENT_SEARCHES, JSON.stringify(recents));
            return recents;
        } catch (error) {
            console.error('Error saving recent search:', error);
            return [];
        }
    },

    loadRecentSearches: async () => {
        try {
            const data = await AsyncStorage.getItem(KEYS.RECENT_SEARCHES);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error loading recent searches:', error);
            return [];
        }
    },
};
