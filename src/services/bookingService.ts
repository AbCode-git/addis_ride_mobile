import { Linking, Platform } from 'react-native';

const APP_LINKS: Record<string, { app: string; webState: string; webStore: string }> = {
    'p1': { // RIDE
        app: 'ride://',
        webState: 'https://ride.et',
        webStore: Platform.OS === 'ios' ? 'https://apps.apple.com/app/ride-passenger-et/id1116499683' : 'https://play.google.com/store/apps/details?id=com.ride.passenger'
    },
    'p2': { // Yango
        app: 'yango://',
        webState: 'https://yango.com',
        webStore: Platform.OS === 'ios' ? 'https://apps.apple.com/app/yango-taxi/id1437157284' : 'https://play.google.com/store/apps/details?id=com.yandex.yango'
    },
    'p3': { // Feres
        app: 'feres://',
        webState: 'https://feres.et',
        webStore: Platform.OS === 'ios' ? 'https://apps.apple.com/app/feres-ethiopia/id1527339790' : 'https://play.google.com/store/apps/details?id=com.feres.passenger'
    },
};

export const BookingService = {
    openProvider: async (providerId: string) => {
        const links = APP_LINKS[providerId];
        if (!links) return;

        try {
            const supported = await Linking.canOpenURL(links.app);
            if (supported) {
                await Linking.openURL(links.app);
            } else {
                // Fallback to Web or Store
                await Linking.openURL(links.webStore);
            }
        } catch (error) {
            console.error('Error opening provider app:', error);
            // Last resort fallback
            Linking.openURL(links.webState);
        }
    }
};
