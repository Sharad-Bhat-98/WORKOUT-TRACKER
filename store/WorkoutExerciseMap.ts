import { create } from 'zustand';

export type WorkoutExercise = {
  id: string;
  sets: number;
  position: number;
};

type WorkoutExerciseState = {
  formData: Record<string, WorkoutExercise>;
  reset: () => void;
  upsert: (exercise: WorkoutExercise) => void;
  remove: (id: string) => void;
};

const useWorkoutExerciseStore = create<WorkoutExerciseState>((set) => ({
  formData: {},

  reset: () => set({ formData: {} }),

  upsert: (exercise) =>
    set((state) => ({
      formData: {
        ...state.formData,
        [exercise.id]: exercise,
      },
    })),

  remove: (id) =>
    set((state) => {
      const formData = { ...state.formData };
      delete formData[id];

      return { formData };
    }),
}));

export default useWorkoutExerciseStore;
