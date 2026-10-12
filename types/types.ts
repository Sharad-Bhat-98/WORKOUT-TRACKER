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
