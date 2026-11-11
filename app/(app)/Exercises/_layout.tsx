import AddButton from '@/components/AddButton';
import BackButton from '@/components/BackButton';
import { Stack } from 'expo-router';

export default function ExerciseLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Exercise',
          headerRight: () => <AddButton path="/Exercises/CreateExercises" />,
        }}
      />
      <Stack.Screen
        name="CreateExercises"
        options={{
          title: 'Create Exercise',
          headerLeft: () => <BackButton path="/Exercises" />,
        }}
      />
      <Stack.Screen
        name="EditExercise"
        options={{
          title: 'Edit Exercise',
          headerLeft: () => <BackButton path="/Exercises" />,
        }}
      />
    </Stack>
  );
}
