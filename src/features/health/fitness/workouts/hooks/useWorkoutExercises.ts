import { useQuery } from '@tanstack/react-query';
import { WorkoutExercise } from '../types';

export const useWorkoutExercises = (workoutId: string) => {
  return useQuery({
    queryKey: ['workout-exercises', workoutId],
    queryFn: async () => {
      // Mock data for now - replace with actual API call
      return [
        {
          id: '1',
          display_name: 'Sample Exercise',
          target_sets: 3,
          target_reps: 10,
          target_weight_kg: 50,
          weight_unit: 'kg'
        }
      ] as WorkoutExercise[];
    },
  });
};