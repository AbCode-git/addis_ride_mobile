import React, { useEffect, useRef } from 'react';
import { View, Platform } from 'react-native';
import tw from 'twrnc';

// Only import leaflet on web
let L: any;
if (Platform.OS === 'web') {
    L = require('leaflet');
    require('leaflet/dist/leaflet.css');
}

interface InteractiveMapProps {
    start: { lat: number; lng: number };
    end: { lat: number; lng: number };
    polyline?: string;
}

/**
 * Decodes encoded polyline (Google format)
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

export const InteractiveMap: React.FC<InteractiveMapProps> = ({ start, end, polyline }) => {
    const mapRef = useRef<any>(null);
    const containerRef = useRef<any>(null);

    useEffect(() => {
        if (Platform.OS !== 'web' || !containerRef.current || !L) return;

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
                    color: '#818CF8', // Indigo
                    weight: 4,
                    opacity: 0.8,
                    lineJoin: 'round'
                }).addTo(map);

                // Fit bounds
                map.fitBounds(line.getBounds(), { padding: [30, 30] });
            }
        } else {
            // Just fit to markers
            const bounds = L.latLngBounds([
                [start.lat, start.lng],
                [end.lat, end.lng]
            ]);
            map.fitBounds(bounds, { padding: [50, 50] });
        }

        // Add Drivers Simulation
        const drivers: any[] = [];
        const carIcon = L.divIcon({
            className: 'car-icon',
            html: `<div style="transform: rotate(${Math.random() * 360}deg);">🚕</div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });

        // Spawn 4 drivers near the start point
        for (let i = 0; i < 4; i++) {
            const lat = start.lat + (Math.random() * 0.01 - 0.005);
            const lng = start.lng + (Math.random() * 0.01 - 0.005);
            const marker = L.marker([lat, lng], { icon: carIcon }).addTo(map);
            drivers.push(marker);
        }

        // Animate drivers
        const interval = setInterval(() => {
            drivers.forEach(d => {
                const pos = d.getLatLng();
                d.setLatLng([
                    pos.lat + (Math.random() * 0.0004 - 0.0002),
                    pos.lng + (Math.random() * 0.0004 - 0.0002)
                ]);
            });
        }, 3000);

        return () => {
            clearInterval(interval);
            // Properly cleanup map instance to prevent memory leaks
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [start, end, polyline]);

    if (Platform.OS !== 'web') {
        return (
            <View style={tw`w-full h-96 bg-zinc-800 rounded-3xl items-center justify-center`}>
                {/* Fallback for native */}
            </View>
        );
    }

    return (
        <View
            ref={containerRef}
            style={tw`w-full h-96 bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl`}
        />
    );
};
