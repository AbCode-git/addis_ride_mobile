import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Switch,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
    Modal,
    FlatList,
    TextInput,
    Animated,
    Easing
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import tw from 'twrnc';
import { useNavigation } from '@react-navigation/native';
import { Send, MapPin, ChevronDown, Clock, Search, X, Star, Home, Briefcase, Heart, Settings as SettingsIcon } from 'lucide-react-native';
import { StorageService } from '../services/storage';
import { ORSService } from '../services/orsService';
import { searchStaticLocations } from '../data/locations';

import { useLanguage } from '../i18n/LanguageContext';

// Mapping icon strings to components for storage safety
const ICON_MAP: Record<string, any> = {
    'Briefcase': Briefcase,
    'Home': Home,
    'Heart': Heart,
    'Star': Star,
};

const DEFAULT_FAVORITES: FavoriteRoute[] = [
    { id: '1', label: 'Work', pickup: 'Bole', dropoff: 'Mexico', icon: 'Briefcase' },
    { id: '2', label: 'Home', pickup: 'CMC', dropoff: 'Bole Airport', icon: 'Home' },
    { id: '3', label: 'Gym', pickup: 'Meskel Square', dropoff: 'Kazanchis', icon: 'Heart' },
];

interface FavoriteRoute {
    id: string;
    label: string;
    pickup: string;
    dropoff: string;
    icon: any;
}

