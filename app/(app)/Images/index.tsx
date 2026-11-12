import { useAppForm } from '@/components/HookForm';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';
import { z } from 'zod';
import * as ImageManipulator from 'expo-image-manipulator';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import ImageCard from '@/components/ImageCard';
import { executeInsertUpdateOneTransactionType, ImageType } from '@/types/types';
import { Icon } from '@/components/ui/icon';
import { Trash2 } from 'lucide-react-native';
import useDatabase from '@/hooks/useDatabase';
import * as Crypto from 'expo-crypto';
import { useUserStore } from '@/store/user';

const schema = z.object({
  name: z.string(),
});

export default function UploadImage() {
  const queryClient = useQueryClient();
  const [image, setImage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { executeQuery, executeInsertUpdate, executeInsertUpdateOneTransaction } = useDatabase();
  const userId = useUserStore((s) => s.user_id);

  const imageData = useQuery({
    queryKey: ['getImages'],
    retry: 1,
    queryFn: async () => await executeQuery<ImageType>('getImages', {}),
  });

  const deleteMutation = useMutation({
    mutationFn: async (value: { name: string }) => {
      await executeInsertUpdate('deleteImage', {
        $name: value.name,
      });
    },
    onSuccess: () => {
      toast.success('Image Deleted');
      queryClient.invalidateQueries({ queryKey: ['getImages'] });
    },
    onError: (err) => {
      console.error(err);
      toast.error('Failed To Delete Image');
    },
  });
  const createMutation = useMutation({
    mutationFn: async (value: { name: string }) => {
      const arr: executeInsertUpdateOneTransactionType[] = [
        {
          sql: 'insertImage',
          args: {
            $name: value.name,
            $image_data: image ?? '',
          },
        },
        {
          sql: 'createExercise',
          args: {
            $id: Crypto.randomUUID(),
            $name: value.name,
            $user_id: userId ?? '',
            $image: value.name,
          },
        },
      ];
      return await executeInsertUpdateOneTransaction(arr);
    },
    onSuccess: () => {
      toast.success('Image Uploaded');
      queryClient.invalidateQueries({ queryKey: ['getImages'] });
    },
    onError: (err) => {
      console.error(err);
      toast.error('Failed To Upload Image');
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
      const asset = res.assets[0];
      setImage(await compressToBase64(asset.uri, asset.width, asset.height));
    } catch (e) {
      toast.error('Could not compress image under 100KB');
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView className="w-full flex-1 px-5">
      <Card className="p-5">
        <form.AppForm>
          <form.AppField name="name">
            {(field) => <field.FormTextField label="Name" autoCapitalize="none" />}
          </form.AppField>
          <Button onPress={pickImage} disabled={busy} variant="outline">
            <Text>{busy ? 'Compressing...' : 'Pick Image'}</Text>
          </Button>
          {image && (
            <Image
              source={{ uri: `data:image/png;base64,${image}` }}
              style={{ width: 200, height: 200 }}
            />
          )}
          <form.SubmitButton title="Submit" />
        </form.AppForm>
      </Card>

      <ScrollView className="mt-5" contentContainerClassName="gap-4">
        {imageData.data?.map((e) => (
          <ImageCard
            key={e.name}
            title={e.name}
            imageData={e.data}
            footer={
              <Button
                variant="destructive"
                size="icon"
                onPress={() => deleteMutation.mutate({ name: e.name })}>
                <Icon as={Trash2} size={16} />
              </Button>
            }
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const MAX_BYTES = 100 * 1024;

// Bytes the base64 string represents once decoded
const base64Bytes = (b64: string) =>
  Math.ceil((b64.length * 3) / 4) - (b64.endsWith('==') ? 2 : b64.endsWith('=') ? 1 : 0);

export async function compressToBase64(
  uri: string,
  sourceWidth: number,
  sourceHeight: number
): Promise<string> {
  const side = Math.min(sourceWidth, sourceHeight);
  const originX = Math.floor((sourceWidth - side) / 2);
  const originY = Math.floor((sourceHeight - side) / 2);
  let quality = 0.8;

  while (quality >= 0.3) {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [
        { crop: { originX, originY, width: side, height: side } },
        { resize: { width: 200, height: 200 } },
      ],
      {
        compress: quality,
        format: ImageManipulator.SaveFormat.JPEG,
        base64: true,
      }
    );

    if (result.base64 && base64Bytes(result.base64) <= MAX_BYTES) {
      return result.base64;
    }

    quality -= 0.15;
  }

  throw new Error('Could not compress image under 100KB');
}
