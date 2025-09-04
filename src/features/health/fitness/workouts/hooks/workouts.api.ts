// src/features/health/fitness/workouts/hooks/workouts.api.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useStartWorkout = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ templateId }: { templateId?: string }) => {
      const { data, error } = await supabase.rpc('start_workout', { p_template_id: templateId ?? null });
      if (error) throw error;
      return { workoutId: data as string };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workouts'] });
      qc.invalidateQueries({ queryKey: ['active-workout'] });
    }
  });
};

export const useWorkoutSession = (workoutId: string) => {
  return useQuery({
    queryKey: ['workout-session', workoutId],
    queryFn: async () => {
      // Pull workout + exercises; include last set info via server view or joins
      const { data: w, error } = await supabase
        .from('workouts')
        .select(`
          id, started_at, template_id,
          workout_exercises (
            id, exercise_id, display_name, order_index,
            target_sets, target_reps, target_weight_kg, weight_unit, grip_key,
            attribute_values_json,
            exercises:exercise_id ( id, slug, display_name )
          )
        `)
        .eq('id', workoutId)
        .single();
      if (error) throw error;

      // Optionally pull last-set info per exercise (lightweight query)
      const exerciseIds = (w?.workout_exercises ?? []).map((e:any)=>e.exercise_id);
      let last = [] as any[];
      if (exerciseIds.length) {
        // Fallback to manual query if RPC doesn't exist yet
        const { data: lastRows } = await supabase
          .from('workout_sets')
          .select(`
            workout_exercise_id,
            weight_kg,
            reps,
            completed_at,
            workout_exercises!inner(exercise_id)
          `)
          .in('workout_exercises.exercise_id', exerciseIds)
          .order('completed_at', { ascending: false })
          .limit(1);
        last = lastRows ?? [];
      }
      return { workout: w, last };
    },
  });
};

export const useLogSet = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      workout_exercise_id: string;
      set_index: number;
      weight_kg: number | null;
      reps: number | null;
      rpe?: number | null;
      pain?: string | null; // 'none' | 'minor' | 'hurt'
    }) => {
      const { data, error } = await supabase
        .from('workout_sets')
        .insert({
          workout_exercise_id: payload.workout_exercise_id,
          set_index: payload.set_index,
          weight_kg: payload.weight_kg,
          reps: payload.reps,
          rpe: payload.rpe ?? null,
          pain_flag: payload.pain ?? null,
          completed_at: new Date().toISOString(),
        })
        .select('id')
        .single();
      if (error) throw error;
      return data.id as string;
    },
    onSuccess: (_id, vars) => {
      qc.invalidateQueries({ queryKey: ['workout-session'] });
      qc.invalidateQueries({ queryKey: ['workout-sets', vars.workout_exercise_id] });
    }
  });
};