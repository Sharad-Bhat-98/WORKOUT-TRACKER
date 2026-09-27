import { z } from 'zod';
import { useAppForm } from '@/components/HookForm';
import { View } from 'react-native';
import * as Crypto from 'expo-crypto';
import { executeInsertUpdate } from '@/lib/database';
import { useUserStore } from '@/store/user';

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
      userStore.setUser(id, value.name);
    },
  });

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20, gap: 10 }}>
      <form.AppForm>
        <form.AppField name="name">
          {(field) => <field.FormTextField label="Username" autoCapitalize="none" />}
        </form.AppField>
        <form.SubmitButton title="Submit" />
      </form.AppForm>
    </View>
  );
}
