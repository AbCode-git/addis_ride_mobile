import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import tw from 'twrnc';
import { Home, Briefcase, Calendar, Shield, Settings, LucideIcon } from 'lucide-react-native';

export interface InteractiveMenuItem {
    label: string;
    icon: LucideIcon;
}

export interface InteractiveMenuProps {
    items?: InteractiveMenuItem[];
    accentColor?: string;
}

const defaultItems: InteractiveMenuItem[] = [
    { label: 'Home', icon: Home },
    { label: 'Compare', icon: Briefcase },
    { label: 'History', icon: Calendar },
    { label: 'Trust', icon: Shield },
    { label: 'Settings', icon: Settings },
];

export const InteractiveMenu: React.FC<InteractiveMenuProps> = ({ items, accentColor = '#4F46E5' }) => {
    const finalItems = useMemo(() => {
        const isValid = items && Array.isArray(items) && items.length >= 2 && items.length <= 5;
        if (!isValid) {
            return defaultItems;
        }
        return items;
    }, [items]);

    const [activeIndex, setActiveIndex] = useState(0);

    return (
        <View style={tw`flex-row justify-between items-center bg-white px-6 py-4 rounded-3xl shadow-lg border border-slate-50`}>
            {finalItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = index === activeIndex;

                return (
                    <TouchableOpacity
                        key={item.label}
                        onPress={() => setActiveIndex(index)}
                        activeOpacity={0.7}
                        style={tw`items-center justify-center`}
                    >
                        {/* Icon Container with Animated-like properties (manual in this MVP) */}
                        <View style={tw`mb-1 ${isActive ? '-translate-y-1' : ''}`}>
                            <Icon
                                size={24}
                                color={isActive ? accentColor : '#94A3B8'}
                                strokeWidth={isActive ? 2.5 : 2}
                            />
                        </View>

                        {/* Label - Visible only when active or always visible but bold? 
                The original design had text appearing. Let's keep it visible but stylized.
            */}
                        <Text style={[
                            tw`text-[10px] uppercase tracking-wider`,
                            isActive ? { color: accentColor, fontWeight: '800' } : tw`text-slate-400 font-medium`
                        ]}>
                            {item.label}
                        </Text>

                        {/* Active Indicator Dot */}
                        {isActive && (
                            <View style={[
                                tw`absolute -bottom-2 w-1 h-1 rounded-full`,
                                { backgroundColor: accentColor }
                            ]} />
                        )}
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};
