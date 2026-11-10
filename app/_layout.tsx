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
import { useUserStore } from '@/store/user';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { toast, Toaster } from 'sonner-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import useDatabase from '@/hooks/useDatabase';
import { SQLiteProvider } from 'expo-sqlite';
import { BackHandler } from 'react-native';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: 0 } } });
export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  return (
    <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
      <QueryClientProvider client={queryClient}>
        <SQLiteProvider databaseName="workout.db">
          <RootNavigator />
        </SQLiteProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

const RootNavigator = () => {
  const { colorScheme } = useColorScheme();

  const [ready, setReady] = useState(false);
  const userId = useUserStore((s) => s.user_id);
  const setUser = useUserStore((s) => s.setUser);
  const { initDb, executeQuery } = useDatabase();
  useEffect(() => {
    let cancelled = false;
    if (!userId) {
      (async () => {
        try {
          await initDb();
          const res = await executeQuery<{ id: string; name: string }>('CheckForUser', {});
          if (!cancelled && res[0]?.id) setUser(res[0].id, res[0].name);
        } catch (err) {
          console.error(err);
          toast.error('Failed To Create Init Table');
          BackHandler.exitApp(); // close the app works only on android
        } finally {
          if (!cancelled) setReady(true);
        }
      })();
    }
    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);
  if (!ready) return null;

  return (
    <>
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
    </>
  );
};
