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

export async function saveTodayReadiness(p: ReadinessPayload): Promise<number> {
  console.group('🔥 READINESS API CALL');
  console.log('📤 Sending payload:', p);
  console.log('📤 RPC parameters:', {
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
    console.error('❌ SUPABASE RPC ERROR:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
      payload: p
    });
    console.groupEnd();
    throw new Error(error.message || 'Failed to save readiness check.');
  }
  
  console.log('✅ SUCCESS - Received data:', data);
  console.groupEnd();
  return Number(data ?? 0); // 0–100 directly from new function
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