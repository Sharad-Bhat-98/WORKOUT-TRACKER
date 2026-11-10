import BackButton from '@/components/BackButton';
import { Stack } from 'expo-router';

export default function PrevSession() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Prev Sessions',
          headerLeft: () => <BackButton path="/(app)/(HomePage)" />,
        }}
      />
      <Stack.Screen
        name="[EditSession]"
        options={{
          title: '',
          headerLeft: () => <BackButton path="/(app)/PrevSessions" />,
        }}
      />
    </Stack>
  );
}
