import { Text } from '@/components/ui/text';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AntDesign from '@expo/vector-icons/AntDesign';
import { Button } from '@/components/ui/button';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { Card } from '@/components/ui/card';
import { useAppForm } from '@/components/HookForm';
import { z } from 'zod';
import executeQuery, { executeInsertUpdate } from '@/lib/database';
import { toast } from 'sonner-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const schema = z.object({
  name: z.string().min(3),
  description: z.string(),
});

type WorkoutDetails = {
  id: string;
  name: string;
  description: string | null;
};

export default function EditWorkout() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const queryClient = useQueryClient();
  const { id: workoutId } = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(workoutId) ? workoutId[0] : workoutId;

  const updateMutation = useMutation({
    mutationFn: async (value: { name: string; description: string }) => {
      await executeInsertUpdate('updateWorkout', {
        $id: id,
        $name: value.name,
        $description: value.description,
      });
    },
    onSuccess: () => {
      toast.success('Workout Updated');
      queryClient.invalidateQueries({ queryKey: ['getWorkout'] });
      queryClient.invalidateQueries({ queryKey: ['workouts', id] });
      router.push('/(app)/(Workout)');
    },
    onError: (err) => {
      console.error(err);
      toast.error('Failed To Update Workout');
    },
  });
  const form = useAppForm({
    defaultValues: {
      name: '',
      description: '',
    },
    validators: {
      onChange: schema,
    },
    onSubmit: async ({ value, formApi }) => {
      await updateMutation.mutateAsync(value, {
        onSuccess: () => {
          formApi.reset();
        },
      });
    },
  });

  useQuery({
    queryKey: ['workouts', id],
    queryFn: async () => {
      const res = await executeQuery<WorkoutDetails>('getWorkoutById', { $id: id });
      const workout = res[0];
      console.log(res);
      if (!workout) return;
      form.setFieldValue('name', workout.name);
      form.setFieldValue('description', workout.description ?? '');
      return res;
    },
  });

  return (
    <SafeAreaView className="w-full p-5">
      <View className="w-full flex-row items-center gap-3">
        <Button
          size="icon"
          variant="ghost"
          className="rounded-full"
          onPress={() => router.push('/(app)/(Workout)')}>
          <AntDesign
            name="arrow-left"
            size={24}
            color={colorScheme === 'light' ? 'black' : 'white'}
          />
        </Button>
        <Text variant="h1">Edit Workout</Text>
      </View>
      <Card className="mt-5 p-5">
        <form.AppForm>
          <form.AppField name="name">
            {(field) => <field.FormTextField label="Workout Name" autoCapitalize="none" />}
          </form.AppField>
          <form.AppField name="description">
            {(field) => <field.FormTextArea label="Description" autoCapitalize="none" />}
          </form.AppField>
          <form.SubmitButton title="Submit" />
        </form.AppForm>
      </Card>
    </SafeAreaView>
  );
}
