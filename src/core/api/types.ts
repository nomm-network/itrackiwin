// Re-export shared schemas as types for the web app
export type {
  UserId,
  ExerciseId,
  TemplateId,
  ExperienceLevel,
  FitnessProfile,
  UpdateFitnessProfile,
  WorkoutTemplate,
  GenerateTemplateRequest,
  ExerciseAlternative,
  SuggestAlternativesRequest,
  EquipmentCapability,
  RecalibrationTrigger,
  ApiResponse,
  PaginatedResponse
} from '../../../supabase/functions/_shared/schemas.ts';

// Additional web-specific types
export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

export interface ApiRequestOptions {
  timeout?: number;
  retries?: number;
  signal?: AbortSignal;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}