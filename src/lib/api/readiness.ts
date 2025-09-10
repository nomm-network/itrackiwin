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

/**
 * Save today's readiness data using the optimized RPC function
 * Returns the computed score as 0-100 for UI display
 */
export async function saveTodayReadiness(payload: ReadinessPayload): Promise<number> {
  console.log('🔄 Saving readiness via RPC:', payload);
  
  const { data, error } = await supabase
    .rpc('upsert_readiness_today', {
      p_energy: payload.energy,
      p_sleep_quality: payload.sleep_quality,
      p_sleep_hours: payload.sleep_hours,
      p_soreness: payload.soreness,
      p_stress: payload.stress,
      p_mood: payload.mood,
      p_energizers: payload.energizers,
      p_illness: payload.illness,
      p_alcohol: payload.alcohol,
    });

  if (error) {
    console.error('❌ RPC error:', error);
    throw error;
  }

  const score = Number(data ?? 0);
  console.log('✅ RPC completed, score:', score);
  return score;
}

/**
 * Fetch today's readiness score from the database
 * Returns null if no readiness data exists for today
 */
export async function fetchTodayReadiness(): Promise<number | null> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }

  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD format
  
  const { data, error } = await supabase
    .from('readiness_checkins')
    .select('score, computed_at')
    .eq('user_id', user.id)
    .eq('checkin_date', today)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching readiness:', error);
    throw error;
  }

  if (!data) {
    return null;
  }

  // DB score is 0-10, convert to 0-100 for UI
  const score = Math.round(Number(data.score ?? 0) * 10);
  console.log('📊 Fetched readiness score:', score);
  return score;
}

/**
 * Fetch today's complete readiness form data for prefilling
 */
export async function fetchTodayReadinessData(): Promise<Partial<ReadinessPayload> | null> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
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