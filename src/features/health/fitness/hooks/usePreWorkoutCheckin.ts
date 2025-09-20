import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function usePreWorkoutCheckin(workoutId?: string) {
  const qc = useQueryClient();

  // Has checkin?
  const hasCheckinQuery = useQuery({
    queryKey: ['pre-checkin', workoutId],
    enabled: !!workoutId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pre_workout_checkins')
        .select('id, readiness_score, created_at')
        .eq('workout_id', workoutId!)
        .maybeSingle();
      if (error && error.code !== 'PGRST116') throw error; // not found is ok
      return data ?? null;
    },
    staleTime: 60_000,
  });

  const createCheckin = useMutation({
    mutationFn: async (payload: { answers: any; readiness_score: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('pre_workout_checkins')
        .insert([{ 
          workout_id: workoutId, 
          user_id: user.id,
          answers: payload.answers, 
          readiness_score: payload.readiness_score,
          energisers_taken: payload.answers?.energisers_taken || false
        }])
        .select('id')
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pre-checkin', workoutId] });
      qc.invalidateQueries({ queryKey: ['workout-readiness', workoutId] });
      qc.invalidateQueries({ queryKey: ['workout-session', workoutId] });
    },
  });

  return {
    checkin: hasCheckinQuery.data,                // null => not done yet
    isChecking: hasCheckinQuery.isLoading,
    createCheckin,
  };
}