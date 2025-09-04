import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
// TODO: Import warmup function from new location
// import { updateWarmupForWorkout } from '@/features/workouts/warmup/updateWarmupForWorkout';

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
      
      // First, get the workout with exercises (without translations)
      const { data: workoutData, error: workoutError } = await supabase
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
              default_grip_ids,
              equipment_id,
              primary_muscle_id,
              body_part_id
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
        .maybeSingle();

      if (workoutError) throw workoutError;
      if (!workoutData) return null;

      // Get exercise IDs to fetch translations separately
      const exerciseIds = workoutData.exercises?.map(ex => ex.exercise?.id).filter(Boolean) || [];
      
      // Fetch translations separately
      const { data: translationsData, error: translationsError } = await supabase
        .from('exercises_translations')
        .select('exercise_id, language_code, name, description')
        .in('exercise_id', exerciseIds);

      if (translationsError) {
        console.error('🔥 Failed to fetch translations:', translationsError);
      }

      // Merge translations into workout data
      if (translationsData && workoutData.exercises) {
        workoutData.exercises.forEach(workoutEx => {
          if (workoutEx.exercise) {
            const exerciseTranslations = translationsData.filter(
              t => t.exercise_id === workoutEx.exercise.id
            );
            // Add the translations to the exercise object
            (workoutEx.exercise as any).exercises_translations = exerciseTranslations;
          }
        });
      }

      console.log('🔍 Final workout data with translations:', JSON.stringify(workoutData, null, 2));
      
      return workoutData;
    },
    staleTime: 30_000,
  });
};

// ✅ UNIFIED START WORKOUT - Smart readiness-aware workout start
export const useStartWorkout = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (options: { templateId?: string } = {}) => {
      console.log('🚀 useStartWorkout: ===== AUTHENTICATION CHECK =====');
      console.log('🚀 useStartWorkout: User object:', user);
      console.log('🚀 useStartWorkout: User ID:', user?.id);
      console.log('🚀 useStartWorkout: Is authenticated:', !!user?.id);
      
      if (!user?.id) {
        console.error('🚀 useStartWorkout: NOT AUTHENTICATED - throwing error');
        throw new Error('Not authenticated - please log in first');
      }
      
      console.log('🚀 useStartWorkout: ===== DETAILED DEBUG START =====');
      console.log('🚀 useStartWorkout: User ID:', user.id);
      console.log('🚀 useStartWorkout: Input options:', options);
      console.log('🚀 useStartWorkout: Template ID being sent:', options.templateId || null);
      console.log('🚀 useStartWorkout: About to call RPC with params:', {
        p_template_id: options.templateId || null
      });
      
      // start_workout RPC returns a uuid directly
      const { data, error } = await supabase.rpc('start_workout', {
        p_template_id: options.templateId || null
      });
      
      console.log('🚀 useStartWorkout: ===== RPC RESPONSE =====');
      console.log('🚀 useStartWorkout: Raw data:', data);
      console.log('🚀 useStartWorkout: Raw error:', error);
      console.log('🚀 useStartWorkout: Data type:', typeof data);
      console.log('🚀 useStartWorkout: Error details:', error ? {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      } : 'No error');
      
      if (error) {
        console.error('🚀 useStartWorkout: RPC ERROR - throwing error');
        throw error;
      }
      
      // data is the workout_id directly
      const workoutId = data;
      console.log('🚀 useStartWorkout: Extracted workout ID:', workoutId);
      console.log('🚀 useStartWorkout: Workout ID type:', typeof workoutId);
      
      if (!workoutId) {
        console.error('🚀 useStartWorkout: NO WORKOUT ID - data was:', data);
        throw new Error('Failed to create workout - no ID returned');
      }
      
      console.log('🚀 useStartWorkout: ===== SUCCESS =====');
      console.log('🚀 useStartWorkout: Final workout ID:', workoutId);
      return { workoutId };
    },
    onSuccess: () => {
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
      notes?: string;
      set_kind?: string;
      is_completed?: boolean;
      grip_ids?: string[];
    }) => {
      // Remove any stray rpe from payload - it will be derived server-side from Feel in notes
      const { rpe, ...cleanPayload } = setData as any;
      
      const { data, error } = await supabase.rpc('set_log', {
        p_payload: cleanPayload
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: async (data, variables) => {
      // TODO: Re-enable warmup update after migration
      // Update warmup plan after logging a working set
      // if (variables.set_kind === 'normal' || !variables.set_kind) {
      //   try {
      //     // Get user ID from auth
      //     const { data: { user } } = await supabase.auth.getUser();
      //     if (user) {
      //       await updateWarmupForWorkout({
      //         workoutExerciseId: variables.workout_exercise_id,
      //         userId: user.id,
      //       });
      //     }
      //   } catch (error) {
      //     console.error('Failed to update warmup after set log:', error);
      //   }
      // }
      
      // Optimistically update workout cache instead of full reload
      const workoutId = variables.workout_exercise_id; // We'd need to track this
      // queryClient.invalidateQueries({ queryKey: workoutKeys.byId(workoutId) });
      
      // For now, invalidate broader cache
      queryClient.invalidateQueries({ queryKey: workoutKeys.all });
    }
  });
};

export const useUpdateSet = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (updateData: {
      setId: string;
      weight?: number;
      reps?: number;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from('workout_sets')
        .update({
          weight: updateData.weight,
          reps: updateData.reps,
          notes: updateData.notes
        })
        .eq('id', updateData.setId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate workout cache to refresh the UI
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