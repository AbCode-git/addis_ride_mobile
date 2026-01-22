import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import tw from 'twrnc';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, Zap, Globe, ChevronRight } from 'lucide-react-native';
import { useLanguage } from '../i18n/LanguageContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

interface OnboardingScreenProps {
    navigation: any;
}

export const OnboardingScreen = ({ navigation }: OnboardingScreenProps) => {
    const { t } = useLanguage();
    const [currentSlide, setCurrentSlide] = useState(0);
    const scrollViewRef = useRef<ScrollView>(null);

    const slides = [
        {
            icon: MapPin,
            title: t('onboarding.slide1.title'),
            description: t('onboarding.slide1.description'),
            color: '#818CF8',
        },
        {
            icon: Zap,
            title: t('onboarding.slide2.title'),
            description: t('onboarding.slide2.description'),
            color: '#F43F5E',
        },
        {
            icon: Globe,
            title: t('onboarding.slide3.title'),
            description: t('onboarding.slide3.description'),
            color: '#10B981',
        },
    ];

    const handleNext = () => {
        if (currentSlide < slides.length - 1) {
            const nextSlide = currentSlide + 1;
            setCurrentSlide(nextSlide);
            scrollViewRef.current?.scrollTo({
                x: nextSlide * width,
                animated: true,
            });
        } else {
            completeOnboarding();
        }
    };

    const handleSkip = () => {
        completeOnboarding();
    };

    const completeOnboarding = async () => {
        await AsyncStorage.setItem('hasSeenOnboarding', 'true');
        await AsyncStorage.setItem('justCompletedOnboarding', 'true');
        navigation.replace('Home');
    };

    const onScroll = (event: any) => {
        const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
        setCurrentSlide(slideIndex);
    };

    return (
        <View style={tw`flex-1 bg-black`}>
            {/* Skip Button */}
            <View style={tw`absolute top-12 right-6 z-10`}>
                <TouchableOpacity onPress={handleSkip} style={tw`px-4 py-2`}>
                    <Text style={tw`text-indigo-400 font-bold text-sm`}>{t('onboarding.skip')}</Text>
                </TouchableOpacity>
            </View>

            {/* Slides */}
            <ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={onScroll}
                scrollEventThrottle={16}
                style={tw`flex-1`}
            >
                {slides.map((slide, index) => {
                    const Icon = slide.icon;
                    return (
                        <View key={index} style={[tw`flex-1 justify-center items-center px-10`, { width }]}>
                            {/* Icon */}
                            <View style={[tw`w-24 h-24 rounded-full items-center justify-center mb-8`, { backgroundColor: `${slide.color}20` }]}>
                                <Icon size={48} color={slide.color} />
                            </View>

                            {/* Title */}
                            <Text style={tw`text-white font-bold text-3xl text-center mb-6`}>
                                {slide.title}
                            </Text>

                            {/* Description */}
                            <Text style={tw`text-zinc-400 text-base text-center leading-6 px-4`}>
                                {slide.description}
                            </Text>
                        </View>
                    );
                })}
            </ScrollView>

            {/* Bottom Controls */}
            <View style={tw`pb-12 px-6`}>
                {/* Pagination Dots */}
                <View style={tw`flex-row justify-center mb-8`}>
                    {slides.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                tw`h-2 rounded-full mx-1`,
                                {
                                    width: currentSlide === index ? 24 : 8,
                                    backgroundColor: currentSlide === index ? '#818CF8' : '#3F3F46',
                                },
                            ]}
                        />
                    ))}
                </View>

                {/* Next/Get Started Button */}
                <TouchableOpacity onPress={handleNext} activeOpacity={0.85}>
                    <LinearGradient
                        colors={['#818CF8', '#6366F1', '#4F46E5']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={tw`h-14 rounded-xl flex-row items-center justify-center shadow-lg`}
                    >
                        <Text style={tw`text-white font-black text-base uppercase tracking-wide`}>
                            {currentSlide === slides.length - 1 ? t('onboarding.getStarted') : t('onboarding.next')}
                        </Text>
                        <ChevronRight size={20} color="#FFFFFF" style={tw`ml-2`} />
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
};
