import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import tw from 'twrnc';

export const SkeletonCard = () => {
    const opacityAnim = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(opacityAnim, {
                    toValue: 0.7,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 0.3,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ])
        );
        pulse.start();
        return () => pulse.stop();
    }, []);

    return (
        <View style={tw`flex-row items-center p-5 mb-3 rounded-2xl border border-zinc-800 bg-zinc-900`}>
            {/* Logo Skeleton */}
            <Animated.View style={[
                tw`w-14 h-14 rounded-xl mr-4 bg-zinc-800`,
                { opacity: opacityAnim }
            ]} />

            {/* Info Skeleton */}
            <View style={tw`flex-1`}>
                <Animated.View style={[
                    tw`h-4 w-24 bg-zinc-800 rounded mb-2`,
                    { opacity: opacityAnim }
                ]} />
                <Animated.View style={[
                    tw`h-3 w-32 bg-zinc-800 rounded`,
                    { opacity: opacityAnim }
                ]} />
            </View>

            {/* Price Skeleton */}
            <View style={tw`items-end`}>
                <Animated.View style={[
                    tw`h-6 w-16 bg-zinc-800 rounded mb-1`,
                    { opacity: opacityAnim }
                ]} />
                <Animated.View style={[
                    tw`h-3 w-8 bg-zinc-800 rounded`,
                    { opacity: opacityAnim }
                ]} />
            </View>
        </View>
    );
};
