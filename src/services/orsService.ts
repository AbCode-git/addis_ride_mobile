const ORS_API_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImJiY2RlYzgwNDE5ZjRkYTViMWFmODE5OTk5ODk5OTM5IiwiaCI6Im11cm11cjY0In0=";
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
    async getRoute(start: { lat: number; lng: number }, end: { lat: number; lng: number }): Promise<ORSResult> {
        try {
            const body = {
                coordinates: [
                    [start.lng, start.lat],
                    [end.lng, end.lat]
                ]
            };

            const response = await fetch(BASE_URL, {
                method: 'POST',
                headers: {
                    'Authorization': ORS_API_KEY,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
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
        } catch (error) {
            console.error('[ORSService] Fetch failed:', error);
            // Fallback to a rough calculation if ORS fails (optional, or just throw)
            throw error;
        }
    },
    /**
     * Searches for a location by name (Geocoding)
     * Bounds restricted to Addis Ababa
     */
    async geocode(query: string): Promise<{ name: string; lat: number; lng: number }[]> {
        if (!query || query.length < 3) return [];
        try {
            // Addis Ababa Bounding Box
            const bounds = `&boundary.rect.min_lon=38.65&boundary.rect.min_lat=8.85&boundary.rect.max_lon=38.95&boundary.rect.max_lat=9.10`;
            const url = `https://api.openrouteservice.org/geocode/search?api_key=${ORS_API_KEY}&text=${encodeURIComponent(query)}${bounds}&size=5`;

            const response = await fetch(url);
            if (!response.ok) return [];

            const data = await response.json();
            return data.features.map((f: any) => ({
                name: f.properties.label,
                lat: f.geometry.coordinates[1],
                lng: f.geometry.coordinates[0]
            }));
        } catch (error) {
            console.error('[ORSService] Geocode failed:', error);
            return [];
        }
    }
};
