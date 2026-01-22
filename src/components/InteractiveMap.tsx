import React, { useEffect, useRef } from 'react';
import { View, Platform, StyleSheet } from 'react-native';
import tw from 'twrnc';

// Conditional imports
let MapView: any, Marker: any, Polyline: any, PROVIDER_GOOGLE: any;
let L: any;

if (Platform.OS !== 'web') {
    // Native: Use react-native-maps
    const maps = require('react-native-maps');
    MapView = maps.default;
    Marker = maps.Marker;
    Polyline = maps.Polyline;
    PROVIDER_GOOGLE = maps.PROVIDER_GOOGLE;
} else {
    // Web: Use Leaflet
    L = require('leaflet');
    require('leaflet/dist/leaflet.css');
}

interface InteractiveMapProps {
    start: { lat: number; lng: number };
    end: { lat: number; lng: number };
    polyline?: string;
}

/**
 * Decodes encoded polyline (Google format) for Leaflet
 */
function decodePolyline(encoded: string) {
    if (!encoded) return [];
    let points = [];
    let index = 0, len = encoded.length;
    let lat = 0, lng = 0;
    while (index < len) {
        let b, shift = 0, result = 0;
        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        let dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
        lat += dlat;
        shift = 0; result = 0;
        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        let dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
        lng += dlng;
        points.push([lat / 1e5, lng / 1e5]);
    }
    return points;
}

/**
 * Decodes polyline for react-native-maps format
 */
function decodePolylineToCoords(encoded: string): { latitude: number; longitude: number }[] {
    const points = decodePolyline(encoded);
    return points.map(p => ({ latitude: p[0], longitude: p[1] }));
}

// NATIVE MAP COMPONENT (Android/iOS)
const NativeMap: React.FC<InteractiveMapProps> = ({ start, end, polyline }) => {
    const mapRef = useRef<any>(null);
    const routeCoords = polyline ? decodePolylineToCoords(polyline) : [];

    useEffect(() => {
        // Fit to route or markers after map loads
        if (mapRef.current) {
            const coordinates = routeCoords.length > 0
                ? routeCoords
                : [
                    { latitude: start.lat, longitude: start.lng },
                    { latitude: end.lat, longitude: end.lng }
                ];

            setTimeout(() => {
                mapRef.current?.fitToCoordinates(coordinates, {
                    edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                    animated: true,
                });
            }, 500);
        }
    }, [start, end, polyline]);

    return (
        <MapView
            ref={mapRef}
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            initialRegion={{
                latitude: (start.lat + end.lat) / 2,
                longitude: (start.lng + end.lng) / 2,
                latitudeDelta: 0.1,
                longitudeDelta: 0.1,
            }}
            customMapStyle={darkMapStyle}
        >
            {/* Start Marker */}
            <Marker
                coordinate={{ latitude: start.lat, longitude: start.lng }}
                pinColor="#818CF8"
                title="Pickup"
            />

            {/* End Marker */}
            <Marker
                coordinate={{ latitude: end.lat, longitude: end.lng }}
                pinColor="#FB7185"
                title="Dropoff"
            />

            {/* Route Polyline */}
            {routeCoords.length > 0 && (
                <Polyline
                    coordinates={routeCoords}
                    strokeColor="#818CF8"
                    strokeWidth={4}
                />
            )}
        </MapView>
    );
};

// WEB MAP COMPONENT (Leaflet)
const WebMap: React.FC<InteractiveMapProps> = ({ start, end, polyline }) => {
    const mapRef = useRef<any>(null);
    const containerRef = useRef<any>(null);

    useEffect(() => {
        if (!containerRef.current || !L) return;

        // Initialize map if not already done
        if (!mapRef.current) {
            mapRef.current = L.map(containerRef.current, {
                zoomControl: false,
                attributionControl: false
            }).setView([start.lat, start.lng], 13);

            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                maxZoom: 19,
            }).addTo(mapRef.current);
        }

        const map = mapRef.current;

        // Clear existing markers/lines
        map.eachLayer((layer: any) => {
            if (layer instanceof L.Marker || layer instanceof L.Polyline) {
                map.removeLayer(layer);
            }
        });

        // Add Markers
        const startIcon = L.divIcon({
            className: 'custom-div-icon',
            html: `<div style="background-color: #818CF8; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
            iconSize: [12, 12],
            iconAnchor: [6, 6]
        });

        const endIcon = L.divIcon({
            className: 'custom-div-icon',
            html: `<div style="background-color: #FB7185; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
            iconSize: [12, 12],
            iconAnchor: [6, 6]
        });

        L.marker([start.lat, start.lng], { icon: startIcon }).addTo(map);
        L.marker([end.lat, end.lng], { icon: endIcon }).addTo(map);

        // Add Polyline
        if (polyline) {
            const path = decodePolyline(polyline);
            if (path.length > 0) {
                const line = L.polyline(path, {
                    color: '#818CF8',
                    weight: 4,
                    opacity: 0.8,
                    lineJoin: 'round'
                }).addTo(map);

                map.fitBounds(line.getBounds(), { padding: [30, 30] });
            }
        } else {
            const bounds = L.latLngBounds([
                [start.lat, start.lng],
                [end.lat, end.lng]
            ]);
            map.fitBounds(bounds, { padding: [50, 50] });
        }

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [start, end, polyline]);

    return (
        <View
            ref={containerRef}
            style={tw`w-full h-96 bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl`}
        />
    );
};

// MAIN COMPONENT - Platform Switch
export const InteractiveMap: React.FC<InteractiveMapProps> = (props) => {
    if (Platform.OS === 'web') {
        return <WebMap {...props} />;
    }
    return <NativeMap {...props} />;
};

const styles = StyleSheet.create({
    map: {
        width: '100%',
        height: 384, // h-96 equivalent
        borderRadius: 24,
        overflow: 'hidden',
    }
});

// Dark map style for Google Maps (native)
const darkMapStyle = [
    { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
    {
        featureType: 'administrative.locality',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#d59563' }]
    },
    {
        featureType: 'poi',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#d59563' }]
    },
    {
        featureType: 'poi.park',
        elementType: 'geometry',
        stylers: [{ color: '#263c3f' }]
    },
    {
        featureType: 'poi.park',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#6b9a76' }]
    },
    {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [{ color: '#38414e' }]
    },
    {
        featureType: 'road',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#212a37' }]
    },
    {
        featureType: 'road',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#9ca5b3' }]
    },
    {
        featureType: 'road.highway',
        elementType: 'geometry',
        stylers: [{ color: '#746855' }]
    },
    {
        featureType: 'road.highway',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#1f2835' }]
    },
    {
        featureType: 'road.highway',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#f3d19c' }]
    },
    {
        featureType: 'transit',
        elementType: 'geometry',
        stylers: [{ color: '#2f3948' }]
    },
    {
        featureType: 'transit.station',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#d59563' }]
    },
    {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{ color: '#17263c' }]
    },
    {
        featureType: 'water',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#515c6d' }]
    },
    {
        featureType: 'water',
        elementType: 'labels.text.stroke',
        stylers: [{ color: '#17263c' }]
    }
];
