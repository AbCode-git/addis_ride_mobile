import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import tw from 'twrnc';
import { RideProvider } from '../data/providers';
import { FareEstimate } from '../data/fareCalculator';
import { Car, Zap } from 'lucide-react-native';

interface RideCardProps {
    provider: RideProvider;
    estimate: FareEstimate;
}

export const RideCard: React.FC<RideCardProps> = ({ provider, estimate }) => {
    return (
        <View style={tw`flex-row items-center bg-white p-4 mb-3 rounded-xl shadow-sm border border-gray-100`}>
            {/* Icon / Logo Area */}
            <View style={tw`w-12 h-12 rounded-full items-center justify-center mr-4 bg-[${provider.color}] bg-opacity-10`}>
                {/* We use a generic Car icon, but colored */}
                <Car color={provider.color} size={24} />
            </View>

            {/* Info Area */}
            <View style={tw`flex-1`}>
                <Text style={tw`font-bold text-lg text-gray-800`}>{provider.name}</Text>
                {estimate.surgeApplied && (
                    <View style={tw`flex-row items-center mt-1`}>
                        <Zap size={12} color="#EF4444" fill="#EF4444" />
                        <Text style={tw`text-xs text-red-500 ml-1 font-medium`}>
                            {estimate.surgeReason || "High Demand"}
                        </Text>
                    </View>
                )}
            </View>

            {/* Price Area */}
            <View style={tw`items-end`}>
                <Text style={tw`font-bold text-xl text-gray-900`}>
                    {estimate.minEstimate} - {estimate.maxEstimate}
                </Text>
                <Text style={tw`text-xs text-gray-500`}>ETB</Text>
            </View>
        </View>
    );
};
