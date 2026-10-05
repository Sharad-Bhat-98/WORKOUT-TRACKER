import { Text } from '@/components/ui/text';
import { Image, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AntDesign from '@expo/vector-icons/AntDesign';
import { Button } from '@/components/ui/button';
import { useRouter } from 'expo-router';
import executeQuery, { executeInsertUpdate } from '@/lib/database';
import { useUserStore } from '@/store/user';
import Entypo from '@expo/vector-icons/Entypo';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useColorScheme } from 'nativewind';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Icon } from '@/components/ui/icon';
import { Pencil, Trash2 } from 'lucide-react-native';
import { toast } from 'sonner-native';
import { WorkoutType } from '@/types/types';

export default function Workout() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const queryClient = useQueryClient();
  const userId = useUserStore((s) => s.user_id);

  const query = useQuery({
    queryKey: ['getWorkout'],
    enabled: !!userId, // wait until the user ID is loaded
    retry: 1,
    queryFn: async () => await executeQuery<WorkoutType>('getWorkout', { $userid: userId }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // await executeInsertUpdate('deleteExcerisesForWorkout', { $id: id });
      await executeInsertUpdate('deleteWorkout', { $id: id });
    },
    onSuccess: () => {
      toast.success('Workout Deleted');
      queryClient.invalidateQueries({ queryKey: ['getWorkout'] });
    },
    onError: () => {
      toast.error('Failed To Delete Workout');
    },
  });
  return (
    <SafeAreaView className="w-full p-5">
      <View className="mb-8 w-full flex-row items-center justify-between">
        <Text variant="h1">Workout</Text>
        <Button
          size="icon"
          className="rounded-full"
          onPress={() => router.push('/(app)/(Workout)/CreateWorkout')}>
          <AntDesign name="plus" size={24} />
        </Button>
      </View>
      <View className="gap-4">
        {query.isLoading ? (
          <Text variant="h2"> LOADING .....</Text>
        ) : (
          query.data?.map((e) => (
            <Card key={e.id} className="flex-row items-center justify-between">
              <View className="ml-4 rounded-md bg-primary p-1">
                <Image
                  source={{ uri: `data:image/png;base64,${e.data}` }}
                  style={{ width: 70, height: 70 }}
                />
              </View>
              <CardHeader className="flex-1">
                <CardTitle>{e.name}</CardTitle>
                <CardDescription>{e.count} Excerises</CardDescription>
              </CardHeader>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost">
                    <Entypo
                      name="dots-three-vertical"
                      size={18}
                      color={colorScheme === 'dark' ? 'white' : 'black'}
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="start">
                  <DropdownMenuItem
                    onPress={() =>
                      router.push({
                        pathname: '/(app)/(Workout)/EditWorkout',
                        params: { id: e.id },
                      })
                    }>
                    <Icon as={Pencil} size={16} />
                    <Text>Edit</Text>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onPress={() => deleteMutation.mutate(e.id)}>
                    <Icon as={Trash2} size={16} />
                    <Text>Delete</Text>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </Card>
          ))
        )}
      </View>
    </SafeAreaView>
  );
}
