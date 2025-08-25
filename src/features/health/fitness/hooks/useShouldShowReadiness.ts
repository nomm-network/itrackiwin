import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useShouldShowReadiness(workoutId?: string, userId?: string) {
  return useQuery({
    queryKey: ['shouldShowReadiness', workoutId, userId],
    enabled: Boolean(workoutId && userId),
    queryFn: async () => {
      // 1) Confirm workout is active
      const { data: w, error: wErr } = await supabase
        .from('workouts')
        .select('id, ended_at, user_id')
        .eq('id', workoutId!)
        .maybeSingle();
      if (wErr) throw wErr;
      if (!w || w.ended_at) return false;

      // 2) Check existence in the canonical table
      const { data: c, error: cErr } = await supabase
        .from('pre_workout_checkins')
        .select('id')
        .eq('workout_id', workoutId!)
        .eq('user_id', userId!)
        .limit(1);
      if (cErr) throw cErr;

      return (c?.length ?? 0) === 0;
    },
    staleTime: 60_000,
  });
}