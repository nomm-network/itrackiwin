import { supabase } from '@/integrations/supabase/client';

export type ReadinessPayload = {
  energy: number;
  sleep_quality: number;
  sleep_hours: number;
  soreness: number;
  stress: number;
  mood: number;
  energizers: boolean;
  illness: boolean;
  alcohol: boolean;
};

// Returns 0–100
export async function saveTodayReadiness(p: ReadinessPayload): Promise<number> {
  const { data, error } = await supabase.rpc('upsert_readiness_today', {
    p_energy: p.energy,
    p_sleep_quality: p.sleep_quality,
    p_sleep_hours: p.sleep_hours,
    p_soreness: p.soreness,
    p_stress: p.stress,
    p_mood: p.mood,
    p_energizers: p.energizers,
    p_illness: p.illness,
    p_alcohol: p.alcohol,
  });
  if (error) {
    console.error('upsert_readiness_today failed', error);
    throw new Error(error.message || 'Failed to save readiness check.');
  }
  return Number(data ?? 0); // 0–100
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

  return Math.round(Number(data.score ?? 0) * 10); // convert 0–10 → 0–100
}

/**
 * Fetch today's complete readiness form data for prefilling
 */
export async function fetchTodayReadinessData(): Promise<Partial<ReadinessPayload> | null> {
  // Check authentication first
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    console.log('⚠️ Not authenticated, cannot fetch readiness data');
    return null;
  }

  const today = new Date().toISOString().slice(0, 10);
  
  const { data, error } = await supabase
    .from('readiness_checkins')
    .select('energy, sleep_quality, sleep_hours, soreness, stress, mood, energizers, illness, alcohol')
    .eq('user_id', user.id)
    .eq('checkin_date', today)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching readiness data:', error);
    return null;
  }

  if (!data) {
    return null;
  }

  return {
    energy: data.energy ?? 5,
    sleep_quality: data.sleep_quality ?? 5,
    sleep_hours: data.sleep_hours ?? 8,
    soreness: data.soreness ?? 3,
    stress: data.stress ?? 3,
    mood: data.mood ?? 6,
    energizers: !!data.energizers,
    illness: !!data.illness,
    alcohol: !!data.alcohol,
  };
}