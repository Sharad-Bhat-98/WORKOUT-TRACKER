import useDatabase from '@/hooks/useDatabase';
import { useUserStore } from '@/store/user';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';

SplashScreen.preventAutoHideAsync();

export default function InitialPage() {
  const setUser = useUserStore((s) => s.setUser);
  const [ready, setReady] = useState(false);
  const userId = useUserStore((s) => s.user_id);
  const router = useRouter();
  const { initDb, executeQuery } = useDatabase();

  useEffect(() => {
    if (!userId) {
      (async () => {
        await initDb();
        const res = await executeQuery<{ id: string; name: string }>('CheckForUser', {});
        if (res.length > 0) {
          setUser(res[0]?.id ?? '', res[0]?.name ?? '');
          router.replace('/(app)');
        } else router.replace('/(setup)');
        setReady(true);
      })();
    }
  }, [userId, router]);

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);
  if (!ready) return null;
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!userId}>
        <Stack.Screen name="(setup)" options={{ title: 'SETUP' }} />
      </Stack.Protected>
      <Stack.Protected guard={Boolean(userId)}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
    </Stack>
  );
}
