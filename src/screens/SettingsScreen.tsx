import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, KeyboardAvoidingView, Platform, Switch } from 'react-native';
import tw from 'twrnc';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, Save, RotateCcw, Truck, DollarSign, Clock as ClockIcon, Eye, EyeOff } from 'lucide-react-native';
import { PROVIDERS } from '../data/providers';
import { StorageService } from '../services/storage';

import { useLanguage } from '../i18n/LanguageContext';

export interface RideProvider {
    id: string;
    name: string;
    color: string;
    logoUrl?: string;
    logoLocal?: any;
    baseFare: number;
    perKmRate: number;
    perMinuteRate: number;
    minFare: number;
    surgeMultiplierMorning: number;
    surgeMultiplierEvening: number;
    pickupDelayMin: number;
    enabled?: boolean; // New field for toggling
}

export const SettingsScreen = () => {
    const navigation = useNavigation();
    const { t, language, setLanguage } = useLanguage();
    const [providers, setProviders] = useState<RideProvider[]>(PROVIDERS);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const saved = await StorageService.loadSettings();
            if (saved) {
                // Filter out obsolete providers
                const validDetails = saved.filter((s: any) => PROVIDERS.some(p => p.id === s.id));
                setProviders(validDetails);
            }
            setLoading(false);
        };
        load();
    }, []);

    const handleUpdate = (id: string, field: keyof RideProvider, value: string) => {
        const numValue = parseFloat(value) || 0;
        setProviders(prev => prev.map(p =>
            p.id === id ? { ...p, [field]: numValue } : p
        ));
    };

    const handleSave = async () => {
        await StorageService.saveSettings(providers);
        Alert.alert(t('settings.success'), t('settings.saved'));
        navigation.goBack();
    };

    const handleReset = () => {
        Alert.alert(
            t('settings.reset'),
            t('settings.resetConfirm'),
            [
                { text: "Cancel", style: "cancel" },
                { text: "Reset", style: "destructive", onPress: () => setProviders(PROVIDERS) }
            ]
        );
    };

    if (loading) return <View style={tw`flex-1 bg-black`} />;

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={tw`flex-1 bg-black`}
        >
            <View style={tw`flex-row items-center justify-between px-6 pt-14 pb-4 border-b border-zinc-900`}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={tw`p-2 -ml-2`}>
                    <ChevronLeft size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={tw`text-white font-bold text-lg`}>{t('settings.title')}</Text>
                <TouchableOpacity onPress={handleReset} style={tw`p-2 -mr-2`}>
                    <RotateCcw size={20} color="#71717A" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={tw`p-6 pb-20`}>
                <Text style={tw`text-zinc-500 text-sm mb-6`}>
                    {t('settings.subtitle')}
                </Text>

                {/* Legal Links */}
                <View style={tw`flex-row gap-4 mb-6`}>
                    <TouchableOpacity onPress={() => (navigation as any).navigate('PrivacyPolicy')}>
                        <Text style={tw`text-indigo-400 text-xs font-bold underline`}>{t('legal.privacyPolicy')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => (navigation as any).navigate('Terms')}>
                        <Text style={tw`text-indigo-400 text-xs font-bold underline`}>{t('legal.termsOfService')}</Text>
                    </TouchableOpacity>
                </View>

                {/* Language Settings */}
                <View style={tw`bg-zinc-900 rounded-3xl p-6 mb-6 border border-zinc-700`}>
                    <View style={tw`flex-row items-center justify-between`}>
                        <View style={tw`flex-row items-center`}>
                            <View style={tw`w-10 h-10 rounded-full bg-indigo-500/20 items-center justify-center mr-3`}>
                                <Text style={tw`text-lg`}>{language === 'en' ? '🇺🇸' : '🇪🇹'}</Text>
                            </View>
                            <Text style={tw`text-white font-bold text-base`}>{t('settings.language')}</Text>
                        </View>
                        <View style={tw`flex-row bg-black rounded-lg p-1 border border-zinc-800`}>
                            <TouchableOpacity
                                onPress={() => setLanguage('en')}
                                style={tw`px-3 py-1.5 rounded-md ${language === 'en' ? 'bg-zinc-800' : ''}`}
                            >
                                <Text style={tw`text-xs font-bold ${language === 'en' ? 'text-white' : 'text-zinc-500'}`}>EN</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setLanguage('am')}
                                style={tw`px-3 py-1.5 rounded-md ${language === 'am' ? 'bg-zinc-800' : ''}`}
                            >
                                <Text style={tw`text-xs font-bold ${language === 'am' ? 'text-white' : 'text-zinc-500'}`}>AM</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {providers.map((p) => (
                    <View key={p.id} style={tw`bg-zinc-900 rounded-3xl p-6 mb-6 border ${p.enabled === false ? 'border-zinc-800 opacity-60' : 'border-zinc-700'}`}>
                        <View style={tw`flex-row items-center justify-between mb-6`}>
                            <View style={tw`flex-row items-center`}>
                                <View style={[tw`w-2 h-8 rounded-full mr-3`, { backgroundColor: p.color }]} />
                                <Text style={tw`text-white font-bold text-xl`}>{p.name}</Text>
                            </View>
                            <View style={tw`flex-row items-center`}>
                                {p.enabled === false ? <EyeOff size={16} color="#71717A" style={tw`mr-2`} /> : <Eye size={16} color="#A1A1AA" style={tw`mr-2`} />}
                                <Switch
                                    value={p.enabled !== false}
                                    onValueChange={(val) => {
                                        setProviders(prev => prev.map(item =>
                                            item.id === p.id ? { ...item, enabled: val } : item
                                        ));
                                    }}
                                    trackColor={{ false: "#3F3F46", true: p.color }}
                                    thumbColor="#FFFFFF"
                                />
                            </View>
                        </View>

                        <View style={tw`gap-4`}>
                            <View>
                                <Text style={tw`text-zinc-500 text-xs font-bold uppercase mb-2 ml-1`}>{t('card.baseFare')} (ETB)</Text>
                                <View style={tw`bg-black rounded-xl flex-row items-center px-4 py-1 border border-zinc-800`}>
                                    <DollarSign size={14} color="#52525B" />
                                    <TextInput
                                        style={tw`flex-1 h-12 text-white ml-2 font-medium`}
                                        keyboardType="numeric"
                                        value={p.baseFare.toString()}
                                        onChangeText={(v) => handleUpdate(p.id, 'baseFare', v)}
                                    />
                                </View>
                            </View>

                            <View style={tw`flex-row gap-4`}>
                                <View style={tw`flex-1`}>
                                    <Text style={tw`text-zinc-500 text-xs font-bold uppercase mb-2 ml-1`}>Per KM</Text>
                                    <View style={tw`bg-black rounded-xl flex-row items-center px-4 py-1 border border-zinc-800`}>
                                        <Truck size={14} color="#52525B" />
                                        <TextInput
                                            style={tw`flex-1 h-12 text-white ml-2 font-medium`}
                                            keyboardType="numeric"
                                            value={p.perKmRate.toString()}
                                            onChangeText={(v) => handleUpdate(p.id, 'perKmRate', v)}
                                        />
                                    </View>
                                </View>
                                <View style={tw`flex-1`}>
                                    <Text style={tw`text-zinc-500 text-xs font-bold uppercase mb-2 ml-1`}>Per Min</Text>
                                    <View style={tw`bg-black rounded-xl flex-row items-center px-4 py-1 border border-zinc-800`}>
                                        <ClockIcon size={14} color="#52525B" />
                                        <TextInput
                                            style={tw`flex-1 h-12 text-white ml-2 font-medium`}
                                            keyboardType="numeric"
                                            value={p.perMinuteRate.toString()}
                                            onChangeText={(v) => handleUpdate(p.id, 'perMinuteRate', v)}
                                        />
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                ))}
            </ScrollView>

            <View style={tw`absolute bottom-0 left-0 right-0 p-6 bg-black/80`}>
                <TouchableOpacity
                    onPress={handleSave}
                    style={tw`bg-indigo-600 h-14 rounded-2xl flex-row items-center justify-center shadow-lg`}
                >
                    <Save size={20} color="#FFFFFF" />
                    <Text style={tw`text-white font-bold text-base ml-2`}>{t('settings.save')}</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};
