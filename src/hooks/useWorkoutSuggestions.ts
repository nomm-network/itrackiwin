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
      // TODO: Re-implement when fn_suggest_warmup function is available
      // For now, return empty suggestion
      return {
        exercise_id: exerciseId,
        target_weight_kg: workingWeight || 100,
        warmup_sets: [],
        total_warmup_time_estimate: 0
      };
    },
    enabled: !!exerciseId,
  });
};

export const useSetSuggestion = (exerciseId: string, progressionType: string = 'linear', targetReps: number = 8) => {
  return useQuery({
    queryKey: ["set_suggestion", exerciseId, progressionType, targetReps],
    queryFn: async (): Promise<SetSuggestion> => {
      // TODO: Re-implement when fn_suggest_sets function is available
      // For now, return basic suggestion
      return {
        exercise_id: exerciseId,
        progression_type: progressionType,
        suggested_weight: 100,
        suggested_sets: 3,
        target_reps: targetReps,
        notes: 'Basic suggestion'
      };
    },
    enabled: !!exerciseId,
  });
};

export const useRestSuggestion = (workoutSetId: string, effortLevel: string = 'moderate') => {
  return useQuery({
    queryKey: ["rest_suggestion", workoutSetId, effortLevel],
    queryFn: async (): Promise<number> => {
      // TODO: Re-implement when fn_suggest_rest_seconds function is available
      // For now, return basic rest time
      return 120;
    },
    enabled: !!workoutSetId,
  });
};

export const useStagnationDetection = (exerciseId: string, lookbackSessions: number = 5) => {
  return useQuery({
    queryKey: ["stagnation_detection", exerciseId, lookbackSessions],
    queryFn: async (): Promise<StagnationAlert> => {
      // TODO: Re-implement when fn_detect_stagnation function is available
      // For now, return no stagnation
      return {
        stagnation_detected: false,
        sessions_analyzed: 0,
        analysis_date: new Date().toISOString()
      };
    },
    enabled: !!exerciseId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};