import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from './useUserProfile';
import type { WeightUnit } from '@/lib/weightConversion';

export interface WorkoutSession {
  id: string;
  session_unit: WeightUnit;
}

/**
 * Get the current workout's session unit
 */
export const useWorkoutSessionUnit = (workoutId?: string) => {
  return useQuery({
    queryKey: ['workout-session-unit', workoutId],
    queryFn: async () => {
      if (!workoutId) return null;
      
      const { data, error } = await supabase
        .from('workouts')
        .select('session_unit')
        .eq('id', workoutId)
        .single();
      
      if (error) throw error;
      return data.session_unit as WeightUnit;
    },
    enabled: !!workoutId,
    staleTime: Infinity, // Session unit is frozen per workout
  });
};

/**
 * Get effective display unit (session unit if in workout, user default otherwise)
 */
export const useDisplayUnit = (workoutId?: string) => {
  const { data: userProfile } = useUserProfile();
  const { data: sessionUnit } = useWorkoutSessionUnit(workoutId);
  
  // In workout: use session unit; otherwise use user default
  return workoutId ? (sessionUnit || userProfile?.default_unit || 'kg') : (userProfile?.default_unit || 'kg');
};

/**
 * Set workout session unit (only allowed at workout start)
 */
export const useSetWorkoutSessionUnit = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ workoutId, sessionUnit }: { workoutId: string; sessionUnit: WeightUnit }) => {
      const { data, error } = await supabase
        .from('workouts')
        .update({ session_unit: sessionUnit })
        .eq('id', workoutId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['workout-session-unit', data.id], data.session_unit);
    },
  });
};

/**
 * Update user default unit preference
 */
export const useUpdateUserDefaultUnit = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (defaultUnit: WeightUnit) => {
      const { data, error } = await supabase
        .from('users')
        .update({ default_unit: defaultUnit })
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .select()
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['user-profile', data.id], data);
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
  });
};