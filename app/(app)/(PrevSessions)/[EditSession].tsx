import { EndSessionPicker } from '@/components/DateTimePicker';
import { useAppForm } from '@/components/HookForm';
import { Card, CardHeader } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import executeQuery, {
  executeInsertUpdate,
  executeInsertUpdateOneTransaction,
} from '@/lib/database';
import { getsessionDetailsType, sessionDetailsSetType, sessionDetailsType } from '@/types/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { Image, ScrollView, View } from 'react-native';
import { toast } from 'sonner-native';
import { z } from 'zod';

const schema = z.object({
  sets: z.array(
    z.object({
      set_no: z.number(),
      weight: z.string().refine((value) => {
        const weight = Number(value);
        return value.trim() !== '' && Number.isFinite(weight) && weight >= 0;
      }, 'Enter a weight of 0 or more'),
      reps: z.string().refine((value) => {
        const reps = Number(value);
        return value.trim() !== '' && Number.isInteger(reps) && reps >= 0;
      }, 'Enter a whole number of reps'),
    })
  ),
});

export default function EditSession() {
  const { EditSession: sessionId } = useLocalSearchParams<{ EditSession: string }>();
  const queryClient = useQueryClient();

  const sessionDetails = useQuery({
    queryKey: ['getsessionDetails', sessionId],
    queryFn: async () => {
      const res = await executeQuery<getsessionDetailsType>('getsessionDetails', {
        $id: sessionId,
      });
      const obj: sessionDetailsType = {
        sessionId: '',
        started_at: '',
        ended_at: null,
        workout_name: '',
        exercises: {},
      };
      res.forEach((e) => {
        obj.sessionId = e.id;
        obj.started_at = e.started_at;
        obj.ended_at = e.ended_at;
        obj.workout_name = e.workout_name;
        if (!e.exercise_id) return;
        const exerciseObj = {
          name: e.exercise_name,
          image: e.image,
          set_no: e.set_no,
          weight: e.weight,
          reps: e.reps,
        };
        const sets = obj.exercises[e.exercise_id];
        if (sets) sets.push(exerciseObj);
        else obj.exercises[e.exercise_id] = [exerciseObj];
      });
      return obj;
    },
  });

  const session = sessionDetails.data;
  const exercises = Object.entries(session?.exercises ?? {});

  const updateEndTime = useMutation({
    mutationFn: (date: string) =>
      executeInsertUpdate('updateSessionEndedAt', { $endedAt: date, $id: sessionId }),
    onSuccess: () => {
      toast.success('Session Time Updated');
      queryClient.invalidateQueries({ queryKey: ['getsessionDetails', sessionId] });
    },
    onError: () => toast.error('Failed To Update Session Time'),
  });

  return (
    <View className="flex-1">
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="gap-4 px-5 pb-8 pt-4">
        {sessionDetails.isLoading ? (
          <Text variant="h3">Loading...</Text>
        ) : sessionDetails.isError || !session?.sessionId ? (
          <Text>Failed To Fetch Data</Text>
        ) : (
          <>
            <Card className="gap-4 py-5">
              <CardHeader className="items-center gap-4 px-5">
                <Text variant="h3" className="text-center">
                  {session.workout_name}
                </Text>
                <View className="w-full gap-2">
                  <View className="flex-row items-center justify-between rounded-lg bg-muted px-3 py-2">
                    <Text variant="muted">From</Text>
                    <Text className="text-sm">{session.started_at}</Text>
                  </View>
                  <View className="flex-row items-center justify-between rounded-lg bg-muted px-3 py-2">
                    <Text variant="muted">To</Text>
                    <Text className="text-sm">{session.ended_at ?? 'In progress'}</Text>
                  </View>
                </View>
              </CardHeader>
            </Card>
            <Card className="p-5">
              <EndSessionPicker
                disabled={updateEndTime.isPending}
                endedAt={session.ended_at}
                handlePress={updateEndTime}
              />
            </Card>

            {exercises.map(([exerciseId, sets]) => (
              <ExerciseCard
                key={exerciseId}
                sessionId={String(sessionId)}
                exerciseId={exerciseId}
                sets={sets}
              />
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

function ExerciseCard({
  sessionId,
  exerciseId,
  sets,
}: {
  sessionId: string;
  exerciseId: string;
  sets: sessionDetailsSetType[];
}) {
  const queryClient = useQueryClient();
  const loggedSets = sets.filter((set) => set.set_no != null);

  const saveSets = useMutation({
    mutationFn: async (value: z.infer<typeof schema>) => {
      await executeInsertUpdateOneTransaction(
        value.sets.map((set) => ({
          sql: 'updateSetLog',
          args: {
            $sessionId: sessionId,
            $exerciseId: exerciseId,
            $setNo: set.set_no,
            $weight: Number(set.weight),
            $reps: Number(set.reps),
          },
        }))
      );
    },
    onSuccess: () => {
      toast.success('Sets Updated');
      queryClient.invalidateQueries({ queryKey: ['getsessionDetails', sessionId] });
    },
    onError: () => toast.error('Failed To Update Sets'),
  });

  const form = useAppForm({
    defaultValues: {
      sets: loggedSets.map((set) => ({
        set_no: set.set_no ?? 0,
        weight: set.weight == null ? '' : String(set.weight),
        reps: set.reps == null ? '' : String(set.reps),
      })),
    },
    validators: {
      onChange: schema,
    },
    onSubmit: async ({ value }) => {
      if (value.sets.length === 0) return;
      await saveSets.mutateAsync(value);
    },
  });

  return (
    <Card className="gap-3 px-5 py-4">
      <View className="flex-row items-center gap-3">
        <View className="overflow-hidden rounded-md bg-primary">
          <Image
            source={{ uri: `data:image/png;base64,${sets[0]?.image ?? ''}` }}
            style={{ width: 48, height: 48 }}
          />
        </View>
        <Text className="flex-1 font-semibold">{sets[0]?.name}</Text>
      </View>
      <form.AppForm>
        <View className="gap-4">
          {loggedSets.map((set, index) => (
            <View key={`${exerciseId}-${set.set_no}`} className="flex-row items-start gap-3">
              <Text className="mt-7 w-10 text-center">{set.set_no}</Text>
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
            </View>
          ))}
          <form.SubmitButton title="Save" disabled={saveSets.isPending} />
        </View>
      </form.AppForm>
    </Card>
  );
}
