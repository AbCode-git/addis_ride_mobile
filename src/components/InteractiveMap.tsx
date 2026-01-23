import React, { useEffect, useRef } from 'react';
import { View, Platform, StyleSheet } from 'react-native';
import tw from 'twrnc';

// Only import webview on native
let WebView: any;
if (Platform.OS !== 'web') {
    WebView = require('react-native-webview').WebView;
}

// Leaflet only for web
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

// NATIVE MAP COMPONENT (WebView + Leaflet)
const NativeMap: React.FC<InteractiveMapProps> = ({ start, end, polyline }) => {
    const leafletHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
          <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
          <style>
            body { margin: 0; padding: 0; background: #000; }
            #map { height: 100vh; width: 100vw; background: #000; }
            .custom-div-icon { border: none !important; background: none !important; }
          </style>
        </head>
        <body>
          <div id="map"></div>
          <script>
            var map = L.map('map', { zoomControl: false, attributionControl: false });
            
            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                maxZoom: 19,
            }).addTo(map);

            var startIcon = L.divIcon({
                className: 'custom-div-icon',
                html: '<div style="background-color: #818CF8; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>',
                iconSize: [12, 12],
                iconAnchor: [6, 6]
            });

            var endIcon = L.divIcon({
                className: 'custom-div-icon',
                html: '<div style="background-color: #FB7185; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>',
                iconSize: [12, 12],
                iconAnchor: [6, 6]
            });

            L.marker([${start.lat}, ${start.lng}], { icon: startIcon }).addTo(map);
            L.marker([${end.lat}, ${end.lng}], { icon: endIcon }).addTo(map);

            var polylineData = ${JSON.stringify(decodePolyline(polyline || ''))};
            if (polylineData && polylineData.length > 0) {
                var line = L.polyline(polylineData, {
                    color: '#818CF8',
                    weight: 4,
                    opacity: 0.8,
                    lineJoin: 'round'
                }).addTo(map);
                map.fitBounds(line.getBounds(), { padding: [30, 30] });
            } else {
                var bounds = L.latLngBounds([
                    [${start.lat}, ${start.lng}],
                    [${end.lat}, ${end.lng}]
                ]);
                map.fitBounds(bounds, { padding: [50, 50] });
            }

            // Drivers simulation
            for (var i = 0; i < 4; i++) {
                (function() {
                    var lat = ${start.lat} + (Math.random() * 0.01 - 0.005);
                    var lng = ${start.lng} + (Math.random() * 0.01 - 0.005);
                    var carIcon = L.divIcon({
                        className: 'car-icon',
                        html: '<div style="transform: rotate(' + (Math.random() * 360) + 'deg); font-size: 16px;">🚕</div>',
                        iconSize: [20, 20],
                        iconAnchor: [10, 10]
                    });
                    var marker = L.marker([lat, lng], { icon: carIcon }).addTo(map);
                    
                    setInterval(function() {
                        var pos = marker.getLatLng();
                        marker.setLatLng([
                            pos.lat + (Math.random() * 0.0004 - 0.0002),
                            pos.lng + (Math.random() * 0.0004 - 0.0002)
                        ]);
                    }, 3000);
                })();
            }
          </script>
        </body>
      </html>
    `;

    return (
        <View style={tw`w-full h-96 bg-black rounded-3xl overflow-hidden shadow-2xl border border-zinc-800`}>
            <WebView
                originWhitelist={['*']}
                source={{ html: leafletHtml }}
                style={tw`flex-1 bg-black`}
                containerStyle={tw`bg-black`}
                scrollEnabled={false}
                overScrollMode="never"
            />
        </View>
    );
};

// WEB MAP COMPONENT (Direct Leaflet)
const WebMap: React.FC<InteractiveMapProps> = ({ start, end, polyline }) => {
    const mapRef = useRef<any>(null);
    const containerRef = useRef<any>(null);

    useEffect(() => {
        if (!containerRef.current || !L) return;

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

        map.eachLayer((layer: any) => {
            if (layer instanceof L.Marker || layer instanceof L.Polyline) {
                map.removeLayer(layer);
            }
        });

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

export const InteractiveMap: React.FC<InteractiveMapProps> = (props) => {
    if (Platform.OS === 'web') {
        return <WebMap {...props} />;
    }
    return <NativeMap {...props} />;
};
