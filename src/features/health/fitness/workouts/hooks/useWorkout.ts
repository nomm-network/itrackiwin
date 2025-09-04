import { useQuery } from '@tanstack/react-query';

interface Workout {
  id: string;
  title: string;
}

export const useWorkout = (workoutId: string) => {
  return useQuery({
    queryKey: ['workout', workoutId],
    queryFn: async () => {
      // Mock data for now - replace with actual API call
      return { id: workoutId, title: 'Sample Workout' } as Workout;
    },
  });
};