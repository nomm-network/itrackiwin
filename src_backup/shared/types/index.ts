// Shared types for the application
export interface Workout {
  id: string;
  name: string;
  user_id: string;
  started_at?: string;
  completed_at?: string;
  exercises?: WorkoutExercise[];
}

export interface WorkoutExercise {
  id: string;
  workout_id: string;
  exercise_id: string;
  exercise_name?: string;
  order_index: number;
  sets?: WorkoutSet[];
}

export interface WorkoutSet {
  id: string;
  workout_exercise_id: string;
  weight?: number;
  reps?: number;
  duration_seconds?: number;
  rpe?: number;
  notes?: string;
  is_completed: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  primary_muscle_id?: string;
  equipment_id?: string;
  description?: string;
}

export interface TrainingProgram {
  id: string;
  name: string;
  description?: string;
  user_id: string;
  is_active: boolean;
  blocks?: ProgramBlock[];
}

export interface ProgramBlock {
  id: string;
  program_id: string;
  name: string;
  order_index: number;
  template_id: string;
}