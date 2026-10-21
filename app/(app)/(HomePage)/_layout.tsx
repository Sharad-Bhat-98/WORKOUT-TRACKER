import { Stack } from 'expo-router';

export default function Homepage() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="Session/[SessionLog]" />
    </Stack>
  );
}
