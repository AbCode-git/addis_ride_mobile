import React, { useState, useEffect } from 'react';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from './src/screens/HomeScreen';
import { LanguageProvider } from './src/i18n/LanguageContext';
import { ResultsScreen } from './src/screens/ResultsScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { PrivacyPolicyScreen } from './src/screens/PrivacyPolicyScreen';
import { TermsScreen } from './src/screens/TermsScreen';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createNativeStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const value = await AsyncStorage.getItem('hasSeenOnboarding');
        setHasSeenOnboarding(value === 'true');
      } catch (error) {
        console.log('Error checking onboarding status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkOnboarding();
  }, []);

  if (isLoading) {
    // Simple loading screen
    return <View style={{ flex: 1, backgroundColor: '#000000' }} />;
  }

  return (
    <ErrorBoundary>
      <LanguageProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <Stack.Navigator
            initialRouteName={hasSeenOnboarding ? "Home" : "Onboarding"}
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: '#000000' }
            }}
          >
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Results" component={ResultsScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
            <Stack.Screen name="Terms" component={TermsScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </LanguageProvider>
    </ErrorBoundary>
  );
}
