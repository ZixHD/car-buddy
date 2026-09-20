import '@/global.css';
import '@/i18n';

import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="vehicle/new" options={{ presentation: 'modal' }} />
              <Stack.Screen name="vehicle/[id]/index" options={{ title: '' }} />
              <Stack.Screen name="vehicle/[id]/edit" options={{ presentation: 'modal' }} />
              <Stack.Screen name="vehicle/[id]/odometer/new" options={{ presentation: 'modal' }} />
              <Stack.Screen name="vehicle/[id]/service/new" options={{ presentation: 'modal' }} />
              <Stack.Screen name="vehicle/[id]/interval/new" options={{ presentation: 'modal' }} />
              <Stack.Screen name="vehicle/[id]/interval/[intervalId]" options={{ presentation: 'modal' }} />
            </Stack>
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
