import { Text } from '@/components/ui/text';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/button';
import { useRouter } from 'expo-router';
import executeQuery, { executeInsertUpdate } from '@/lib/database';
import { useUserStore } from '@/store/user';
import Entypo from '@expo/vector-icons/Entypo';
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
import ImageCard from '@/components/ImageCard';

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
    mutationFn: async (id: string) => await executeInsertUpdate('deleteWorkout', { $id: id }),
    onSuccess: () => {
      toast.success('Workout Deleted');
      queryClient.invalidateQueries({ queryKey: ['getWorkout'] });
    },
    onError: () => toast.error('Failed To Delete Workout'),
  });
  return (
    <ScrollView className="w-full px-5 pt-2" contentContainerClassName="gap-2">
      {query.isLoading ? (
        <Text variant="h2"> LOADING .....</Text>
      ) : (
        query.data?.map((e) => (
          <ImageCard
            key={e.name}
            title={e.name}
            imageData={e.data}
            description={`${e.count} Exercises`}
            footer={
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
            }
          />
        ))
      )}
    </ScrollView>
  );
}
