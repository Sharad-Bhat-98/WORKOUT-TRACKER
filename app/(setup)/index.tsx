import { z } from 'zod';
import { useAppForm } from '@/components/HookForm';
import { View } from 'react-native';
import * as Crypto from 'expo-crypto';
import executeQuery, {
  executeInsertUpdate,
  executeInsertUpdateOneTransaction,
  importDb,
} from '@/lib/database';
import { useUserStore } from '@/store/user';
import { IMAGES } from '@/assets/imageBase64';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner-native';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

const schema = z.object({
  name: z.string().min(3),
});
export default function Setup() {
  const userStore = useUserStore();
  const form = useAppForm({
    defaultValues: {
      name: '',
    },
    validators: {
      onChange: schema,
    },
    onSubmit: async ({ value }) => {
      const id = Crypto.randomUUID();
      await executeInsertUpdate('CreateUser', { $id: id, $username: value.name });
      // insert all the default images
      const obj = Object.entries(IMAGES).map(([name, imageData]) => ({
        sql: 'insertImage',
        args: { $name: name, $image_data: imageData },
      }));
      await executeInsertUpdateOneTransaction(obj);
      userStore.setUser(id, value.name);
    },
  });

  const importQuery = useMutation({
    mutationFn: async () => await importDb(),
    onSuccess: () => toast.success('Database Imported Please Restart The Application'),
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
