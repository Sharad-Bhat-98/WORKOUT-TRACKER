import { useAppForm } from '@/components/HookForm';
import { Card } from '@/components/ui/card';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import * as Crypto from 'expo-crypto';
import executeQuery, { executeInsertUpdate } from '@/lib/database';
import { useUserStore } from '@/store/user';
import { toast } from 'sonner-native';
import { z } from 'zod';
import { ImageType } from '@/types/types';
import { View } from 'react-native';

const schema = z.object({
  name: z.string().min(3),
  image: z.string(),
});

export default function CreateExercise() {
  const router = useRouter();
  const userId = useUserStore((s) => s.user_id);
  const queryClient = useQueryClient();

  const imagesQuery = useQuery({
    queryKey: ['getImages'],
    queryFn: async () => await executeQuery<ImageType>('getImages', {}),
  });
  const createMutation = useMutation({
    mutationFn: async (value: { name: string; image: string }) => {
      const id = Crypto.randomUUID();
      await executeInsertUpdate('createExercise', {
        $id: id,
        $name: value.name,
        $user_id: userId,
        $image: value.image,
      });
    },
    onSuccess: () => {
      toast.success('Exercise Created');
      queryClient.invalidateQueries({ queryKey: ['getExercise'] });
      router.push('/(app)/(Exercises)');
    },
    onError: (err) => {
      console.error(err);
      toast.error('Failed To create Workout');
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
      await createMutation.mutateAsync(value, {
        onSuccess: () => {
          formApi.reset();
        },
      });
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
