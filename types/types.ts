import { Href } from 'expo-router';
import { ReactNode } from 'react';

export type ImageType = {
  name: string;
  data: string;
};

export type WorkoutType = {
  id: string;
  name: string;
  data: string;
  count: number;
};

export type getExerciseType = {
  id: string;
  name: string;
  image: string;
};

export type ImageDeleteCardType = {
  title: string;
  imageData: string;
  handlePress?: () => void;
  description?: string;
  footer?: ReactNode;
};

export type BackButtonType = {
  path: Href;
};

export type getWorkoutByIdType = {
  id: string;
  name: string;
  description: string;
};

export type getWorkoutExerciseByIdType = {
  workout_id: string;
  id: string;
  position: number;
  target_sets: number;
};

export type getWorkoutDetailsType = WorkoutType & {
  exerciseId: string | null;
};

export type getExerciseSessionDetailsType = {
  ExerciseName: string;
  ImageData: string;
  WorkoutName: string;
  TargetSets: string;
};

export type getPrevSessionIdType = {
  id: string;
};

export type prevSessionRepsDetailsType = {
  set_no: number;
  reps: number;
  weight: number;
};

export type getPrevSetDetailsType = {
  logged_at: string;
  est_1rm: number;
  max_weight: number;
  total_reps: number;
  volume: number;
};

export type executeInsertUpdateOneTransactionType = {
  sql: string;
  args: Record<string, string | number>;
};

export type handleNextExerciseType = {
  sql: string;
  args: Record<string, string | number>;
};