export const HomeScreen = () => {
    const navigation = useNavigation<any>();
    const { t, language, setLanguage } = useLanguage();

    // State now holds name string for display, but we track coords separately or in Recents
    const [pickup, setPickup] = useState('');
    const [pickupCoord, setPickupCoord] = useState<{ lat: number, lng: number } | undefined>(undefined);

    const [dropoff, setDropoff] = useState('');
    const [dropoffCoord, setDropoffCoord] = useState<{ lat: number, lng: number } | undefined>(undefined);

    const [isRushHour, setIsRushHour] = useState(false);
    const [showPickupModal, setShowPickupModal] = useState(false);
    const [showDropoffModal, setShowDropoffModal] = useState(false);
    const [favorites, setFavorites] = useState<FavoriteRoute[]>([]);
    const [recents, setRecents] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Pulse animation for the main CTA
    const pulseAnim = useRef(new Animated.Value(1)).current;

    const clearError = () => {
        if (error) setError(null);
    };

    useEffect(() => {
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.03,
                    duration: 1200,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1200,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        );
        pulse.start();
        return () => pulse.stop();
    }, []);

    useEffect(() => {
        const init = async () => {
            // Auto-Rush Hour Detection
            const hour = new Date().getHours();
            // Morning: 7-9 AM, Afternoon: 4-7 PM (16-19)
            if ((hour >= 7 && hour < 9) || (hour >= 16 && hour < 19)) {
                setIsRushHour(true);
                // Alert.alert("Rush Hour", t('home.rushAlertBody')); // Reduced annoyance
            }

            const storedFavs = await StorageService.loadFavorites();
            if (storedFavs && storedFavs.length > 0) {
                setFavorites(storedFavs);
            } else {
                setFavorites(DEFAULT_FAVORITES);
            }

            const storedRecents = await StorageService.loadRecentSearches();
            setRecents(storedRecents);
        };
        init();
    }, []);

    const handleCompare = async () => {
        setError(null);

        if (!pickup.trim() || !dropoff.trim()) {
            setError(t('errors.missingLocations'));
            return;
        }

        // Validate coordinates (basic check)
        if (!pickupCoord || !dropoffCoord) {
            // Fallback: try to geocode quickly if missing?
            // For now, strict validation to ensure accurate pricing
            if (!pickupCoord) setError(`${t('errors.invalidLocations')}: ${pickup}`);
            else setError(`${t('errors.invalidLocations')}: ${dropoff}`);
            return;
        }

        // Save to recents
        const updatedRecents = await StorageService.saveRecentSearch(pickup, dropoff);
        setRecents(updatedRecents);

        navigation.navigate('Results', {
            origin: pickup,
            destination: dropoff,
            originCoord: pickupCoord,
            destinationCoord: dropoffCoord,
            forceRushHour: isRushHour
        });
    };

    const handleFavoriteSelect = async (fav: FavoriteRoute) => {
        setError(null);

        // Set the location names immediately for UI feedback
        setPickup(fav.pickup);
        setDropoff(fav.dropoff);

        try {
            // Geocode both locations in parallel
            const [pickupResults, dropoffResults] = await Promise.all([
                ORSService.geocode(fav.pickup),
                ORSService.geocode(fav.dropoff)
            ]);

            // Set coordinates if found
            if (pickupResults.length > 0) {
                setPickupCoord({ lat: pickupResults[0].lat, lng: pickupResults[0].lng });
            } else {
                setError(t('errors.invalidLocations') + `: ${fav.pickup}`);
                setPickupCoord(undefined);
            }

            if (dropoffResults.length > 0) {
                setDropoffCoord({ lat: dropoffResults[0].lat, lng: dropoffResults[0].lng });
            } else {
                setError(t('errors.invalidLocations') + `: ${fav.dropoff}`);
                setDropoffCoord(undefined);
            }
        } catch (error) {
            console.error('Error geocoding favorite locations:', error);
            setError(t('errors.comparisonFailed'));
        }
    };

    const handleSelectLocation = (loc: any, type: 'pickup' | 'dropoff') => {
        if (type === 'pickup') {
            clearError();
            setPickup(loc.name);
            if (loc.lat && loc.lng) setPickupCoord({ lat: loc.lat, lng: loc.lng });
            else setPickupCoord(undefined);
        } else {
            clearError();
            setDropoff(loc.name);
            if (loc.lat && loc.lng) setDropoffCoord({ lat: loc.lat, lng: loc.lng });
            else setDropoffCoord(undefined);
        }
    };

    const handleSaveFavorite = async () => {
        if (!pickup || !dropoff) return;
        const newFav: FavoriteRoute = {
            id: Date.now().toString(),
            label: 'Saved',
            pickup,
            dropoff,
            icon: 'Star'
        };
        const updated = [newFav, ...favorites];
        setFavorites(updated);
        await StorageService.saveFavorites(updated);
        Alert.alert("Saved!", "Route added to your favorites.");
    };

    const LocationModal = ({
        visible,
        onClose,
        onSelect,
        title
    }: {
        visible: boolean;
        onClose: () => void;
        onSelect: (loc: any) => void;
        title: string;
    }) => {
        const [search, setSearch] = useState('');
        const [results, setResults] = useState<any[]>([]);
        const [loading, setLoading] = useState(false);
        const [debouncedSearch, setDebouncedSearch] = useState('');

        // 1. Debounce Effect
        useEffect(() => {
            const timer = setTimeout(() => {
                setDebouncedSearch(search);
            }, 600); // 600ms debounce
            return () => clearTimeout(timer);
        }, [search]);

        // 2. Search Effect
        useEffect(() => {
            const performSearch = async () => {
                if (!debouncedSearch || debouncedSearch.length < 2) {
                    setResults(searchStaticLocations(debouncedSearch));
                    return;
                }

                setLoading(true);

                // Parallel Search: Static + API
                const staticMatches = searchStaticLocations(debouncedSearch);
                const apiMatches = await ORSService.geocode(debouncedSearch);

                // Dedup and Merge: Prioritize API matches that are unique
                // (Simple merge for now)
                const combined = [
                    ...apiMatches.map(m => ({ ...m, type: 'api' })),
                    ...staticMatches.map(m => ({ ...m, type: 'static' }))
                ];

                setResults(combined);
                setLoading(false);
            };

            performSearch();
        }, [debouncedSearch]);

        return (
            <Modal visible={visible} transparent animationType="slide">
                <View style={tw`flex-1 bg-black/80 justify-end`}>
                    <View style={tw`bg-zinc-900 rounded-t-3xl h-[80%]`}>
                        <View style={tw`p-6 border-b border-zinc-800`}>
                            <View style={tw`flex-row justify-between items-center mb-4`}>
                                <Text style={tw`text-white font-bold text-lg`}>{title}</Text>
                                <TouchableOpacity onPress={() => { setSearch(''); onClose(); }}>
                                    <X size={24} color="#A1A1AA" />
                                </TouchableOpacity>
                            </View>

                            {/* Search Bar */}
                            <View style={tw`flex-row items-center bg-zinc-800 rounded-xl px-4 py-2`}>
                                <Search size={18} color="#71717A" />
                                <TextInput
                                    placeholder="Search location..."
                                    placeholderTextColor="#71717A"
                                    value={search}
                                    onChangeText={setSearch}
                                    style={tw`flex-1 ml-3 text-white h-10`}
                                    autoFocus
                                />
                                {search.length > 0 && (
                                    <TouchableOpacity onPress={() => setSearch('')}>
                                        <X size={16} color="#71717A" />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>

                        {loading && (
                            <View style={tw`p-4 items-center`}>
                                <Text style={tw`text-indigo-400 text-xs`}>Searching map...</Text>
                            </View>
                        )}

                        <FlatList
                            data={results}
                            keyExtractor={(item, index) => `${item.name}-${index}`}
                            keyboardShouldPersistTaps="handled"
                            ListEmptyComponent={() => (
                                <View style={tw`p-10 items-center`}>
                                    {!loading && search.length > 2 && (
                                        <Text style={tw`text-zinc-500`}>No results found.</Text>
                                    )}
                                    {search.length <= 2 && (
                                        <Text style={tw`text-zinc-600 text-xs`}>Type to search online...</Text>
                                    )}
                                </View>
                            )}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    onPress={() => { onSelect(item); setSearch(''); onClose(); }}
                                    style={tw`px-6 py-4 border-b border-zinc-800/50 flex-row items-center justify-between`}
                                >
                                    <View style={tw`flex-row items-center flex-1`}>
                                        <MapPin
                                            size={16}
                                            color={item.type === 'api' ? "#818CF8" : "#71717A"}
                                            style={tw`mr-3`}
                                        />
                                        <Text style={tw`text-white text-base`} numberOfLines={1}>{item.name}</Text>
                                    </View>
                                    {item.type === 'api' && (
                                        <View style={tw`bg-indigo-500/10 px-2 py-0.5 rounded`}>
                                            <Text style={tw`text-indigo-400 text-[9px] uppercase font-bold`}>Map</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            )}
                        />
                        <TouchableOpacity onPress={() => { setSearch(''); onClose(); }} style={tw`p-6 items-center`}>
                            <Text style={tw`text-indigo-400 font-bold`}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        );
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={tw`flex-1 bg-black`}
        >
            <ScrollView contentContainerStyle={tw`flex-grow px-6 pt-12 pb-8`}>

                {/* Header */}
                <View style={tw`flex-row justify-between items-center mb-6`}>
                    <Text style={tw`text-indigo-400 font-bold text-base`}>{t('home.title')}</Text>
                    <View style={tw`flex-row items-center gap-3`}>
                        <TouchableOpacity
                            onPress={() => setLanguage(language === 'en' ? 'am' : 'en')}
                            style={tw`bg-zinc-900 px-3 py-2 rounded-full border border-zinc-800`}
                        >
                            <Text style={tw`text-white font-bold text-xs`}>{language === 'en' ? '🇪🇹 AM' : '🇺🇸 EN'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
                            <View style={tw`bg-zinc-900 p-2 rounded-full border border-zinc-800`}>
                                <SettingsIcon size={18} color="#A1A1AA" />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Error Banner */}
                {error && (
                    <View style={tw`bg-rose-500/10 border border-rose-500/50 p-4 rounded-xl mb-6`}>
                        <View style={tw`flex-row items-center justify-between`}>
                            <Text style={tw`text-rose-400 text-sm font-medium flex-1 mr-2`}>
                                {error}
                            </Text>
                            <TouchableOpacity onPress={() => setError(null)}>
                                <X size={16} color="#FB7185" />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Hero */}
                <View style={tw`items-center mb-8`}>
                    <View style={tw`w-16 h-16 items-center justify-center mb-6`}>
                        <Send size={48} color="#818CF8" style={{ transform: [{ rotate: '-45deg' }] }} />
                    </View>
                    <Text style={tw`text-3xl font-bold text-white text-center mb-3`}>
                        {t('home.heroTitle')}
                    </Text>
                    <Text style={tw`text-sm text-zinc-500 text-center`}>
                        {t('home.heroSubtitle')}
                    </Text>
                </View>

                {/* Favorites Section */}
                <View style={tw`mb-8`}>
                    <View style={tw`flex-row justify-between items-center mb-4`}>
                        <Text style={tw`text-white font-bold text-sm tracking-widest uppercase opacity-70`}>{t('home.quickTrips')}</Text>
                        {(pickup && dropoff) && (
                            <TouchableOpacity onPress={handleSaveFavorite} style={tw`flex-row items-center`}>
                                <Star size={12} color="#818CF8" />
                                <Text style={tw`text-indigo-400 text-xs font-bold ml-1`}>{t('home.saveFav')}</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={tw`flex-row`}>
                        {favorites.map((fav) => {
                            const Icon = ICON_MAP[fav.icon] || Star;
                            return (
                                <TouchableOpacity
                                    key={fav.id}
                                    onPress={() => handleFavoriteSelect(fav)}
                                    style={tw`bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mr-3 items-center w-24`}
                                >
                                    <View style={tw`bg-zinc-800 p-2 rounded-xl mb-2`}>
                                        <Icon size={18} color="#818CF8" />
                                    </View>
                                    <Text style={tw`text-white text-[11px] font-bold`} numberOfLines={1}>{fav.label}</Text>
                                    <Text style={tw`text-zinc-500 text-[9px]`} numberOfLines={1}>{fav.pickup}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                {/* Trending Destinations */}
                <View style={tw`mb-8`}>
                    <Text style={tw`text-white font-bold text-sm tracking-widest uppercase opacity-70 mb-4`}>{t('home.trending')}</Text>
                    <View style={tw`flex-row flex-wrap justify-between`}>
                        {[
                            { name: 'Bole Airport', icon: '✈️' },
                            { name: 'Mexico', icon: '🏢' },
                            { name: 'Piassa', icon: '🏛️' },
                            { name: 'Kazanchis', icon: '👜' }
                        ].map((item) => (
                            <TouchableOpacity
                                key={item.name}
                                onPress={() => setDropoff(item.name)}
                                style={tw`bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-3 w-[48%] flex-row items-center`}
                            >
                                <Text style={tw`text-lg mr-3`}>{item.icon}</Text>
                                <Text style={tw`text-white text-xs font-bold`}>{item.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Recent Searches */}
                {recents.length > 0 && (
                    <View style={tw`mb-8`}>
                        <Text style={tw`text-white font-bold text-sm tracking-widest uppercase opacity-70 mb-4`}>Recents</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={tw`flex-row`}>
                            {recents.map((item) => (
                                <TouchableOpacity
                                    key={item.id}
                                    onPress={() => { setPickup(item.pickup); setDropoff(item.dropoff); }}
                                    style={tw`bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4 mr-3 min-w-[160px]`}
                                >
                                    <View style={tw`flex-row items-center mb-1`}>
                                        <Clock size={12} color="#71717A" />
                                        <Text style={tw`text-white text-[11px] font-bold ml-2`} numberOfLines={1}>{item.pickup}</Text>
                                    </View>
                                    <View style={tw`flex-row items-center border-l border-zinc-700 ml-1.5 pl-3 py-1`}>
                                        <Text style={tw`text-zinc-500 text-[10px]`} numberOfLines={1}>{item.dropoff}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* Pickup Selector */}
                <View style={tw`mb-4`}>
                    <View style={tw`flex-row items-center mb-2`}>
                        <MapPin size={16} color="#818CF8" />
                        <Text style={tw`text-white font-semibold ml-2`}>{t('home.pickup')}</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => setShowPickupModal(true)}
                        style={tw`bg-zinc-900 rounded-xl px-4 py-4 flex-row items-center justify-between border border-zinc-800 shadow-sm`}
                    >
                        <Text style={tw`${pickup ? 'text-white' : 'text-zinc-500'} font-medium`}>
                            {pickup || t('home.modalPickup')}
                        </Text>
                        <ChevronDown size={20} color="#71717A" />
                    </TouchableOpacity>
                </View>

                {/* Dropoff Selector */}
                <View style={tw`mb-6`}>
                    <View style={tw`flex-row items-center mb-2`}>
                        <MapPin size={16} color="#818CF8" />
                        <Text style={tw`text-white font-semibold ml-2`}>{t('home.dropoff')}</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => setShowDropoffModal(true)}
                        style={tw`bg-zinc-900 rounded-xl px-4 py-4 flex-row items-center justify-between border border-zinc-800 shadow-sm`}
                    >
                        <Text style={tw`${dropoff ? 'text-white' : 'text-zinc-500'} font-medium`}>
                            {dropoff || t('home.modalDropoff')}
                        </Text>
                        <ChevronDown size={20} color="#71717A" />
                    </TouchableOpacity>
                </View>

                {/* Rush Hour Toggle */}
                <View style={tw`bg-zinc-900 rounded-xl px-4 py-4 flex-row items-center justify-between mb-10 border border-zinc-800`}>
                    <View style={tw`flex-row items-center`}>
                        <Clock size={20} color="#818CF8" />
                        <View style={tw`ml-3`}>
                            <Text style={tw`text-white font-semibold`}>{t('home.rushHour')}</Text>
                            <Text style={tw`text-zinc-500 text-xs`}>{t('home.surge')}</Text>
                        </View>
                    </View>
                    <Switch
                        value={isRushHour}
                        onValueChange={setIsRushHour}
                        trackColor={{ false: "#3F3F46", true: "#818CF8" }}
                        thumbColor={"#FFFFFF"}
                    />
                </View>

                {/* CTA Button */}
                <TouchableOpacity
                    onPress={handleCompare}
                    activeOpacity={0.85}
                    style={tw`mb-12`}
                >
                    <Animated.View style={[
                        tw`rounded-xl overflow-hidden shadow-lg`,
                        { transform: [{ scale: pulseAnim }] }
                    ]}>
                        <LinearGradient
                            colors={['#818CF8', '#6366F1', '#4F46E5']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={tw`h-14 items-center justify-center`}
                        >
                            <Text style={tw`text-white font-black text-lg tracking-wide uppercase`}>{t('home.compare')}</Text>
                        </LinearGradient>
                    </Animated.View>
                </TouchableOpacity>

                {/* Footer */}
                <View style={tw`mt-auto items-center`}>
                    <Text style={tw`text-zinc-600 text-xs`}>{t('home.city')}</Text>
                </View>

            </ScrollView>

            {/* Modals */}
            <LocationModal
                visible={showPickupModal}
                onClose={() => setShowPickupModal(false)}
                onSelect={(loc) => handleSelectLocation(loc, 'pickup')}
                title="Select Pickup Location"
            />
            <LocationModal
                visible={showDropoffModal}
                onClose={() => setShowDropoffModal(false)}
                onSelect={(loc) => handleSelectLocation(loc, 'dropoff')}
                title="Select Drop-off Location"
            />
        </KeyboardAvoidingView>
    );
};
