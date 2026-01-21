import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Animated, Easing, Share } from 'react-native';
import tw from 'twrnc';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, MapPin, Share2 } from 'lucide-react-native';

import { getRouteEstimate, RouteResult } from '../services/mockRouter';
import { calculateFares, FareEstimate } from '../data/fareCalculator';
import { PROVIDERS } from '../data/providers';
import { RideCard } from '../components/RideCard';
import { SkeletonCard } from '../components/SkeletonCard';
import { StorageService } from '../services/storage';
import { InteractiveMap } from '../components/InteractiveMap';

import { useLanguage } from '../i18n/LanguageContext';

export const ResultsScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { origin, destination, forceRushHour, originCoord, destinationCoord } = route.params;
    const { t } = useLanguage();

    const [loading, setLoading] = useState(true);
    const [routeInfo, setRouteInfo] = useState<RouteResult | null>(null);
    const [estimates, setEstimates] = useState<FareEstimate[]>([]);
    const [category, setCategory] = useState<'economy' | 'comfort' | 'van'>('economy');

    // Pulse animation for skeleton
    const pulseAnim = useRef(new Animated.Value(0.4)).current;

    useEffect(() => {
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 800,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 0.4,
                    duration: 800,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        );
        pulse.start();
        return () => pulse.stop();
    }, [pulseAnim]);

    const [calibratedProviders, setCalibratedProviders] = useState<any[]>(PROVIDERS);

    useEffect(() => {
        const load = async () => {
            const saved = await StorageService.loadSettings();
            if (saved) {
                // Ensure all saved providers have categoryMultipliers (migration)
                // AND filter out removed providers (e.g. ZayRide)
                const migrated = saved
                    .filter((s: any) => PROVIDERS.some(p => p.id === s.id))
                    .map((s: any) => {
                        const def = PROVIDERS.find(p => p.id === s.id);
                        return {
                            ...s,
                            categoryMultipliers: s.categoryMultipliers || def?.categoryMultipliers || { economy: 1.0, comfort: 1.3, van: 1.8 }
                        };
                    });
                setCalibratedProviders(migrated);
            }
        };
        load();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const result = await getRouteEstimate(origin, destination, originCoord, destinationCoord);
            setRouteInfo(result);

            const hour = forceRushHour ? 18 : new Date().getHours();
            const allEstimates = calculateFares(result.distanceKm, result.durationMin, calibratedProviders, hour, category);

            // Filter by enabled providers
            const fares = allEstimates.filter(est => {
                const p = calibratedProviders.find(cp => cp.id === est.providerId);
                return p?.enabled !== false;
            });

            fares.sort((a, b) => a.minEstimate - b.minEstimate);

            setEstimates(fares);
            setLoading(false);
        };
        fetchData();
    }, [origin, destination, forceRushHour, calibratedProviders, category, originCoord, destinationCoord]);

    const handleShare = async () => {
        try {
            const cheapest = estimates[0];
            const provider = calibratedProviders.find(p => p.id === cheapest?.providerId);
            const message = t('results.share', origin, destination, provider?.name, cheapest?.minEstimate, cheapest?.maxEstimate);

            await Share.share({
                message,
                title: t('results.title')
            });
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <View style={tw`flex-1 bg-black`}>
            {/* Header */}
            <View style={tw`flex-row items-center justify-between px-6 pt-14 pb-4 bg-black z-10`}>
                <View style={tw`flex-row items-center`}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={tw`w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 items-center justify-center`}
                    >
                        <ArrowLeft color="#FFFFFF" size={20} />
                    </TouchableOpacity>
                    <Text style={tw`text-xl font-bold text-white ml-4`}>{t('results.title')}</Text>
                </View>

                <TouchableOpacity
                    onPress={handleShare}
                    style={tw`w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 items-center justify-center`}
                >
                    <Share2 color="#818CF8" size={20} />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={tw`flex-1 px-6 pt-4`}>
                    {/* Skeleton Map */}
                    <View style={tw`w-full h-96 bg-zinc-900 rounded-3xl mb-6 border border-zinc-800 opacity-50`} />

                    {/* Skeleton List */}
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                </View>
            ) : (
                <ScrollView contentContainerStyle={tw`pb-20`}>

                    {/* Interactive Map - Full Width/Height Showcase */}
                    {routeInfo?.startCoord && routeInfo?.endCoord && (
                        <View style={tw`h-96 w-full relative mb-6`}>
                            <InteractiveMap
                                start={routeInfo.startCoord}
                                end={routeInfo.endCoord}
                                polyline={routeInfo.polyline}
                            />
                            {/* Overlay Gradient for smooth transition */}
                            <View style={tw`absolute bottom-0 w-full h-20 bg-gradient-to-t from-black to-transparent`} />
                        </View>
                    )}

                    <View style={tw`px-6`}>

                        {/* Route Summary */}
                        <View style={tw`bg-zinc-900/80 rounded-3xl p-5 mb-6 border border-zinc-800 backdrop-blur-md`}>
                            <View style={tw`flex-row items-center mb-3`}>
                                <View style={tw`w-2.5 h-2.5 rounded-full bg-indigo-500 mr-3 shadow-lg shadow-indigo-500/50`} />
                                <Text style={tw`text-zinc-300 text-sm flex-1 font-medium`} numberOfLines={1}>{routeInfo?.origin}</Text>
                            </View>
                            <View style={tw`flex-row items-center mb-5`}>
                                <MapPin size={12} color="#FB7185" style={tw`mr-2 ml-[1px]`} />
                                <Text style={tw`text-zinc-300 text-sm flex-1 font-medium`} numberOfLines={1}>{routeInfo?.destination}</Text>
                            </View>
                            <View style={tw`flex-row justify-between pt-4 border-t border-zinc-800/50`}>
                                <View>
                                    <Text style={tw`text-2xl font-black text-white`}>{routeInfo?.distanceKm}<Text style={tw`text-sm font-normal text-zinc-500`}> km</Text></Text>
                                </View>
                                <View style={tw`items-end`}>
                                    <Text style={tw`text-2xl font-black text-white`}>{routeInfo?.durationMin}<Text style={tw`text-sm font-normal text-zinc-500`}> min</Text></Text>
                                </View>
                            </View>
                        </View>

                        {/* Category Selector */}
                        <View style={tw`mb-6`}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={tw`flex-row`}>
                                {['economy', 'comfort', 'van'].map((cat) => (
                                    <TouchableOpacity
                                        key={cat}
                                        onPress={() => setCategory(cat as any)}
                                        style={tw`bg-zinc-900 border ${category === cat ? 'border-indigo-500 bg-indigo-500/10' : 'border-zinc-800'} rounded-2xl px-6 py-4 mr-3 items-center min-w-[100px]`}
                                    >
                                        <Text style={tw`text-white font-bold text-xs uppercase ${category === cat ? 'text-indigo-400' : 'text-zinc-500'}`}>{cat}</Text>
                                        <Text style={tw`text-[10px] text-zinc-600 mt-1`}>
                                            {t(`results.${cat}`)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        <View style={tw`flex-row items-center justify-between mb-4`}>
                            <Text style={tw`text-xs font-bold text-zinc-500 uppercase tracking-widest`}>{t('results.bestOption')}</Text>
                            <View style={tw`bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-full`}>
                                <Text style={tw`text-[10px] text-indigo-400 font-bold`}>{estimates.length} {t('results.ridesFound')}</Text>
                            </View>
                        </View>

                        {/* Rides List */}
                        {estimates.map((est, index) => {
                            const provider = PROVIDERS.find(p => p.id === est.providerId);
                            if (!provider) return null;
                            return (
                                <RideCard
                                    key={est.providerId}
                                    provider={provider}
                                    estimate={est}
                                    isCheapest={index === 0}
                                />
                            );
                        })}

                        {/* Footer Note */}
                        <Text style={tw`text-[11px] text-zinc-600 text-center mt-6 mb-10`}>
                            {t('results.footer')}
                        </Text>
                    </View>
                </ScrollView>
            )}
        </View>
    );
};
