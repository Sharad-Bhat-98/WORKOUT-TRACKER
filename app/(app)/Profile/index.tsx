import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import useDatabase from '@/hooks/useDatabase';
import { useMutation } from '@tanstack/react-query';
import { View } from 'react-native';
import { toast } from 'sonner-native';
import * as Updates from 'expo-updates';

export default function Profile() {
  const { exportDb, importDb } = useDatabase();

  const exportQuery = useMutation({
    mutationFn: async () => await exportDb(),
    onSuccess: () => toast.success('Database Exported'),
    onError: (err) => {
      console.error(err);
      toast.error('Failed To Export Database');
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
    <View className="gap-2 p-5">
      <Button onPress={() => exportQuery.mutate()} disabled={exportQuery.isPending}>
        <Text>EXPORT DATABASE</Text>
      </Button>

      <Button onPress={() => importQuery.mutate()} disabled={importQuery.isPending}>
        <Text>IMPORT DATABASE</Text>
      </Button>
    </View>
  );
}
