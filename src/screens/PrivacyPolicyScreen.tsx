import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import tw from 'twrnc';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';
import { useLanguage } from '../i18n/LanguageContext';

export const PrivacyPolicyScreen = () => {
    const navigation = useNavigation();
    const { t } = useLanguage();

    return (
        <View style={tw`flex-1 bg-black`}>
            <View style={tw`flex-row items-center px-6 pt-14 pb-4 border-b border-zinc-900`}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={tw`p-2 -ml-2`}>
                    <ChevronLeft size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={tw`text-white font-bold text-lg ml-2`}>{t('legal.privacyTitle')}</Text>
            </View>

            <ScrollView contentContainerStyle={tw`p-6 pb-20`}>
                <Text style={tw`text-zinc-300 leading-6 text-sm`}>
                    {t('legal.privacyContent')}
                </Text>

                <View style={tw`mt-8 pt-6 border-t border-zinc-900`}>
                    <Text style={tw`text-zinc-500 text-xs`}>
                        Last Updated: January 20, 2026
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
};
