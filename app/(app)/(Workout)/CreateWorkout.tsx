import { Text } from '@/components/ui/text';
import { Image, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AntDesign from '@expo/vector-icons/AntDesign';
import { Button } from '@/components/ui/button';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppForm } from '@/components/HookForm';
import { z } from 'zod';
import executeQuery, { executeInsertUpdate } from '@/lib/database';
import * as Crypto from 'expo-crypto';
import { useUserStore } from '@/store/user';
import { toast } from 'sonner-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getExceriseType, ImageType } from '@/types/types';
import { Checkbox } from '@/components/ui/checkbox';
import { useState } from 'react';

const schema = z.object({
  name: z.string(),
  image: z.string(),
  description: z.string(),
});
export default function CreateWorkout() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const userStore = useUserStore();
  const queryClient = useQueryClient();
  const [exercisesList, setExercisesList] = useState<string[]>([]);

  const createMutation = useMutation({
    mutationFn: async (value: { name: string; description: string; image: string }) => {
      const id = Crypto.randomUUID();
      await executeInsertUpdate('createWorkout', {
        $id: id,
        $name: value.name,
        $user_id: userStore.user_id,
        $description: value.description,
        $image: value.image,
      });
    },
    onSuccess: () => {
      toast.success('Workout Created');
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

  const excerises = useQuery({
    queryKey: ['getExcerise'],
    queryFn: async () => await executeQuery<getExceriseType>('getExcerise', {}),
  });

  if (excerises.isError) toast.error('Failed To Fetch Excerises');

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
      if (exercisesList.length === 0) {
        toast.warning('Please Select Excerise');
        return;
      }
      await createMutation.mutateAsync(value, {
        onSuccess: () => {
          formApi.reset();
        },
      });
    },
  });

  const handleExerciseClick = (e: getExceriseType) => {
    if (e.name in exercisesList) setExercisesList((s) => s.filter((item) => item !== e.name));
    else setExercisesList((s) => [...s, e.name]);
  };
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
        <Text variant="h2" className="text-center">
          Create Workout
        </Text>
      </View>
      <Card className="mt-5 p-5">
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

      <ScrollView className="mt-3 gap-4">
        <Text variant="h4" className="text-center">
          Add Exercises
        </Text>
        {excerises.isLoading ? (
          <Text variant="p" className="text-center">
            LOADING.....
          </Text>
        ) : (
          excerises.data?.map((e) => (
            <Pressable key={e.id} onPress={() => handleExerciseClick(e)} className="gap-2">
              <Card className="flex-row items-center justify-between">
                <View className="ml-4 rounded-md bg-primary p-1">
                  <Image
                    source={{ uri: `data:image/png;base64,${e.image}` }}
                    style={{ width: 70, height: 70 }}
                  />
                </View>
                <CardHeader className="flex-1">
                  <CardTitle>{e.name}</CardTitle>
                </CardHeader>
                <Checkbox
                  checked={e.name in exercisesList}
                  onCheckedChange={() => handleExerciseClick(e)}
                />
              </Card>
            </Pressable>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
