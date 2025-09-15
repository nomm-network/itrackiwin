import { supabase } from '@/integrations/supabase/client';

// Frontend contract (thin & stable)
export async function saveReadiness({
  energy, sleep_quality, sleep_hours,
  soreness, stress, mood,
  energizers, illness, alcohol,
  workout_id,
}: {
  energy: number; 
  sleep_quality: number; 
  sleep_hours: number;
  soreness: number; 
  stress: number; 
  mood: number;
  energizers: boolean; 
  illness: boolean; 
  alcohol: boolean;
  workout_id?: string | null;
}): Promise<number> {
  const { data, error } = await supabase.rpc('upsert_readiness_today', {
    p_energy: energy,
    p_sleep_quality: sleep_quality,
    p_sleep_hours: sleep_hours,
    p_soreness: soreness,
    p_stress: stress,
    p_mood: mood,
    p_energizers: energizers,
    p_illness: illness,
    p_alcohol: alcohol,
    p_workout_id: workout_id ?? null,
  });
  if (error) throw error;
  return Number(data ?? 0); // 0..100
}

// Legacy compatibility - use saveReadiness instead
export async function saveTodayReadiness(p: {
  energy: number;
  sleep_quality: number;
  sleep_hours: number;
  soreness: number;
  stress: number;
  mood: number;
  energizers: boolean;
  illness: boolean;
  alcohol: boolean;
  workout_id?: string;
}): Promise<number> {
  return saveReadiness({
    energy: p.energy,
    sleep_quality: p.sleep_quality,
    sleep_hours: p.sleep_hours,
    soreness: p.soreness,
    stress: p.stress,
    mood: p.mood,
    energizers: p.energizers,
    illness: p.illness,
    alcohol: p.alcohol,
    workout_id: p.workout_id,
  });
}

export async function fetchTodayReadiness(): Promise<number|null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const today = new Date().toISOString().slice(0,10);
  const { data, error } = await supabase
    .from('readiness_checkins')
    .select('score')
    .eq('user_id', user.id)
    .eq('checkin_date', today)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    console.error('fetchTodayReadiness error', error);
    return null;
  }
  if (!data) return null;

  return Number(data.score ?? 0); // Already 0–100 from new function
}