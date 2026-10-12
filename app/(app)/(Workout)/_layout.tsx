import BackButton from '@/components/BackButton';
import AddButton from '@/components/AddButton';
import { Stack } from 'expo-router';

export default function WorkoutLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Workout',
          headerRight: () => <AddButton path="/(app)/(Workout)/CreateWorkout" />,
        }}
      />
      <Stack.Screen
        name="CreateWorkout"
        options={{
          title: 'Create Workout',
          headerLeft: () => <BackButton path="/(app)/(Workout)" />,
        }}
      />
      <Stack.Screen
        name="EditWorkout"
        options={{
          title: 'Edit Workout',
          headerLeft: () => <BackButton path="/(app)/(Workout)" />,
        }}
      />
      <Stack.Screen name="WorkoutExerciseMap" options={{ headerShown: false }} />
    </Stack>
  );
}
