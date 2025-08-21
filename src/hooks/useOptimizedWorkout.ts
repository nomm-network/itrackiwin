import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Hook for opening workout with all data in one call
export const useWorkoutOpen = (workoutId: string) => {
  return useQuery({
    queryKey: ['workout-open', workoutId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('workout_open', {
        p_workout_id: workoutId
      });
      
      if (error) throw error;
      return data;
    },
    enabled: !!workoutId,
    staleTime: 30000, // 30 seconds
  });
};

// Hook for atomic set logging
export const useSetLog = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: {
      workout_exercise_id: string;
      set_index?: number;
      set_kind?: string;
      weight?: number;
      reps?: number;
      weight_unit?: string;
      duration_seconds?: number;
      distance?: number;
      rpe?: number;
      notes?: string;
      is_completed?: boolean;
      grip_ids?: string[];
      metrics?: Array<{
        metric_def_id: string;
        value: any;
      }>;
    }) => {
      const { data, error } = await supabase.rpc('set_log', {
        p_payload: payload
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ 
        queryKey: ['workout-open'] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['user-last-set'] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['user-pr'] 
      });
    },
  });
};

// Hook for optimized exercise search
export const useExerciseSearch = (
  query = '',
  equipmentId?: string,
  bodyPartId?: string,
  limit = 20,
  offset = 0
) => {
  return useQuery({
    queryKey: ['exercise-search', query, equipmentId, bodyPartId, limit, offset],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('exercise_search', {
        p_query: query,
        p_equipment_id: equipmentId || null,
        p_body_part_id: bodyPartId || null,
        p_limit: limit,
        p_offset: offset
      });
      
      if (error) throw error;
      return data;
    },
    staleTime: 300000, // 5 minutes for search results
  });
};

// Hook for getting user's last set for an exercise
export const useUserLastSet = (exerciseId?: string) => {
  return useQuery({
    queryKey: ['user-last-set', exerciseId],
    queryFn: async () => {
      if (!exerciseId) return null;
      
      const { data, error } = await supabase.rpc('get_user_last_set_for_exercise', {
        p_exercise_id: exerciseId
      });
      
      if (error) throw error;
      return data?.[0] || null;
    },
    enabled: !!exerciseId,
    staleTime: 60000, // 1 minute
  });
};

// Hook for getting user's PR for an exercise
export const useUserPR = (exerciseId?: string) => {
  return useQuery({
    queryKey: ['user-pr', exerciseId],
    queryFn: async () => {
      if (!exerciseId) return null;
      
      const { data, error } = await supabase.rpc('get_user_pr_for_exercise', {
        p_exercise_id: exerciseId
      });
      
      if (error) throw error;
      return data?.[0] || null;
    },
    enabled: !!exerciseId,
    staleTime: 300000, // 5 minutes for PRs
  });
};