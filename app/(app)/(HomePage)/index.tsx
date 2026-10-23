import { Text } from '@/components/ui/text';
import executeQuery, { executeInsertUpdate } from '@/lib/database';
import { useUserStore } from '@/store/user';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Pressable, ScrollView, View } from 'react-native';
import Entypo from '@expo/vector-icons/Entypo';
import { useColorScheme } from 'nativewind';
import ImageCard from '@/components/ImageCard';
import { getPrevSessionIdType, getWorkoutDetailsType } from '@/types/types';
import { useRouter } from 'expo-router';
import useWorkoutSessionStore from '@/store/WorkoutSession';
import { toast } from 'sonner-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Crypto from 'expo-crypto';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export default function Home() {
  const { colorScheme } = useColorScheme();
  const userId = useUserStore((s) => s.user_id);
  const router = useRouter();
  const username = useUserStore((s) => s.username);
  const setInitialValue = useWorkoutSessionStore((s) => s.setInitialValue);
  const reset = useWorkoutSessionStore((s) => s.reset);
  const query = useQuery({
    queryKey: ['getWorkoutDetails', userId],
    enabled: !!userId, // wait until the user ID is loaded
    queryFn: async () =>
      await executeQuery<getWorkoutDetailsType>('getWorkoutDetails', { $userid: userId }),
  });

  const mutation = useMutation({
    retry: 0,
    mutationFn: async (e: getWorkoutDetailsType) => {
      const exerciseList = e.exerciseId?.split(',') ?? [];
      const firstExercise = exerciseList?.[0] ?? '';
      if (!firstExercise) {
        toast.warning('No Exercise Listed For Workout');
        return;
      }
      const id = Crypto.randomUUID();
      const prevSessionRes = await executeQuery<getPrevSessionIdType>('getPrevSessionIds', {
        $WorkoutId: e.id,
        $SessionId: id,
      });
      const prevSessions = prevSessionRes.map((e) => e.id);
      await executeInsertUpdate('createSession', { $WorkoutId: e.id, $id: id });
      reset();
      setInitialValue(id, e.id, firstExercise, prevSessions, exerciseList ?? []);
      router.replace(`/Session/${firstExercise}`);
    },
    onError: (err) => {
      console.error(err);
      toast.error('Failed To Create Session');
    },
  });
  return (
    <SafeAreaView className="w-full flex-1 px-5 pt-2">
      {query.isLoading ? (
        <Text variant="h2"> LOADING .....</Text>
      ) : (
        <View className="flex-1 gap-2">
          <Text variant="h2" className="border-b-0 pb-0">
            Hi {username}
          </Text>
          <Text variant="muted">Lets Make Progress Today</Text>

          <ScrollView className="flex-1" contentContainerClassName="gap-2">
            <View className="w-full flex-row items-center">
              <Separator className="w-[70%]" />
              <Button
                variant="ghost"
                className="w-[30%] shrink px-1"
                onPress={() => router.push('/(app)/(PrevSessions)')}>
                <Text className="text-center">Prev Sessions</Text>
              </Button>
            </View>

            {query.isError ? (
              <Text>Failed To Fetch Data</Text>
            ) : (
              query.data?.map((e) => (
                <Pressable
                  key={e.id}
                  onPress={() => mutation.mutate(e)}
                  disabled={mutation.isPending}>
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
        </View>
      )}
    </SafeAreaView>
  );
}
