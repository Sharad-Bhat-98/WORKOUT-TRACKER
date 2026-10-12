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
  updateMultiple: (exercises: WorkoutExercise[]) => void;
  remove: (id: string) => void;
};

const useWorkoutExerciseStore = create<WorkoutExerciseState>((set) => ({
  formData: {},

  reset: () => set({ formData: {} }),

  upsert: (exercise) => {
    set((state) => ({ formData: { ...state.formData, [exercise.id]: { ...exercise } } }));
  },

  updateMultiple: (exercises) => {
    const exerciseObj = exercises.reduce((acc, cur) => ({ ...acc, [cur.id]: cur }), {});
    set((state) => ({ formData: { ...state.formData, ...exerciseObj } }));
  },

  remove: (id) =>
    set((state) => {
      const formData = { ...state.formData };
      delete formData[id];
      return { formData };
    }),
}));

export default useWorkoutExerciseStore;
