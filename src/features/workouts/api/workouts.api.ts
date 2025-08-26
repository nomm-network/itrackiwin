import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

// ============================================================================
// API LAYER - All Supabase interactions for workouts
// Rule: UI components never talk to Supabase directly; they call hooks here
// ============================================================================

// Query Keys - stable identifiers
export const workoutKeys = {
  all: ['workouts'] as const,
  active: (userId: string) => [...workoutKeys.all, 'active', userId] as const,
  byId: (workoutId: string) => [...workoutKeys.all, 'detail', workoutId] as const,
  sessions: (userId: string) => [...workoutKeys.all, 'sessions', userId] as const,
};

// ============================================================================
// CORE WORKOUT HOOKS
// ============================================================================

export const useActiveWorkout = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: workoutKeys.active(user?.id || ''),
    enabled: !!user?.id,
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('workouts')
        .select('id, user_id, started_at, ended_at, title')
        .eq('user_id', user.id)
        .is('ended_at', null)
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    refetchOnWindowFocus: true,
    staleTime: 15_000,
    retry: 1,
  });
};

export const useGetWorkout = (workoutId?: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: workoutKeys.byId(workoutId || ''),
    enabled: !!workoutId && !!user?.id,
    queryFn: async () => {
      if (!workoutId || !user?.id) return null;
      
      const { data, error } = await supabase
        .from('workouts')
        .select(`
          id,
          title,
          started_at,
          ended_at,
          user_id,
          exercises:workout_exercises(
            id,
            exercise_id,
            order_index,
            warmup_plan,
            exercise:exercises(
              id,
              slug,
              default_grip_ids,
              equipment:equipment(id, slug),
              primary_muscle:muscle_groups(id, slug),
              body_part:body_parts(id, slug)
            ),
            sets:workout_sets(
              id,
              set_index,
              weight,
              reps,
              weight_unit,
              rpe,
              notes,
              set_kind,
              is_completed,
              completed_at,
              workout_exercise_id,
              grips:workout_set_grips(
                grip:grips(id, slug)
              )
            )
          )
        `)
        .eq('id', workoutId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
    staleTime: 30_000,
  });
};

export const useStartQuickWorkout = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (options: { templateId?: string; useProgram?: boolean } = {}) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { data, error } = await supabase.rpc('start_workout', {
        p_template_id: options.templateId || null
      });
      
      if (error) throw error;
      return { workoutId: data };
    },
    onSuccess: () => {
      // Optimistically update cache
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: workoutKeys.active(user.id) });
        queryClient.invalidateQueries({ queryKey: workoutKeys.sessions(user.id) });
      }
    }
  });
};

export const useEndWorkout = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (workoutId: string) => {
      const { data, error } = await supabase.rpc('end_workout', {
        p_workout_id: workoutId
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Optimistically update cache - no more active workout
      if (user?.id) {
        queryClient.setQueryData(workoutKeys.active(user.id), null);
        queryClient.invalidateQueries({ queryKey: workoutKeys.sessions(user.id) });
      }
    }
  });
};

// ============================================================================
// SET LOGGING HOOKS
// ============================================================================

export const useLogSet = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (setData: {
      workout_exercise_id: string;
      weight?: number;
      reps?: number;
      weight_unit?: string;
      rpe?: number;
      notes?: string;
      set_kind?: string;
      is_completed?: boolean;
      grip_ids?: string[];
    }) => {
      const { data, error } = await supabase.rpc('set_log', {
        p_payload: setData
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      // Optimistically update workout cache instead of full reload
      const workoutId = variables.workout_exercise_id; // We'd need to track this
      // queryClient.invalidateQueries({ queryKey: workoutKeys.byId(workoutId) });
      
      // For now, invalidate broader cache
      queryClient.invalidateQueries({ queryKey: workoutKeys.all });
    }
  });
};

// ============================================================================
// PERFORMANCE VIEWS - Thin DTOs for mobile/FlutterFlow
// ============================================================================

export const useLastSetForExercise = (exerciseId?: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['exercise-last-set', user?.id, exerciseId],
    enabled: !!user?.id && !!exerciseId,
    queryFn: async () => {
      if (!user?.id || !exerciseId) return null;
      
      // Use existing materialized view
      const { data, error } = await supabase
        .from('mv_last_set_per_user_exercise')
        .select('*')
        .eq('user_id', user.id)
        .eq('exercise_id', exerciseId)
        .eq('rn', 1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    staleTime: 60_000, // Cache for 1 minute
  });
};

export const usePersonalRecord = (exerciseId?: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['personal-record', user?.id, exerciseId],
    enabled: !!user?.id && !!exerciseId,
    queryFn: async () => {
      if (!user?.id || !exerciseId) return null;
      
      const { data, error } = await supabase
        .from('mv_pr_weight_per_user_exercise')
        .select('*')
        .eq('user_id', user.id)
        .eq('exercise_id', exerciseId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    staleTime: 300_000, // Cache for 5 minutes
  });
};