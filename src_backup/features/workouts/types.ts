// Normalized TypeScript interfaces for workout system

export interface TemplateExercise {
  id: string;
  template_id: string;
  exercise_id: string;
  order_index: number;
  default_sets: number;
  target_reps: number | null;
  target_weight_kg: number | null;  // <- NORMALIZED: always use this
  weight_unit: 'kg' | 'lb' | null;
  notes: string | null;
}

export interface WorkoutExercise {
  id: string;
  workout_id: string;
  exercise_id: string;
  order_index: number;
  target_sets: number;
  target_reps: number | null;
  target_weight_kg: number | null;  // <- NORMALIZED: always use this
  weight_unit: 'kg' | 'lb' | null;
  notes: string | null;
  grip_id: string | null;
}

export interface StartWorkoutParams {
  templateId?: string;
}

export interface StartWorkoutResult {
  workoutId: string;
}