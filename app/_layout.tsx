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

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  const [ready, setReady] = useState(false);
  const userStore = useUserStore();

  useEffect(() => {
    (async () => {
      await initDb();
      const res = await executeQuery<{ id: string; name: string }>('CheckForUser', {});
      if (res.length > 0) userStore.setUser(res[0]?.id ?? '', res[0]?.name ?? '');
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);
  if (!ready) return null;

  return (
    <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <View className={colorScheme === 'dark' ? 'dark flex-1' : 'flex-1'}>
        <SafeAreaProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Protected guard={!userStore.user_id}>
              <Stack.Screen name="(setup)" options={{ title: 'SETUP' }} />
            </Stack.Protected>
            <Stack.Protected guard={Boolean(userStore.user_id)}>
              <Stack.Screen name="(app)" />
            </Stack.Protected>
          </Stack>
        </SafeAreaProvider>
      </View>
      <PortalHost />
    </ThemeProvider>
  );
}
