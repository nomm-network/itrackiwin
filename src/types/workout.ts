export interface WorkoutSet {
  id: string;
  set_index: number;
  weight: number;
  weight_unit: string;
  reps: number;
  is_completed: boolean;
}

export interface WorkoutExercise {
  id: string;
  display_name: string;
  sets: WorkoutSet[];
}