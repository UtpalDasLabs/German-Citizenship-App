import { Stack } from 'expo-router';
import Head from 'expo-router/head';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { registerServiceWorker } from '@/lib/durability';
import { ProgressProvider } from '@/store/ProgressProvider';
import { SettingsProvider } from '@/store/SettingsProvider';
import { ThemeProvider, useTheme } from '@/theme/ThemeProvider';

function Navigator() {
  const { colors, dark } = useTheme();
  return (
    <>
      {/* expo-router renders a helmet-managed <title> into the head; without a
          value here it emits an empty one and the tab shows nothing. */}
      <Head>
        <title>LID-test</title>
        <meta name="description" content="Learn all 460 official German citizenship test questions." />
      </Head>
      <StatusBar style={dark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="study" options={{ presentation: 'card' }} />
        <Stack.Screen name="practice" />
        <Stack.Screen name="plan" />
        <Stack.Screen name="learn" />
        <Stack.Screen name="exam-session" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SettingsProvider>
          <ProgressProvider>
            <ThemeProvider>
              <Navigator />
            </ThemeProvider>
          </ProgressProvider>
        </SettingsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
