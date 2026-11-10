import { useLocalSearchParams, useRouter } from 'expo-router';
import { Card } from '@/components/ui/card';
import { useAppForm } from '@/components/HookForm';
import { z } from 'zod';
import useWorkoutExerciseStore from '@/store/WorkoutExerciseMap';
import { SafeAreaView } from 'react-native-safe-area-context';

const positiveInt = (message: string) =>
  z.string().refine((value) => {
    const n = Number(value);
    return Number.isInteger(n) && n > 0;
  }, message);

const schema = z.object({
  ExerciseName: z.string(),
  sets: positiveInt('Number of sets must be a whole number greater than 0'),
  position: positiveInt('Position must be a whole number greater than 0'),
});

export default function WorkoutExerciseMap() {
  const append = useWorkoutExerciseStore((s) => s.upsert);
  const router = useRouter();
  const {
    name: exerciseName,
    id,
    position,
    sets,
  } = useLocalSearchParams<{
    id: string;
    name: string;
    position: string;
    sets: string;
  }>();
  const name = Array.isArray(exerciseName) ? exerciseName[0] : (exerciseName ?? '');

  const form = useAppForm({
    defaultValues: {
      ExerciseName: name,
      sets: sets ? String(sets) : '',
      position: position ? String(position) : '',
    },
    validators: {
      onChange: schema,
    },
    onSubmit: async ({ value, formApi }) => {
      const obj = { sets: Number(value.sets), position: Number(value.position), id };
      append(obj);
      formApi.reset();
      router.back();
    },
  });

  return (
    <SafeAreaView className="w-full px-5">
      <Card className="p-5">
        <form.AppForm>
          <form.AppField name="ExerciseName">
            {(field) => (
              <field.FormTextField label="Exercise Name" editable={false} autoCapitalize="none" />
            )}
          </form.AppField>
          <form.AppField name="sets">
            {(field) => (
              <field.FormTextField
                label="Number of Sets"
                keyboardType="numeric"
                autoCapitalize="none"
              />
            )}
          </form.AppField>
          <form.AppField name="position">
            {(field) => (
              <field.FormTextField label="Position" keyboardType="numeric" autoCapitalize="none" />
            )}
          </form.AppField>
          <form.SubmitButton title="Submit" />
        </form.AppForm>
      </Card>
    </SafeAreaView>
  );
}
