import '@/global.css';

import { NAV_THEME } from '@/lib/theme';
import { ThemeProvider } from 'expo-router/react-navigation';
import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import * as SplashScreen from 'expo-splash-screen';
import { useState, useEffect } from 'react';

// Catch any errors thrown by the Layout component.
export { ErrorBoundary } from 'expo-router';
import executeQuery, { initDb } from '@/lib/database';
import { useUserStore } from '@/store/user';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Toaster } from 'sonner-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();
export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  const [ready, setReady] = useState(false);
  const userId = useUserStore((s) => s.user_id);
  const setUser = useUserStore((s) => s.setUser);

  useEffect(() => {
    if (!userId) {
      (async () => {
        await initDb();
        const res = await executeQuery<{ id: string; name: string }>('CheckForUser', {});
        if (res.length > 0) setUser(res[0]?.id ?? '', res[0]?.name ?? '');
        setReady(true);
      })();
    }
  }, [userId]);

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);
  if (!ready) return null;

  return (
    <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <View className={colorScheme === 'dark' ? 'dark flex-1' : 'flex-1'}>
          <SafeAreaProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Protected guard={!userId}>
                  <Stack.Screen name="(setup)" options={{ title: 'SETUP' }} />
                </Stack.Protected>
                <Stack.Protected guard={Boolean(userId)}>
                  <Stack.Screen name="(app)" />
                </Stack.Protected>
              </Stack>
              <Toaster />
            </GestureHandlerRootView>
          </SafeAreaProvider>
          <PortalHost />
        </View>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
