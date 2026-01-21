import { STATIC_LOCATIONS } from "../data/locations";
import { ORSService } from "./orsService";

interface Coordinates {
    lat: number;
    lng: number;
}

export interface RouteResult {
    distanceKm: number;
    durationMin: number;
    origin: string;
    destination: string;
    startCoord: Coordinates;
    endCoord: Coordinates;
    polyline?: string;
}

const CACHE: Record<string, { data: RouteResult; timestamp: number }> = {};
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 Hours

/**
 * Finds coordinates for a location name
 */
function findCoordinates(name: string): Coordinates | null {
    const lower = name.toLowerCase().trim();
    // exact match
    const exact = STATIC_LOCATIONS.find(l => l.name.toLowerCase() === lower);
    if (exact) return { lat: exact.lat, lng: exact.lng };

    // approx match
    const approx = STATIC_LOCATIONS.find(l => {
        const n = l.name.toLowerCase();
        return n.includes(lower) || lower.includes(n) || l.keywords?.some(k => lower.includes(k));
    });

    if (approx) return { lat: approx.lat, lng: approx.lng };
    return null;
}

export async function getRouteEstimate(
    from: string,
    to: string,
    fromCoord?: Coordinates,
    toCoord?: Coordinates
): Promise<RouteResult> {
    const fromLower = from.toLowerCase().trim();
    const toLower = to.toLowerCase().trim();
    const cacheKey = `${fromLower}_${toLower}_${fromCoord ? 'custom' : 'static'}`;

    // 1. Check Cache
    const cached = CACHE[cacheKey];
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
        console.log(`[Router] Cache Hit for: ${cacheKey}`);
        return cached.data;
    }

    // Coordinates look-up
    // Priority: Passed coords -> Static lookup -> Default
    let p1 = fromCoord || findCoordinates(from) || { lat: 9.010, lng: 38.745 }; // Default Mexico
    let p2 = toCoord || findCoordinates(to) || { lat: 8.995, lng: 38.790 };   // Default Bole

    // Actual API Call
    console.log(`[Router] Fetching live data from ORS for: ${from} -> ${to}`);
    const orsData = await ORSService.getRoute(p1, p2);

    const result: RouteResult = {
        distanceKm: orsData.distanceKm,
        durationMin: orsData.durationMin,
        origin: from,
        destination: to,
        startCoord: p1,
        endCoord: p2,
        polyline: orsData.polyline
    };

    // 2. Save to Cache
    CACHE[cacheKey] = {
        data: result,
        timestamp: Date.now()
    };

    return result;
}
