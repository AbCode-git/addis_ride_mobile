import Constants from 'expo-constants';

// Get API key from environment variable
const ORS_API_KEY = Constants.expoConfig?.extra?.orsApiKey || '';

if (!ORS_API_KEY) {
    console.warn('⚠️ ORS API key not configured. Geocoding may fail.');
    console.warn('Make sure .env file exists with ORS_API_KEY variable');
}

const BASE_URL = "https://api.openrouteservice.org/v2/directions/driving-car";

export interface ORSResult {
    distanceKm: number;
    durationMin: number;
    polyline?: string;
}

export const ORSService = {
    /**
     * Fetches route data between two points
     * ORS expects coordinates as [longitude, latitude]
     */
    async getRoute(start: { lat: number; lng: number }, end: { lat: number; lng: number }, retries = 2): Promise<ORSResult> {
        try {
            const body = {
                coordinates: [
                    [start.lng, start.lat],
                    [end.lng, end.lat]
                ]
            };

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

            const response = await fetch(BASE_URL, {
                method: 'POST',
                headers: {
                    'Authorization': ORS_API_KEY,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body),
                signal: controller.signal as AbortSignal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                // If API rate limited or server error, standard fetch behavior
                if (retries > 0 && (response.status === 429 || response.status >= 500)) {
                    console.warn(`[ORSService] Request failed with ${response.status}, retrying... (${retries} attempts left)`);
                    await new Promise(res => setTimeout(res, 1000)); // Wait 1s before retry
                    return this.getRoute(start, end, retries - 1);
                }

                const errorText = await response.text();
                console.error(`[ORSService] API Error: ${response.status}`, errorText);
                throw new Error(`ORS API failed with status ${response.status}`);
            }

            const data = await response.json();
            const route = data.routes[0];
            const summary = route.summary;

            return {
                distanceKm: parseFloat((summary.distance / 1000).toFixed(1)),
                durationMin: Math.ceil(summary.duration / 60),
                polyline: route.geometry
            };
        } catch (error: any) {
            // Retry on network timeout/abort
            if (retries > 0 && (error.name === 'AbortError' || error.message?.includes('Network request failed'))) {
                console.warn(`[ORSService] Network error/timeout, retrying... (${retries} attempts left)`);
                return this.getRoute(start, end, retries - 1);
            }

            console.error('[ORSService] Fetch failed:', error);
            throw error;
        }
    },
    /**
     * Searches for a location by name (Geocoding)
     * Bounds restricted to Addis Ababa
     */
    async geocode(query: string, retries = 2): Promise<{ name: string; lat: number; lng: number }[]> {
        if (!query || query.length < 3) return [];
        try {
            // Addis Ababa Bounding Box
            const bounds = `&boundary.rect.min_lon=38.65&boundary.rect.min_lat=8.85&boundary.rect.max_lon=38.95&boundary.rect.max_lat=9.10`;
            const url = `https://api.openrouteservice.org/geocode/search?api_key=${ORS_API_KEY}&text=${encodeURIComponent(query)}${bounds}&size=5`;

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout for geocoding

            const response = await fetch(url, { signal: controller.signal as AbortSignal });
            clearTimeout(timeoutId);

            if (!response.ok) {
                if (retries > 0 && (response.status === 429 || response.status >= 500)) {
                    await new Promise(res => setTimeout(res, 800));
                    return this.geocode(query, retries - 1);
                }
                return [];
            }

            const data = await response.json();
            if (!data.features) return [];

            return data.features.map((f: any) => ({
                name: f.properties.label,
                lat: f.geometry.coordinates[1],
                lng: f.geometry.coordinates[0]
            }));
        } catch (error: any) {
            if (retries > 0 && (error.name === 'AbortError' || error.message?.includes('Network request failed'))) {
                return this.geocode(query, retries - 1);
            }
            console.error('[ORSService] Geocode failed:', error);
            return [];
        }
    }
};
