import { useAppForm } from '@/components/HookForm';
import { Card } from '@/components/ui/card';
import executeQuery, { executeInsertUpdate } from '@/lib/database';
import { ImageType } from '@/types/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View } from 'react-native';
import { toast } from 'sonner-native';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(3),
  image: z.string(),
});

type ExerciseDetails = {
  id: string;
  name: string;
  image: string | null;
};

export default function EditExercise() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id: exerciseId } = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(exerciseId) ? exerciseId[0] : exerciseId;

  const imagesQuery = useQuery({
    queryKey: ['getImages'],
    queryFn: async () => await executeQuery<ImageType>('getImages', {}),
  });

  const updateMutation = useMutation({
    mutationFn: async (value: { name: string; image: string }) => {
      await executeInsertUpdate('updateExercise', {
        $id: id,
        $name: value.name,
        $image: value.image,
      });
    },
    onSuccess: () => {
      toast.success('Exercise Updated');
      queryClient.invalidateQueries({ queryKey: ['getExercise'] });
      queryClient.invalidateQueries({ queryKey: ['exercises', id] });
      router.push('/(app)/(Exercises)');
    },
    onError: (err) => {
      console.error(err);
      toast.error('Failed To Update Exercise');
    },
  });

  const form = useAppForm({
    defaultValues: {
      name: '',
      image: '',
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
    queryKey: ['exercises', id],
    enabled: !!id,
    queryFn: async () => {
      const res = await executeQuery<ExerciseDetails>('getExerciseById', { $id: id });
      const exercise = res[0];
      if (!exercise) return;
      form.setFieldValue('name', exercise.name);
      form.setFieldValue('image', exercise.image ?? '');
      return res;
    },
  });

  return (
    <View className="w-full px-5">
      <Card className="p-5">
        <form.AppForm>
          <form.AppField name="name">
            {(field) => <field.FormTextField label="Exercise Name" autoCapitalize="none" />}
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
          <form.SubmitButton title="Submit" />
        </form.AppForm>
      </Card>
    </View>
  );
}
