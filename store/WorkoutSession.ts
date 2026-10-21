import { create } from 'zustand';

type workoutSessionType = {
  sessionId: string;
  workoutId: string;
  exerciseId: string;
  prevSessions: string[];
  exerciseList: string[];
  index: number;
  setNextExercise: () => string;
  reset: () => void;
  setWorkout: (workoutId: string) => void;
  setExercise: (exerciseId: string) => void;
  setInitialValue: (
    sessionId: string,
    workoutId: string,
    exerciseId: string,
    prevSessions: string[],
    exerciseList: string[]
  ) => void;
};
const initialState = {
  sessionId: '',
  workoutId: '',
  exerciseId: '',
  prevSessions: [],
  exerciseList: [],
  index: -1,
};
const useWorkoutSessionStore = create<workoutSessionType>((set, get) => ({
  ...initialState,

  setNextExercise: () => {
    let nextExercise = '';
    const index = get().index;
    const exerciseLength = get().exerciseList.length;
    if (index + 1 >= exerciseLength) throw new Error('Index Exceeded');
    set((state) => {
      nextExercise = state.exerciseList[state.index + 1];
      return {
        ...state,
        exerciseId: state.exerciseList[state.index + 1],
        index: state.index + 1,
      };
    });
    return nextExercise;
  },
  reset: () =>
    set((state) => ({
      ...state,
      ...initialState,
    })),
  setWorkout: (workoutId) => set((state) => ({ ...state, workoutId })),
  setExercise: (exerciseId) => set((state) => ({ ...state, exerciseId, index: state.index + 1 })),
  setInitialValue: (sessionId, workoutId, exerciseId, prevSessions, exerciseList) =>
    set((state) => ({
      ...state,
      exerciseId,
      workoutId,
      exerciseList,
      prevSessions,
      index: 0,
      sessionId,
    })),
}));

export default useWorkoutSessionStore;
