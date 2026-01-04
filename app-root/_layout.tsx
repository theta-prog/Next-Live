import {
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import {
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
    Oswald_400Regular,
    Oswald_500Medium,
    Oswald_600SemiBold,
    Oswald_700Bold,
} from '@expo-google-fonts/oswald';
import {
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import {
    RobotoCondensed_400Regular,
    RobotoCondensed_700Bold,
} from '@expo-google-fonts/roboto-condensed';
import {
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import { Platform } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppProvider } from '../src/context/AppContext';
import { AuthProvider } from '../src/context/AuthContext';
import AppNavigator from '../src/navigation/AppNavigator';

WebBrowser.maybeCompleteAuthSession();

// Inject global styles for Web to ensure full height
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  // Load Oswald font from Google Fonts for Web
  const link = document.createElement('link');
  link.href = 'https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&display=swap';
  link.rel = 'stylesheet';
  document.head.appendChild(link);

  const style = document.createElement('style');
  style.textContent = `
    html, body, #root {
      height: 100%;
      width: 100%;
      display: flex;
      flex-direction: column;
      overflow: auto;
    }
  `;
  document.head.appendChild(style);
}

export default function RootLayout() {
  let [fontsLoaded] = useFonts({
    RobotoCondensed_400Regular,
    RobotoCondensed_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Oswald_400Regular,
    Oswald_500Medium,
    Oswald_600SemiBold,
    Oswald_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppProvider>
          <AppNavigator />
          <StatusBar style="auto" />
        </AppProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
