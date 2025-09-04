import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { WorkoutExercise } from '../types';

export const useWorkoutExercises = (workoutId: string) => {
  return useQuery({
    queryKey: ['workout-exercises', workoutId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workout_exercises')
        .select(`
          *,
          exercises(
            id,
            display_name,
            slug
          )
        `)
        .eq('workout_id', workoutId)
        .order('order_index');

      if (error) throw error;
      return data as WorkoutExercise[];
    },
  });
};