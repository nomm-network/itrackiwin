import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface WarmupSuggestion {
  exercise_id: string;
  target_weight_kg: number;
  warmup_sets: Array<{
    set_index: number;
    weight: number;
    reps: number;
    set_kind: string;
    rest_seconds: number;
  }>;
  total_warmup_time_estimate: number;
}

export interface SetSuggestion {
  exercise_id: string;
  progression_type: string;
  suggested_weight: number;
  suggested_sets: number;
  target_reps: number;
  last_weight?: number;
  estimated_1rm?: number;
  notes: string;
}

export interface StagnationAlert {
  stagnation_detected: boolean;
  trend_direction?: string;
  sessions_analyzed: number;
  avg_weight?: number;
  weight_variance?: number;
  recent_weights?: number[];
  recommendations?: string[];
  analysis_date: string;
}

export const useWarmupSuggestion = (exerciseId: string, workingWeight?: number, workingReps: number = 8) => {
  return useQuery({
    queryKey: ["warmup_suggestion", exerciseId, workingWeight, workingReps],
    queryFn: async (): Promise<WarmupSuggestion> => {
      const { data, error } = await supabase.rpc('fn_suggest_warmup', {
        p_exercise_id: exerciseId,
        p_working_weight: workingWeight,
        p_working_reps: workingReps
      });
      
      if (error) throw error;
      return data as unknown as WarmupSuggestion;
    },
    enabled: !!exerciseId,
  });
};

export const useSetSuggestion = (exerciseId: string, progressionType: string = 'linear', targetReps: number = 8) => {
  return useQuery({
    queryKey: ["set_suggestion", exerciseId, progressionType, targetReps],
    queryFn: async (): Promise<SetSuggestion> => {
      const { data, error } = await supabase.rpc('fn_suggest_sets', {
        p_exercise_id: exerciseId,
        p_progression_type: progressionType,
        p_target_reps: targetReps
      });
      
      if (error) throw error;
      return data as unknown as SetSuggestion;
    },
    enabled: !!exerciseId,
  });
};

export const useRestSuggestion = (workoutSetId: string, effortLevel: string = 'moderate') => {
  return useQuery({
    queryKey: ["rest_suggestion", workoutSetId, effortLevel],
    queryFn: async (): Promise<number> => {
      const { data, error } = await supabase.rpc('fn_suggest_rest_seconds', {
        p_workout_set_id: workoutSetId,
        p_effort_level: effortLevel
      });
      
      if (error) throw error;
      return data as number;
    },
    enabled: !!workoutSetId,
  });
};

export const useStagnationDetection = (exerciseId: string, lookbackSessions: number = 5) => {
  return useQuery({
    queryKey: ["stagnation_detection", exerciseId, lookbackSessions],
    queryFn: async (): Promise<StagnationAlert> => {
      const { data, error } = await supabase.rpc('fn_detect_stagnation', {
        p_exercise_id: exerciseId,
        p_lookback_sessions: lookbackSessions
      });
      
      if (error) throw error;
      return data as unknown as StagnationAlert;
    },
    enabled: !!exerciseId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

// REMOVED: Legacy useAdvancedWorkoutStart - use useStartWorkout from workouts.api.ts instead