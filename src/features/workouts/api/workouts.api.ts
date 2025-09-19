import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { updateWarmupForWorkout } from '@/features/workouts/warmup/updateWarmupForWorkout';

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
          template_id,
          program_id,
          program_position,
          program_template_id,
          template:template_id(id, name),
          training_programs:program_id(id, name),
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
              body_part_id,
              load_type,
              equipment_ref_id,
              load_mode,
              effort_mode
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

// ✅ UNIFIED START WORKOUT - One clean function that calls the simplified RPC
export const useStartWorkout = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (options: { templateId?: string; templateName?: string } = {}) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      // If we have a template, fetch its name to stamp on the workout
      let templateName = options.templateName;
      if (options.templateId && !templateName) {
        const { data: templateData } = await supabase
          .from('workout_templates')
          .select('name')
          .eq('id', options.templateId)
          .single();
        templateName = templateData?.name;
      }
      
      const { data, error } = await supabase.rpc('start_workout', {
        p_template_id: options.templateId || null
      });
      
      if (error) throw error;
      
      // Stamp the template name on the workout if available
      if (templateName && data) {
        await supabase
          .from('workouts')
          .update({ title: templateName })
          .eq('id', data);
      }
      
      return { workoutId: data };
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
      // Update warmup plan after logging a working set
      if (variables.set_kind === 'normal' || !variables.set_kind) {
        try {
          // Get user ID from auth
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await updateWarmupForWorkout({
              workoutExerciseId: variables.workout_exercise_id,
              userId: user.id,
            });
          }
        } catch (error) {
          console.error('Failed to update warmup after set log:', error);
        }
      }
      
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