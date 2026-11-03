import '@/global.css';

import { NAV_THEME } from '@/lib/theme';
import { ThemeProvider } from 'expo-router/react-navigation';
import { PortalHost } from '@rn-primitives/portal';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import * as SplashScreen from 'expo-splash-screen';
import { useState, useEffect } from 'react';

// Catch any errors thrown by the Layout component.
export { ErrorBoundary } from 'expo-router';
import { useUserStore } from '@/store/user';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Toaster } from 'sonner-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SQLiteProvider } from 'expo-sqlite';
import { Stack } from 'expo-router';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: 0 } } });
export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  // const userId = useUserStore((s) => s.user_id);

  return (
    <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
      <SQLiteProvider databaseName="workout.db">
        <QueryClientProvider client={queryClient}>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          <View className={colorScheme === 'dark' ? 'dark flex-1' : 'flex-1'}>
            <SafeAreaProvider>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="index" />
                </Stack>
                <Toaster />
              </GestureHandlerRootView>
            </SafeAreaProvider>
            <PortalHost />
          </View>
        </QueryClientProvider>
      </SQLiteProvider>
    </ThemeProvider>
  );
}
