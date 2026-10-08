import { Text } from '@/components/ui/text';
import executeQuery from '@/lib/database';
import { useUserStore } from '@/store/user';
import { useQuery } from '@tanstack/react-query';
import { Pressable, ScrollView } from 'react-native';
import Entypo from '@expo/vector-icons/Entypo';
import { useColorScheme } from 'nativewind';
import ImageCard from '@/components/ImageCard';
import { WorkoutType } from '@/types/types';

export default function Home() {
  const { colorScheme } = useColorScheme();
  const userId = useUserStore((s) => s.user_id);

  const query = useQuery({
    queryKey: ['getWorkout'],
    enabled: !!userId, // wait until the user ID is loaded
    retry: 1,
    queryFn: async () => {
      const res = await executeQuery<WorkoutType>('getWorkout', { $userid: userId });
      return res;
    },
  });
  return (
    <ScrollView className="w-full px-5 pt-2" contentContainerClassName="gap-2">
      {query.isLoading ? (
        <Text variant="h2"> LOADING .....</Text>
      ) : (
        query.data?.map((e) => (
          <Pressable key={e.id}>
            <ImageCard
              key={e.id}
              title={e.name}
              description={`${e.count} Exercises`}
              imageData={e.data}
              footer={
                <Entypo
                  name="chevron-right"
                  size={24}
                  className="mr-4"
                  color={colorScheme === 'dark' ? 'white' : 'black'}
                />
              }
            />
          </Pressable>
        ))
      )}
    </ScrollView>
  );
}
