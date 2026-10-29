import ImageCard from '@/components/ImageCard';
import { CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Text } from '@/components/ui/text';
import executeQuery, { executeInsertUpdate } from '@/lib/database';
import useWorkoutSessionStore from '@/store/WorkoutSession';
import { getPrevSessionsType } from '@/types/types';
import Entypo from '@expo/vector-icons/Entypo';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Pencil, Trash2 } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { FlatList, Pressable, View } from 'react-native';
import { toast } from 'sonner-native';
import { Icon } from '@/components/ui/icon';

const PAGE_SIZE = 20;
export default function PrevSessionIndex() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const queryClient = useQueryClient();
  const resetSession = useWorkoutSessionStore((s) => s.reset);

  const query = useInfiniteQuery({
    queryKey: ['getPrevSessions'],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) =>
      executeQuery<getPrevSessionsType>('getPrevSessions', {
        $limit: PAGE_SIZE,
        $offset: pageParam,
      }),
    getNextPageParam: (lastPage, _pages, lastOffset) => {
      if (!lastPage) return undefined;
      return lastPage.length < PAGE_SIZE ? undefined : lastOffset + PAGE_SIZE;
    },
  });
  const workouts = query.data?.pages.flat() ?? [];

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => await executeInsertUpdate('deleteSession', { $id: id }),
    onSuccess: (_data, id) => {
      if (useWorkoutSessionStore.getState().sessionId === id) resetSession();
      toast.success('Session Deleted');
      queryClient.invalidateQueries({ queryKey: ['getPrevSessions'] });
    },
    onError: () => toast.error('Failed To Delete Session'),
  });

  return (
    <View className="w-full flex-1 px-5">
      <FlatList
        data={workouts}
        keyExtractor={(item) => item.id}
        contentContainerClassName="gap-2"
        onEndReached={() => {
          if (query.hasNextPage && !query.isFetching && !query.isFetchingNextPage) {
            query.fetchNextPage();
          }
        }}

        onEndReachedThreshold={0.4}
        ListFooterComponent={query.isFetchingNextPage ? <Text>Loading more…</Text> : undefined}
        renderItem={({ item }) => (
          <Pressable>
            <ImageCard
              title={item.name}
              description={
                <View>
                  <CardDescription>{`FROM: ${item.started_at}`.toUpperCase()}</CardDescription>
                  <CardDescription>{`TO: ${item.ended_at ?? ''}`.toUpperCase()}</CardDescription>
                </View>
              }
              imageData={item.data}
              className={!item.ended_at ? 'border-destructive' : ''}
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
                      onPress={() => router.push(`/(app)/(PrevSessions)/${item.id}`)}>
                      <Icon as={Pencil} size={16} />
                      <Text>Edit</Text>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant="destructive"
                      onPress={() => deleteMutation.mutate(item.id)}
                      disabled={deleteMutation.isPending}>
                      <Icon as={Trash2} size={16} />
                      <Text>Delete</Text>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              }
            />
          </Pressable>
        )}
      />
    </View>
  );
}
