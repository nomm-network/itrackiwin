import { useQuery } from "@tanstack/react-query";

export const useExperienceLevels = (userId?: string) => {
  return useQuery({
    queryKey: ['user-coach-params', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      // TODO: Re-implement when get_user_coach_params function is available
      // For now, return default values
      return {
        experience_level: 'intermediate',
        goals: ['strength'],
        training_frequency: 3
      };
    },
    enabled: !!userId,
  });
};