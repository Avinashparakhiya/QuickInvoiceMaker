import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { SplashScreen } from './src/features/onboarding/SplashScreen';
import { OnboardingScreen } from './src/features/onboarding/OnboardingScreen';
import { colors } from './src/theme/colors';

const ONBOARDING_KEY = '@quick_invoice_onboarding_complete';

type AppState = 'splash' | 'onboarding' | 'app';

export default function App() {
  const { width } = useWindowDimensions();
  const isLargeWebScreen = Platform.OS === 'web' && width > 520;
  const [appState, setAppState] = useState<AppState>('splash');

  useEffect(() => {
    // Check if onboarding was already completed
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    try {
      if (Platform.OS === 'web') {
        const done = localStorage.getItem(ONBOARDING_KEY);
        if (done === 'true') {
          // Still show splash, but skip onboarding after
          return;
        }
      } else {
        const done = await AsyncStorage.getItem(ONBOARDING_KEY);
        if (done === 'true') {
          return;
        }
      }
    } catch (e) {
      // Ignore errors, show onboarding
    }
  };

  const handleSplashFinish = async () => {
    try {
      let onboardingDone = false;
      if (Platform.OS === 'web') {
        onboardingDone = localStorage.getItem(ONBOARDING_KEY) === 'true';
      } else {
        const val = await AsyncStorage.getItem(ONBOARDING_KEY);
        onboardingDone = val === 'true';
      }

      if (onboardingDone) {
        setAppState('app');
      } else {
        setAppState('onboarding');
      }
    } catch {
      setAppState('onboarding');
    }
  };

  const handleOnboardingComplete = async () => {
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem(ONBOARDING_KEY, 'true');
      } else {
        await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      }
    } catch (e) {
      // Continue even if storage fails
    }
    setAppState('app');
  };

  const renderContent = () => {
    switch (appState) {
      case 'splash':
        return <SplashScreen onFinish={handleSplashFinish} />;
      case 'onboarding':
        return <OnboardingScreen onComplete={handleOnboardingComplete} />;
      case 'app':
        return (
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        );
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" backgroundColor={colors.background} />
      <View style={isLargeWebScreen ? styles.webWrapper : styles.fullScreen}>
        <View style={isLargeWebScreen ? styles.webMobileFrame : styles.fullScreen}>
          {renderContent()}
        </View>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  webWrapper: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  webMobileFrame: {
    width: '100%',
    maxWidth: 480,
    height: '100%',
    maxHeight: 960,
    backgroundColor: colors.background,
    overflow: 'hidden',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#334155',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
  },
});
