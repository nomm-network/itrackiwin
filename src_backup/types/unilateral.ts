// Types for unilateral vs bilateral exercise tracking

export type UnilateralCapability = 'bilateral_only' | 'unilateral_only' | 'either';
export type WeightInputMode = 'total' | 'per_side' | 'stack';
export type UnilateralMode = 'bilateral' | 'unilateral_alternating' | 'unilateral_same' | 'auto';
export type SideType = 'left' | 'right' | 'both' | 'n/a';

export interface UnilateralSetData {
  left_weight?: number;
  left_reps?: number;
  right_weight?: number;
  right_reps?: number;
  side_notes?: Record<string, string>;
  side_pain?: Record<string, boolean>;
  is_alternating?: boolean;
  side?: SideType;
  side_pair_key?: string;
  side_order?: number;
}

export interface BilateralSetData {
  weight: number;
  reps: number;
  side: 'both';
}

export interface ExerciseWithUnilateral {
  id: string;
  unilateral_capability?: UnilateralCapability;
  default_weight_input_mode?: WeightInputMode;
  slug?: string;
  // ... other exercise fields
}

export interface WorkoutExerciseWithUnilateral {
  id: string;
  exercise_id: string;
  unilateral_mode_override?: UnilateralMode;
  // ... other workout exercise fields
}

export interface WorkoutSetWithUnilateral {
  id: string;
  workout_exercise_id: string;
  set_index: number;
  
  // Bilateral fields
  weight?: number;
  reps?: number;
  
  // Unilateral fields
  left_weight?: number;
  left_reps?: number;
  right_weight?: number;
  right_reps?: number;
  side_notes?: Record<string, string>;
  side_pain?: Record<string, boolean>;
  is_alternating?: boolean;
  side?: SideType;
  side_pair_key?: string;
  side_order?: number;
  total_weight?: number; // Generated column
  
  // Common fields
  is_completed?: boolean;
  rpe?: number;
  notes?: string;
  completed_at?: string;
}

export interface SideBias {
  user_id: string;
  exercise_id: string;
  left_top?: number;
  right_top?: number;
  bias_pct?: number; // positive means right stronger, negative means left stronger
  updated_at: string;
}

export interface SideStats {
  user_id: string;
  exercise_id: string;
  side: SideType;
  best_weight?: number;
  best_reps?: number;
  last_completed_at?: string;
}
