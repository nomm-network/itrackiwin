import { supabase } from '@/integrations/supabase/client';

export type PreCheckinInput = {
  energy: number; // 1-5
  sleep_quality: number; // 1-5
  sleep_hours: number; // actual hours
  muscle_soreness: number; // 1-5
  stress_level: number; // 1-5
  sick: boolean;
};

export function usePreCheckin() {
  return async function submit(c: PreCheckinInput, workoutId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    // Calculate readiness score locally (matches DB function)
    const readiness_score = Math.max(0, Math.min(100, 
      65 + // base
      (c.energy * 3) + // energy helps
      (c.sleep_quality * 2) - // sleep quality helps
      (c.muscle_soreness * 5) - // soreness hurts
      (c.stress_level * 5) + // stress hurts
      (c.sick ? -20 : 0) // sick is major penalty
    ));

    return supabase.from('pre_workout_checkins').insert({
      workout_id: workoutId,
      user_id: user.id,
      answers: c,
      readiness_score,
      energisers_taken: false // default
    });
  };
}