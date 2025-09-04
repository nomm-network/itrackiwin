import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type WarmupStep = { 
  kg: number; 
  reps: number; 
  rest_s: number; 
};

export type WorkoutSet = { 
  id: string; 
  set_index: number; 
  reps: number | null; 
  weight_kg: number | null; 
  set_kind: 'normal' | 'warmup' | 'top_set' | 'backoff'; 
  is_completed: boolean; 
  rest_seconds: number | null; 
};

export type WorkoutExercise = {
  id: string; 
  order_index: number;
  target_reps: number | null; 
  target_weight_kg: number | null; 
  weight_unit: 'kg' | 'lb' | null;
  attribute_values_json: { warmup?: WarmupStep[] } | null;
  exercise: { 
    id: string; 
    display_name: string | null; 
    slug: string; 
  };
  workout_sets: WorkoutSet[];
};

export type Workout = { 
  id: string; 
  title: string | null; 
  started_at: string; 
  workout_exercises: WorkoutExercise[]; 
};

export const useWorkout = (workoutId: string) => {
  return useQuery({
    queryKey: ['workout', workoutId],
    queryFn: async (): Promise<Workout> => {
      const { data, error } = await supabase
        .from('workouts')
        .select(`
          id, title, started_at,
          workout_exercises:workout_exercises!inner (
            id, order_index, target_reps, target_weight_kg, weight_unit, attribute_values_json,
            exercise:exercises!inner ( id, display_name, slug ),
            workout_sets ( id, set_index, set_kind, reps, weight_kg, is_completed, rest_seconds )
          )
        `)
        .eq('id', workoutId)
        .single();

      if (error) throw error;
      return data as Workout;
    },
    enabled: !!workoutId,
  });
};