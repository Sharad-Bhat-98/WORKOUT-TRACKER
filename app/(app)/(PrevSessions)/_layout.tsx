import BackButton from '@/components/BackButton';
import { Stack } from 'expo-router';

export default function PrevSession() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="index"
        options={{
          headerShown: true,
          title: 'Prev Sessions',
          headerLeft: () => <BackButton path="/(HomePage)" />,
        }}
      />
      <Stack.Screen
        name="[EditSession]"
        options={{
          headerShown: true,
          title: '',
          headerLeft: () => <BackButton path="/(app)/(PrevSessions)" />,
        }}
      />
    </Stack>
  );
}
