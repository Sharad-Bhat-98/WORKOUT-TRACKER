import { z } from 'zod';
import { useAppForm } from '@/components/HookForm';
import { View } from 'react-native';
import * as Crypto from 'expo-crypto';
import { useUserStore } from '@/store/user';
import { IMAGES } from '@/assets/imageBase64';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner-native';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import useDatabase from '@/hooks/useDatabase';
import * as Updates from 'expo-updates';

const schema = z.object({
  name: z.string().min(3),
});
export default function Setup() {
  const userStore = useUserStore();
  const { executeInsertUpdateOneTransaction, importDb, executeInsertUpdate } = useDatabase();

  const form = useAppForm({
    defaultValues: {
      name: '',
    },
    validators: {
      onChange: schema,
    },
    onSubmit: async ({ value }) => {
      const id = Crypto.randomUUID();
      // insert all the default images
      // createExercise
      const arr = Object.entries(IMAGES).map(([name, imageData]) => ({
        sql: 'insertImage',
        args: { $name: name, $image_data: imageData },
      }));

      const exercisesArr = Object.entries(IMAGES).map(([name, _]) => ({
        sql: 'createExercise',
        args: { $id: Crypto.randomUUID(), $name: name, $user_id: id, $image: name },
      }));
      await executeInsertUpdateOneTransaction([
        { sql: 'CreateUser', args: { $id: id, $username: value.name } },
        ...arr,
        ...exercisesArr,
      ]);
      userStore.setUser(id, value.name);
      return true;
    },
  });

  const importQuery = useMutation({
    mutationFn: async () => await importDb(),
    onSuccess: async (data) => {
      if (data) {
        toast.success('Database Imported Restarting The Application');
        await Updates.reloadAsync();
      } else toast.warning('No Database Was Selected');
    },
    onError: (err) => {
      console.error(err);
      toast.error('Failed To Import Database');
    },
  });

  return (
    <View className="flex-1 justify-center gap-3 p-2">
      <Button onPress={() => importQuery.mutate()} disabled={importQuery.isPending}>
        <Text>IMPORT DATABASE</Text>
      </Button>
      <Text variant="h3" className="text-center">
        OR
      </Text>
      <View className="border-3 gap-3 border border-primary px-8 py-4">
        <form.AppForm>
          <form.AppField name="name">
            {(field) => <field.FormTextField label="Username" autoCapitalize="none" />}
          </form.AppField>
          <form.SubmitButton title="Submit" />
        </form.AppForm>
      </View>
    </View>
  );
}
