// API Types - Shared schemas for type safety
// Note: Using plain TypeScript types for edge function compatibility

// Base types
export type UserId = string;
export type ExerciseId = string;
export type TemplateId = string;

// Experience Level Type
export type ExperienceLevel = 'new' | 'returning' | 'intermediate' | 'advanced' | 'very_experienced';

// Fitness Profile Types
export interface MuscleGroupPriority {
  muscle_group_id: string;
  priority: number; // 1-5
}

export interface FitnessProfile {
  user_id: UserId;
  experience_level: ExperienceLevel;
  sex: 'male' | 'female' | 'other';
  age?: number;
  weight?: number;
  height?: number;
  goals: string[];
  muscle_group_priorities: MuscleGroupPriority[];
  training_frequency: number;
  session_duration_minutes: number;
  created_at?: string;
  updated_at?: string;
}

export interface UpdateFitnessProfile {
  experience_level?: ExperienceLevel;
  sex?: 'male' | 'female' | 'other';
  age?: number;
  weight?: number;
  height?: number;
  goals?: string[];
  muscle_group_priorities?: MuscleGroupPriority[];
  training_frequency?: number;
  session_duration_minutes?: number;
}

// Template Types
export interface TemplateExercise {
  exercise_id: ExerciseId;
  order_index: number;
  default_sets: number;
  target_reps: number;
  target_weight?: number;
  rest_seconds?: number;
}

export interface WorkoutTemplate {
  id?: TemplateId;
  user_id: UserId;
  name: string;
  description?: string;
  exercises: TemplateExercise[];
  estimated_duration?: number;
  difficulty_level?: 'beginner' | 'intermediate' | 'advanced';
  created_at?: string;
  updated_at?: string;
}

export interface GenerateTemplateRequest {
  user_id: UserId;
  target_muscle_groups?: string[];
  session_duration?: number;
  equipment_ids?: string[];
  difficulty_preference?: 'auto' | 'beginner' | 'intermediate' | 'advanced';
}

// Exercise Alternative Types
export interface ExerciseAlternative {
  exercise_id: ExerciseId;
  name: string;
  reason: string;
  similarity_score: number;
  equipment_required: string[];
}

export interface SuggestAlternativesRequest {
  exercise_id: ExerciseId;
  user_id: UserId;
  reason?: 'equipment_unavailable' | 'injury_concern' | 'preference' | 'progression';
  available_equipment?: string[];
  limit?: number;
}

// Equipment Capability Types
export interface EquipmentCapability {
  equipment_id: string;
  name: string;
  supported_exercises: ExerciseId[];
  muscle_groups: string[];
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  space_requirement: 'minimal' | 'moderate' | 'large';
  setup_time_minutes: number;
}

// Recalibration Types
export interface RecalibrationTrigger {
  user_id?: UserId;
  force_recalibration?: boolean;
  target_exercises?: ExerciseId[];
  recalibration_type?: 'performance' | 'preference' | 'equipment' | 'all';
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    has_more: boolean;
  };
}