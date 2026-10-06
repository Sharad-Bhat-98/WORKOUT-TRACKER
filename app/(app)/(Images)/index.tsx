import { useAppForm } from '@/components/HookForm';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Image, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import executeQuery, { executeInsertUpdate } from '@/lib/database';
import { toast } from 'sonner-native';
import { z } from 'zod';
import * as ImageManipulator from 'expo-image-manipulator';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import ImageCard from '@/components/ImageCard';
import { ImageType } from '@/types/types';

import { Icon } from '@/components/ui/icon';
import { Trash2 } from 'lucide-react-native';

const schema = z.object({
  name: z.string(),
});

export default function UploadImage() {
  const queryClient = useQueryClient();
  const [image, setImage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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
      await executeInsertUpdate('insertImage', {
        $name: value.name,
        $image_data: image ?? '',
      });
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
      setImage(await compressToBase64(res.assets[0].uri));
    } catch (e) {
      toast.error('Could not compress image under 100KB');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View className="w-full px-5">
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
              style={{ width: 120, height: 120 }}
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
    </View>
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
