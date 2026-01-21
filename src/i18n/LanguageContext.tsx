import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TRANSLATIONS } from './translations';
import { I18nManager } from 'react-native';

type Language = 'en' | 'am';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: keyof typeof TRANSLATIONS['en'], ...args: any[]) => string;
}

const LanguageContext = createContext<LanguageContextType>({
    language: 'en',
    setLanguage: () => { },
    t: () => '',
});

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
    const [language, setLangState] = useState<Language>('en');

    useEffect(() => {
        const load = async () => {
            const saved = await AsyncStorage.getItem('app_language');
            if (saved === 'en' || saved === 'am') {
                setLangState(saved);
            }
        };
        load();
    }, []);

    const setLanguage = async (lang: Language) => {
        setLangState(lang);
        await AsyncStorage.setItem('app_language', lang);
    };

    const t = (key: string, ...args: any[]) => {
        const dict = TRANSLATIONS[language];
        let text = (dict as any)[key] || key;

        // Simple interpolation {0}, {1}...
        args.forEach((arg, index) => {
            text = text.replace(`{${index}}`, arg);
        });

        return text;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
