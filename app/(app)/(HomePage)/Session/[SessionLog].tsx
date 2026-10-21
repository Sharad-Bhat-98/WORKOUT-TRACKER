import { useAppForm } from '@/components/HookForm';
import LineChart from '@/components/LineChart';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Text } from '@/components/ui/text';
import executeQuery, { executeInsertUpdateOneTransaction } from '@/lib/database';
import useWorkoutSessionStore from '@/store/WorkoutSession';
import {
  getExerciseSessionDetailsType,
  getPrevSetDetailsType,
  handleNextExerciseType,
  prevSessionRepsDetailsType,
} from '@/types/types';
import { useMutation, UseMutationResult, useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';
import * as Crypto from 'expo-crypto';
import { Skeleton } from '@/components/ui/skeleton';

type submitArgs = {
  reps: number;
  weight: number;
  set: number;
};

export default function SessionLog() {
  const { SessionLog: exerciseId } = useLocalSearchParams<{ SessionLog: string }>();
  const router = useRouter();
  const workoutId = useWorkoutSessionStore((s) => s.workoutId);
  const prevSessions = useWorkoutSessionStore((s) => s.prevSessions);
  const prevSession = prevSessions?.[0] ?? '';
  const sessionId = useWorkoutSessionStore((s) => s.sessionId);
  const exersiseList = useWorkoutSessionStore((s) => s.exerciseList);
  const currentIndex = useWorkoutSessionStore((s) => s.index);
  const setNextExercise = useWorkoutSessionStore((s) => s.setNextExercise);
  const reset = useWorkoutSessionStore((s) => s.reset);
  const isLast = exersiseList.length - 1 === currentIndex;
  const pageDetails = useQuery({
    enabled: Boolean(exerciseId && workoutId),
    queryKey: ['getExerciseSessionDetails', workoutId, exerciseId],
    queryFn: async () => {
      const res = await executeQuery<getExerciseSessionDetailsType>('getExerciseSessionDetails', {
        $ExerciseId: exerciseId,
        $WorkoutId: workoutId,
      });

      if (res.length > 0) return res[0];
      else throw new Error('Result is Empty');
    },
  });
  const targetSets = setCount(pageDetails.data?.TargetSets);

  const prevSessionRepsDetails = useQuery({
    queryKey: ['getPrevSessionExerciseDetails', prevSession, exerciseId],
    enabled: Boolean(prevSession && exerciseId),
    queryFn: async () =>
      await executeQuery<prevSessionRepsDetailsType>('getPrevSessionExerciseDetails', {
        $PrevSession: prevSession,
        $ExerciseId: exerciseId,
      }),
  });

  const graphData = useQuery({
    queryKey: ['getPrevSetDetails', ...prevSessions, exerciseId],
    enabled: Boolean(exerciseId && prevSession),
    queryFn: async () =>
      await executeQuery<getPrevSetDetailsType>('getPrevSetDetails', {
        $SessionIds: JSON.stringify(prevSessions),
        $ExerciseId: exerciseId,
      }),
  });

  const handleNextExercise = useMutation({
    mutationFn: async (sets: submitArgs[]) => {
      const queryData: handleNextExerciseType[] = sets.map((e) => {
        const id = Crypto.randomUUID();
        return {
          sql: 'insertSetLog',
          args: {
            $id: id,
            $SessionId: sessionId,
            $ExerciseId: exerciseId,
            $SetNo: e.set,
            $Reps: e.reps,
            $Weight: e.weight,
          },
        };
      });
      if (isLast) queryData.push({ sql: 'updateSessionEndTime', args: { $SessionId: sessionId } });
      return await executeInsertUpdateOneTransaction(queryData);
    },
    onSuccess: () => {
      if (isLast) {
        reset();
        router.replace('/(app)/(HomePage)');
      } else {
        const nextExercise = setNextExercise();
        router.replace(`/Session/${nextExercise}`);
      }
    },
    onError: () => {
      toast.error('Failed To Update Exercise');
    },
  });

  if (pageDetails.isLoading || prevSessionRepsDetails.isLoading) return <SkeletonComp />;

  if (pageDetails.isError) {
    return (
      <SafeAreaView>
        <Text>Failed To Fetch Data</Text>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView className="flex-1">
      <ScrollView contentContainerClassName="gap-4 px-4 pb-8">
        <View className="mt-6 flex-row items-center gap-4">
          <View className="overflow-hidden rounded-md bg-primary">
            <Image
              source={{ uri: `data:image/png;base64,${pageDetails.data?.ImageData ?? ''}` }}
              resizeMode="cover"
              style={{ width: 100, height: 100 }}
            />
          </View>
          <View className="flex-1 gap-3">
            <View>
              <Text variant="muted">Workout</Text>
              <Text className="text-sm">{pageDetails.data?.WorkoutName ?? ''}</Text>
            </View>
            <View>
              <Text variant="muted">Exercise</Text>
              <Text className="text-sm">{pageDetails.data?.ExerciseName ?? ''}</Text>
            </View>
          </View>
        </View>
        <Card>
          <CardContent>
            {targetSets > 0 ? (
              <SetLogForm
                key={`${String(exerciseId)}-${targetSets}`}
                targetSets={targetSets}
                prevSessionRepsDetails={prevSessionRepsDetails.data ?? []}
                handleNextExercise={handleNextExercise}
                isLast={isLast}
              />
            ) : (
              <Text variant="muted">No sets for this exercise</Text>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            {graphData.isError ? (
              <Text>Failed To Fetch Data</Text>
            ) : (
              <LineChart
                data={graphData.data ?? []}
                xKey="logged_at"
                yKeys={['est_1rm']}
                className="h-60"
              />
            )}
          </CardContent>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function setCount(targetSets: string | number | null | undefined) {
  const count = Number(targetSets);
  if (!Number.isInteger(count) || count < 1) return 0;
  return count;
}

function SetLogForm({
  targetSets,
  prevSessionRepsDetails,
  handleNextExercise,
  isLast,
}: {
  targetSets: number;
  prevSessionRepsDetails: prevSessionRepsDetailsType[];
  handleNextExercise: UseMutationResult<void, Error, submitArgs[], unknown>;
  isLast: boolean;
}) {
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const form = useAppForm({
    defaultValues: {
      sets: Array.from({ length: targetSets }, (_, i) => {
        const prevDetails = prevSessionRepsDetails.find((e) => e.set_no === i + 1);
        return {
          weight: String(prevDetails?.weight ?? '0'),
          reps: String(prevDetails?.reps ?? '0'),
        };
      }),
    },
    onSubmit: async ({ value }) => {
      const sets: submitArgs[] = [];
      value.sets.forEach((e, idx) => {
        if (checked?.[idx]) {
          const repsParsed = +e.reps;
          const weightParsed = +e.weight;
          sets.push({
            reps: isNaN(repsParsed) ? 0 : repsParsed,
            weight: isNaN(weightParsed) ? 0 : weightParsed,
            set: idx + 1,
          });
        }
      });
      return await handleNextExercise.mutateAsync(sets);
    },
  });

  useEffect(() => {
    const value: Record<number, boolean> = {};
    for (let index = 0; index < targetSets; index++) value[index] = false;
    setChecked(value);
  }, [targetSets]);

  const handleButtonPress = (type: 'add' | 'sub', name: `sets[${number}].reps`, index: number) => {
    let current = parseInt(form.getFieldValue(name)) ?? 0;
    current = isNaN(current) ? 0 : current;

    if (!checked[index] && current >= 0) setChecked((s) => ({ ...s, [index]: !s[index] }));
    const next = type === 'add' ? current + 1 : Math.max(0, current - 1);
    form.setFieldValue(name, String(next));
  };

  return (
    <form.AppForm>
      <View className="gap-4">
        {Array.from({ length: targetSets }, (_, index) => (
          <View key={index} className="gap-2">
            <View className="flex-row items-center justify-center gap-3">
              <View className="flex-1">
                <form.AppField name={`sets[${index}].weight`}>
                  {(field) => (
                    <field.FormTextField label="Weight (Kg)" keyboardType="decimal-pad" />
                  )}
                </form.AppField>
              </View>
              <View className="flex-1">
                <form.AppField name={`sets[${index}].reps`}>
                  {(field) => <field.FormTextField label="Reps" keyboardType="number-pad" />}
                </form.AppField>
              </View>
              <View className="mt-5 flex-row gap-4">
                <Checkbox
                  className="mt-1 size-6 rounded-full border-primary"
                  iconSize={15}
                  checked={checked[index]}
                  onCheckedChange={() => setChecked((s) => ({ ...s, [index]: !s[index] }))}
                />
                <Button
                  size="sm"
                  onPress={() => handleButtonPress('add', `sets[${index}].reps`, index)}>
                  <Text variant="h3">+</Text>
                </Button>
                <Button
                  size="sm"
                  onPress={() => handleButtonPress('sub', `sets[${index}].reps`, index)}>
                  <Text variant="h3">-</Text>
                </Button>
              </View>
            </View>
          </View>
        ))}
        <form.SubmitButton
          title={isLast ? 'Finish Workout' : 'Next Exercise'}
          disabled={!Object.values(checked).some((e) => e)}
        />
      </View>
    </form.AppForm>
  );
}

const SkeletonComp = () => {
  return (
    <SafeAreaView className="flex-1">
      <ScrollView contentContainerClassName="gap-4 px-4 pb-8">
        <View className="mt-6 flex-row items-center gap-4">
          <Skeleton className="h-[100px] w-[100px] rounded-md" />
          <View className="flex-1 gap-3">
            <View className="gap-1">
              <Skeleton className="h-3.5 w-16" />
              <Skeleton className="h-4 w-32" />
            </View>
            <View className="gap-1">
              <Skeleton className="h-3.5 w-16" />
              <Skeleton className="h-4 w-40" />
            </View>
          </View>
        </View>
        <Card>
          <CardContent>
            <View className="gap-4">
              {Array.from({ length: 3 }, (_, index) => (
                <View key={index} className="flex-row items-center justify-center gap-3">
                  <View className="flex-1 gap-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </View>
                  <View className="flex-1 gap-1">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-10 w-full" />
                  </View>
                  <View className="mt-5 flex-row items-center gap-4">
                    <Skeleton className="size-6 rounded-full" />
                    <Skeleton className="h-9 w-10" />
                    <Skeleton className="h-9 w-10" />
                  </View>
                </View>
              ))}
              <Skeleton className="h-10 w-full" />
            </View>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Skeleton className="h-60 w-full" />
          </CardContent>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};
