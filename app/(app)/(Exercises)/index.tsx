import ImageCard from '@/components/ImageCard';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import Entypo from '@expo/vector-icons/Entypo';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { View } from 'react-native';
import { Pencil, Trash2 } from 'lucide-react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useUserStore } from '@/store/user';
import executeQuery, { executeInsertUpdate } from '@/lib/database';
import { toast } from 'sonner-native';
import { getExerciseType } from '@/types/types';

export default function Exercise() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const userId = useUserStore((s) => s.user_id);
  const queryClient = useQueryClient();

  const exercises = useQuery({
    queryKey: ['getExercise'],
    enabled: !!userId,
    queryFn: async () => await executeQuery<getExerciseType>('getExercise', { $userId: userId }),
  });

  if (exercises.isError) toast.error('Failed To Fetch Exercises');

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => await executeInsertUpdate('deleteExercise', { $id: id }),
    onSuccess: () => {
      toast.success('Exercise Deleted');
      queryClient.invalidateQueries({ queryKey: ['getExercise'] });
    },
    onError: () => toast.error('Failed To Delete Exercise'),
  });

  return (
    <View className="w-full px-5 pt-1">
      <View className="gap-4">
        {exercises.isLoading ? (
          <Text variant="h2"> LOADING .....</Text>
        ) : (
          exercises.data?.map((e) => (
            <ImageCard
              key={e.name}
              title={e.name}
              imageData={e.image}
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
                          pathname: '/(app)/(Exercises)/EditExercise',
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
      </View>
    </View>
  );
}
