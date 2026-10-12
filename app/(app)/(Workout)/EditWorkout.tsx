import { Pressable, ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Card } from '@/components/ui/card';
import { useAppForm } from '@/components/HookForm';
import { z } from 'zod';
import executeQuery, { executeInsertUpdate } from '@/lib/database';
import { toast } from 'sonner-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Text } from '@/components/ui/text';
import ImageCard from '@/components/ImageCard';
import { Checkbox } from '@/components/ui/checkbox';
import { getExerciseType, getWorkoutByIdType } from '@/types/types';
import { useUserStore } from '@/store/user';
import useWorkoutExerciseStore, { WorkoutExercise } from '@/store/WorkoutExerciseMap';
import { useState } from 'react';

const schema = z.object({
  name: z.string().min(3, 'Workout name must be at least 3 characters'),
  description: z.string(),
});

export default function EditWorkout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id: workoutId } = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(workoutId) ? workoutId[0] : workoutId;
  const userId = useUserStore((s) => s.user_id);
  const [selectedExercisesPrev, setSelectedExercisesPrev] = useState<
    Record<string, WorkoutExercise>
  >({});
  const selectedExercises = useWorkoutExerciseStore((s) => s.formData);
  const resetExercise = useWorkoutExerciseStore((s) => s.reset);
  const deleteExercise = useWorkoutExerciseStore((s) => s.remove);
  const updateMultiple = useWorkoutExerciseStore((s) => s.updateMultiple);

  const updateMutation = useMutation({
    mutationFn: async (value: { name: string; description: string }) => {
      await executeInsertUpdate('updateWorkout', {
        $id: id,
        $name: value.name,
        $description: value.description,
      });
      const promiseArr: ReturnType<typeof executeInsertUpdate>[] = [];
      Object.entries(selectedExercises).forEach(([key, value]) => {
        // in both prev and curr so check weather values have changed
        if (key in selectedExercisesPrev) {
          const prevValue = selectedExercisesPrev[key];
          if (value.position !== prevValue.position || value.sets !== prevValue.sets) {
            // something has changed so run update query
            promiseArr.push(
              executeInsertUpdate('updateWorkoutExercise', {
                $position: value.position,
                $targetSets: value.sets,
                $exeriseId: key,
                $workoutId: id,
              })
            );
          }
        } else {
          // its not in prev its in curr that means its an executeInsertUpdate
          promiseArr.push(
            executeInsertUpdate('insertWorkoutExercises', {
              $WorkoutId: id,
              $ExerciseId: key,
              $Position: value.position,
              $Sets: value.sets,
            })
          );
        }
      });

      Object.entries(selectedExercisesPrev).forEach(([key, _]) => {
        if (!selectedExercises[key]) {
          // in prev not in current means delete
          promiseArr.push(
            executeInsertUpdate('deleteWorkoutExercise', {
              $exeriseId: key,
              $workoutId: id,
            })
          );
        }
      });

      await Promise.all(promiseArr);
    },
    onSuccess: () => {
      toast.success('Workout Updated');
      queryClient.invalidateQueries({ queryKey: ['getWorkout'] });
      queryClient.invalidateQueries({ queryKey: ['workouts', id] });
      router.push('/(app)/(Workout)');
      resetExercise();
    },
    onError: (err) => {
      console.error(err);
      toast.error('Failed To Update Workout');
    },
  });

  const exercises = useQuery({
    queryKey: ['getExercise'],
    enabled: !!userId,
    queryFn: async () => await executeQuery<getExerciseType>('getExercise', { $userId: userId }),
  });

  if (exercises.isError) toast.error('Failed To Fetch Exercises');

  useQuery({
    queryKey: ['getWorkoutExerciseById', id],
    enabled: !!id,
    queryFn: async () => {
      const res = await executeQuery<WorkoutExercise>('getWorkoutExerciseById', {
        $workoutId: id,
      });
      const exerciseObj = res.reduce((acc, cur) => ({ ...acc, [cur.id]: cur }), {});
      setSelectedExercisesPrev(exerciseObj);
      resetExercise();
      updateMultiple(res);
      return true;
    },
  });

  const workoutQuery = useQuery({
    queryKey: ['getWorkoutById', id],
    enabled: !!id,
    queryFn: async () => {
      const res = await executeQuery<getWorkoutByIdType>('getWorkoutById', { $id: id });
      return res[0];
    },
  });
  const formValue = workoutQuery.data;
  const form = useAppForm({
    defaultValues: {
      name: formValue?.name ?? '',
      description: formValue?.description ?? '',
    },
    validators: {
      onChange: schema,
      onSubmit: schema,
    },
    onSubmit: async ({ value, formApi }) => {
      await updateMutation.mutateAsync(value, {
        onSuccess: () => {
          formApi.reset();
        },
      });
    },
  });

  const handlePress = (e: getExerciseType) => {
    if (selectedExercises[e.id]) deleteExercise(e.id);
    else {
      // const record = selectedExercises[e.id];
      router.push({
        pathname: '/(app)/(Workout)/WorkoutExerciseMap',
        params: { id: e.id, name: e.name },
      });
    }
  };
  return (
    <View className="w-full flex-1 px-5">
      <Card className="p-5">
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
                    onCheckedChange={() => handlePress(e)}
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
