import { useAppForm } from '@/components/HookForm';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { Image, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Crypto from 'expo-crypto';
import { executeInsertUpdate } from '@/lib/database';
import { useUserStore } from '@/store/user';
import { toast } from 'sonner-native';
import { z } from 'zod';
import * as ImageManipulator from 'expo-image-manipulator';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';

const schema = z.object({
  name: z.string().min(3),
});

export default function CreateExercise() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const userId = useUserStore((s) => s.user_id);
  const queryClient = useQueryClient();

  const [image, setImage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const createMutation = useMutation({
    mutationFn: async (value: { name: string }) => {
      const id = Crypto.randomUUID();
      await executeInsertUpdate('createExercise', {
        $id: id,
        $name: value.name,
        $user_id: userId,
        $image_data: image ?? '',
      });
    },
    onSuccess: () => {
      toast.success('Exercise Created');
      // queryClient.invalidateQueries({ queryKey: ['getWorkout'] });
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

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
    });
    if (res.canceled) return;
    try {
      setBusy(true);
      setImage(await compressToBase64(res.assets[0].uri));
    } catch (e) {
      toast.error('Could not compress image under 100KB');
    } finally {
      setBusy(false);
    }
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
          Create Exercise
        </Text>
      </View>

      <Card className="mt-5 p-5">
        <form.AppForm>
          <form.AppField name="name">
            {(field) => <field.FormTextField label="Workout Name" autoCapitalize="none" />}
          </form.AppField>
          <Button onPress={pickImage} disabled={busy} variant="outline">
            <Text>{busy ? 'Compressing...' : 'Pick Image'}</Text>
          </Button>
          {image && (
            <Image
              source={{ uri: `data:image/png;base64,${image}` }}
              style={{ width: 120, height: 120 }}
            />
          )}
          <form.SubmitButton title="Submit" />
        </form.AppForm>
      </Card>
    </SafeAreaView>
  );
}

const MAX_BYTES = 100 * 1024;

// Bytes the base64 string represents once decoded
const base64Bytes = (b64: string) =>
  Math.ceil((b64.length * 3) / 4) - (b64.endsWith('==') ? 2 : b64.endsWith('=') ? 1 : 0);

export async function compressToBase64(uri: string): Promise<string> {
  let width = 1080;
  let quality = 0.8;

  while (width >= 200) {
    const result = await ImageManipulator.manipulateAsync(uri, [{ resize: { width } }], {
      compress: quality,
      format: ImageManipulator.SaveFormat.JPEG,
      base64: true,
    });

    if (result.base64 && base64Bytes(result.base64) <= MAX_BYTES) {
      return result.base64;
    }

    if (quality > 0.4) quality -= 0.15;
    else {
      width = Math.round(width * 0.75);
      quality = 0.7;
    }
  }

  throw new Error('Could not compress image under 100KB');
}
