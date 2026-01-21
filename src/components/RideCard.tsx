import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, Modal } from 'react-native';
import tw from 'twrnc';
import { Zap, Award, Clock, Info, X, ChevronRight } from 'lucide-react-native';
import { RideProvider } from '../data/providers';
import { FareEstimate } from '../data/fareCalculator';
import { BookingService } from '../services/bookingService';

import { useLanguage } from '../i18n/LanguageContext';

interface RideCardProps {
    provider: RideProvider;
    estimate: FareEstimate;
    isCheapest?: boolean;
}

export const RideCard: React.FC<RideCardProps> = ({ provider, estimate, isCheapest }) => {
    const { t } = useLanguage();
    const [showDetail, setShowDetail] = useState(false);

    const handleBook = async () => {
        setShowDetail(false);
        await BookingService.openProvider(provider.id);
    };

    // Calculate Arrival Time (ETA)
    const now = new Date();
    const arrivalTime = new Date(now.getTime() + (provider.pickupDelayMin + estimate.durationMin) * 60000);
    const arrivalString = arrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

    const BreakdownRow = ({ label, value, isTotal = false }: { label: string, value: number, isTotal?: boolean }) => (
        <View style={tw`flex-row justify-between py-2 ${isTotal ? 'border-t border-zinc-800 mt-2 pt-4' : ''}`}>
            <Text style={tw`${isTotal ? 'text-white font-bold' : 'text-zinc-400'} text-sm`}>{label}</Text>
            <Text style={tw`${isTotal ? 'text-white font-bold' : 'text-zinc-200'} text-sm`}>
                {value.toFixed(2)} <Text style={tw`text-[10px] text-zinc-500`}>ETB</Text>
            </Text>
        </View>
    );

    return (
        <>
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setShowDetail(true)}
                style={[
                    tw`flex-row items-center p-5 mb-3 rounded-2xl border`,
                    isCheapest
                        ? tw`bg-indigo-950/40 border-indigo-500/30 shadow-sm`
                        : tw`bg-zinc-900 border-zinc-800`
                ]}
            >
                {/* Provider Logo */}
                <View style={tw`w-14 h-14 rounded-xl items-center justify-center mr-4 bg-white overflow-hidden p-1 shadow-sm`}>
                    {provider.logoLocal ? (
                        <Image
                            source={provider.logoLocal}
                            style={tw`w-full h-full`}
                            resizeMode="contain"
                        />
                    ) : (
                        <Text style={[tw`font-black text-lg`, { color: provider.color }]}>
                            {provider.name.charAt(0)}
                        </Text>
                    )}
                </View>

                {/* Info */}
                <View style={tw`flex-1`}>
                    <View style={tw`flex-row items-center`}>
                        <Text style={tw`font-bold text-base text-white`}>{provider.name}</Text>
                        {isCheapest && (
                            <View style={tw`flex-row items-center ml-2 bg-indigo-500/20 px-2 py-0.5 rounded-full border border-indigo-500/30`}>
                                <Award size={10} color="#818CF8" />
                                <Text style={tw`text-[9px] text-indigo-300 ml-1 font-bold uppercase`}>{t('card.bestPrice')}</Text>
                            </View>
                        )}
                    </View>

                    {/* ETA Info */}
                    <View style={tw`flex-row items-center mt-1`}>
                        <Clock size={12} color="#A1A1AA" />
                        <Text style={tw`text-[11px] text-zinc-400 ml-1 font-medium`}>
                            {t('card.eta', provider.pickupDelayMin, arrivalString)}
                        </Text>
                    </View>

                    {estimate.surgeApplied && (
                        <View style={tw`flex-row items-center mt-1`}>
                            <Zap size={10} color="#F43F5E" fill="#F43F5E" />
                            <Text style={tw`text-[10px] text-rose-500 ml-1 font-semibold uppercase`}>
                                {estimate.surgeReason || t('card.surgeReason')}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Price */}
                <View style={tw`items-end`}>
                    <Text style={[
                        tw`font-black text-xl`,
                        isCheapest ? tw`text-indigo-400` : tw`text-white`
                    ]}>
                        {estimate.minEstimate}<Text style={tw`text-sm text-zinc-500 font-medium`}>-{estimate.maxEstimate}</Text>
                    </Text>
                    <View style={tw`flex-row items-center`}>
                        <Text style={tw`text-[10px] text-zinc-500 font-semibold uppercase mr-1`}>ETB</Text>
                        <ChevronRight size={12} color="#52525B" />
                    </View>
                </View>
            </TouchableOpacity>

            {/* Detail Modal */}
            <Modal visible={showDetail} transparent animationType="fade">
                <View style={tw`flex-1 bg-black/80 justify-center px-10`}>
                    <View style={tw`bg-zinc-900 rounded-3xl p-6 border border-zinc-800`}>
                        <View style={tw`flex-row justify-between items-center mb-6`}>
                            <View style={tw`flex-row items-center`}>
                                <Info size={18} color="#818CF8" />
                                <Text style={tw`text-white font-bold text-lg ml-2`}>{t('card.breakdown')}</Text>
                            </View>
                            <TouchableOpacity onPress={() => setShowDetail(false)}>
                                <X size={20} color="#A1A1AA" />
                            </TouchableOpacity>
                        </View>

                        <Text style={tw`text-zinc-500 text-[11px] font-bold uppercase tracking-widest mb-4`}>
                            {provider.name} Estimates
                        </Text>

                        <BreakdownRow label={t('card.baseFare')} value={estimate.baseFare} />
                        <BreakdownRow label={t('card.distance')} value={estimate.distanceCost} />
                        <BreakdownRow label={t('card.time')} value={estimate.timeCost} />

                        {estimate.surgeApplied && (
                            <View style={tw`flex-row justify-between py-2`}>
                                <View style={tw`flex-row items-center`}>
                                    <Text style={tw`text-rose-500 text-sm`}>{estimate.surgeReason || t('card.surgeReason')}</Text>
                                    <Zap size={10} color="#F43F5E" style={tw`ml-1`} />
                                </View>
                                <Text style={tw`text-rose-500 text-sm font-medium`}>
                                    +{estimate.surgeAmount.toFixed(2)} <Text style={tw`text-[10px] text-zinc-500`}>ETB</Text>
                                </Text>
                            </View>
                        )}

                        <BreakdownRow label={t('card.total')} value={(estimate.minEstimate + estimate.maxEstimate) / 2} isTotal />

                        <Text style={tw`text-zinc-600 text-[10px] mt-6 text-center italic`}>
                            {t('card.disclaimer')}
                        </Text>

                        <TouchableOpacity
                            onPress={handleBook}
                            style={[tw`mt-8 h-14 rounded-xl items-center justify-center shadow-md`, { backgroundColor: provider.color }]}
                        >
                            <Text style={tw`text-black font-bold text-base`}>{t('card.book', provider.name)}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setShowDetail(false)}
                            style={tw`mt-4 py-2 items-center`}
                        >
                            <Text style={tw`text-zinc-500 font-medium`}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </>
    );
};
