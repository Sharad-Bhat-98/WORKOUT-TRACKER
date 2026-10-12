import BackButton from '@/components/BackButton';
import { Stack, Tabs } from 'expo-router';
// this component is used beacuse router.back() was not working
export default function WorkoutLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="(Workout)/CreateWorkout"
        options={{
          title: 'Create Workout',
          headerLeft: () => <BackButton path="/(app)/(Workout)" />,
          headerShown: true,
          href: null,
        }}
      />

      <Tabs.Screen
        name="(Workout)/WorkoutExerciseMap"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="(Workout)/EditWorkout"
        options={{
          title: 'Edit Workout',
          headerLeft: () => <BackButton path="/(app)/(Workout)" />,
          headerShown: true,
          href: null,
        }}
      />
    </Stack>
  );
}
