import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import executeQuery from '@/lib/database';
import { useUserStore } from '@/store/user';
import { useQuery } from '@tanstack/react-query';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Entypo from '@expo/vector-icons/Entypo';
import { useColorScheme } from 'nativewind';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type Workout = {
  id: string;
  name: string;
};
export default function Home() {
  const { colorScheme } = useColorScheme();
  const userId = useUserStore((s) => s.user_id);
  const username = useUserStore((s) => s.username);

  const query = useQuery({
    queryKey: ['getWorkout'],
    enabled: !!userId, // wait until the user ID is loaded
    retry: 1,
    queryFn: async () => {
      const res = await executeQuery<Workout>('getWorkout', { $userid: userId });
      return res;
    },
  });
  return (
    <SafeAreaView className="p-2">
      <Text variant="h2" className="text-left">
        Hi {username}
      </Text>
      <Text variant="muted">Lets Make Progress Today</Text>

      <View className="mt-5 gap-4">
        {query.isLoading ? (
          <Text variant="h2"> LOADING .....</Text>
        ) : (
          query.data?.map((e) => (
            <Pressable key={e.id}>
              <Card className="flex-row items-center justify-between">
                <CardHeader>
                  <CardTitle>{e.name}</CardTitle>
                  <CardDescription>No of Excerises</CardDescription>
                </CardHeader>
                <Entypo
                  name="chevron-right"
                  size={24}
                  className="mr-4"
                  color={colorScheme === 'dark' ? 'white' : 'black'}
                />
              </Card>
            </Pressable>
          ))
        )}
      </View>
    </SafeAreaView>
  );
}
