import { Text } from '@/components/ui/text';
import { Pressable, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from '@/components/ui/card';
import { useAppForm } from '@/components/HookForm';
import { z } from 'zod';
import executeQuery, { executeInsertUpdate } from '@/lib/database';
import * as Crypto from 'expo-crypto';
import { useUserStore } from '@/store/user';
import { toast } from 'sonner-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getExerciseType, ImageType } from '@/types/types';
import { Checkbox } from '@/components/ui/checkbox';
import ImageCard from '@/components/ImageCard';
import useWorkoutExerciseStore from '@/store/WorkoutExerciseMap';

const schema = z.object({
  name: z.string(),
  image: z.string(),
  description: z.string(),
});
export default function CreateWorkout() {
  const router = useRouter();
  const userId = useUserStore((s) => s.user_id);
  const queryClient = useQueryClient();
  const selectedExercises = useWorkoutExerciseStore((s) => s.formData);
  const resetExercise = useWorkoutExerciseStore((s) => s.reset);
  const deleteExercise = useWorkoutExerciseStore((s) => s.remove);

  const createMutation = useMutation({
    mutationFn: async (value: { name: string; description: string; image: string }) => {
      const id = Crypto.randomUUID();
      await executeInsertUpdate('createWorkout', {
        $id: id,
        $name: value.name,
        $user_id: userId,
        $description: value.description,
        $image: value.image,
      });
      const promiseArr = Object.values(selectedExercises).map((value) => {
        return executeInsertUpdate('insertWorkoutExercises', {
          $WorkoutId: id,
          $ExerciseId: value.id,
          $Position: value.position,
          $Sets: value.sets,
        });
      });
      await Promise.allSettled(promiseArr);
    },
    onSuccess: () => {
      toast.success('Workout Created');
      resetExercise();
      queryClient.invalidateQueries({ queryKey: ['getWorkout'] });
      router.push('/(app)/(Workout)');
    },
    onError: (err) => {
      console.error(err);
      toast.error('Failed To create Workout');
    },
  });

  const imagesQuery = useQuery({
    queryKey: ['getImages'],
    queryFn: async () => await executeQuery<ImageType>('getImages', {}),
  });

  const exercises = useQuery({
    queryKey: ['getExercise'],
    enabled: !!userId,
    queryFn: async () => await executeQuery<getExerciseType>('getExercise', { $userId: userId }),
  });

  if (exercises.isError) toast.error('Failed To Fetch Exercises');

  const form = useAppForm({
    defaultValues: {
      name: '',
      image: '',
      description: '',
    },
    validators: {
      onChange: schema,
    },
    onSubmit: async ({ value, formApi }) => {
      if (Object.keys(selectedExercises).length === 0) {
        toast.warning('Please Select Exercise');
        return;
      }
      await createMutation.mutateAsync(value, {
        onSuccess: () => {
          formApi.reset();
        },
      });
    },
  });

  const handlePress = (e: getExerciseType) => {
    if (selectedExercises[e.id]) deleteExercise(e.id);
    else {
      router.push({
        pathname: '/(app)/(Workout)/WorkoutExerciseMap',
        params: { id: e.id, name: e.name },
      });
    }
  };
  console.log(exercises.data?.map((e) => e.name));
  return (
    <View className="w-full flex-1 px-5">
      <Card className="p-5">
        <form.AppForm>
          <form.AppField name="name">
            {(field) => <field.FormTextField label="Workout Name" autoCapitalize="none" />}
          </form.AppField>
          <form.AppField name="image">
            {(field) => (
              <field.FormSelect
                label="Select Image"
                placeholder="Image"
                items={imagesQuery.data?.map((e) => e.name) ?? []}
              />
            )}
          </form.AppField>
          <form.AppField name="description">
            {(field) => <field.FormTextArea label="Description" autoCapitalize="none" />}
          </form.AppField>
          <form.SubmitButton title="Submit" />
        </form.AppForm>
      </Card>

      <Text variant="h4" className="pb-2 text-center">
        Add Exercises
      </Text>
      <ScrollView className="mt-3" contentContainerClassName="gap-4">
        {exercises.isLoading ? (
          <Text variant="p" className="text-center">
            LOADING.....
          </Text>
        ) : (
          exercises.data?.map((e) => (
            <Pressable key={e.id} onPress={() => handlePress(e)} className="gap-2">
              <ImageCard
                title={e.name}
                imageData={e.image}
                footer={
                  <Checkbox
                    checked={selectedExercises[e.id] !== undefined}
                    className="border-primary"
                    onCheckedChange={() => {}}
                  />
                }
              />
            </Pressable>
          ))
        )}
      </ScrollView>
    </View>
  );
}
