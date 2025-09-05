import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type WorkoutSet = {
  id: string;
  workout_exercise_id: string;
  set_index: number;
  set_kind: 'warmup' | 'normal' | 'top_set' | 'backoff' | 'amrap';
  reps: number | null;
  weight_kg: number | null;
  is_completed: boolean | null;
  rest_seconds: number | null;
};

export type WorkoutExercise = {
  id: string;
  workout_id: string;
  exercise_id: string;
  order_index: number;
  target_reps: number | null;
  target_weight_kg: number | null;
  weight_unit: 'kg' | 'lb' | null;
  attribute_values_json: any | null;
  readiness_adjusted_from: string | null;
  exercise: {
    id: string;
    display_name: string | null;
    slug: string;
    equipment_id: string | null;
    load_type: string | null;
    tags: string[] | null;
  };
  workout_sets: WorkoutSet[];
};

export type WorkoutData = {
  id: string;
  user_id: string;
  template_id: string | null;
  started_at: string | null;
  ended_at: string | null;
  title: string | null; // in case you store it; we'll resolve name anyway
  // resolved name for header
  workout_title: string;
  exercises: WorkoutExercise[];
};

async function fetchWorkout(workoutId: string): Promise<WorkoutData> {
  const { data: w, error: wErr } = await supabase
    .from('workouts')
    .select('id,user_id,template_id,started_at,ended_at')
    .eq('id', workoutId)
    .single();

  if (wErr || !w) throw new Error(wErr?.message || 'Workout not found');

  // Resolve a nice title: Template name if exists, else "Workout session"
  let workout_title = 'Workout session';
  if (w.template_id) {
    const { data: tpl } = await supabase
      .from('workout_templates')
      .select('name')
      .eq('id', w.template_id)
      .maybeSingle();
    if (tpl?.name) workout_title = tpl.name;
  }

  const { data: wes, error: weErr } = await supabase
    .from('workout_exercises')
    .select(`
      id, workout_id, exercise_id, order_index,
      target_reps, target_weight_kg, weight_unit, attribute_values_json, readiness_adjusted_from,
      exercise:exercises!inner(id, display_name, slug, equipment_id, load_type, tags),
      workout_sets(
        id, workout_exercise_id, set_index, set_kind, reps, weight_kg, is_completed, rest_seconds
      )
    `)
    .eq('workout_id', workoutId)
    .order('order_index', { ascending: true });

  if (weErr) throw new Error(weErr.message);

  return {
    ...w,
    title: workout_title,
    workout_title,
    exercises: (wes || []) as WorkoutExercise[],
  };
}

export function useWorkout(workoutId: string | undefined) {
  return useQuery({
    queryKey: ['workout', workoutId],
    queryFn: () => {
      if (!workoutId) throw new Error('No workoutId');
      return fetchWorkout(workoutId);
    },
    enabled: !!workoutId,
  });
}