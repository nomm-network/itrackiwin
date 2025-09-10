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
  workout_id?: string; // Added workout_id parameter
};

export async function saveTodayReadiness(p: ReadinessPayload): Promise<number> {
  console.group('🔥 READINESS API CALL');
  console.log('📤 RAW PAYLOAD RECEIVED:', p);
  console.log('📤 ILLNESS IN PAYLOAD:', p.illness, typeof p.illness);
  console.log('📤 ALCOHOL IN PAYLOAD:', p.alcohol, typeof p.alcohol);
  console.log('📤 MOOD IN PAYLOAD:', p.mood, typeof p.mood);
  console.log('📤 ENERGIZERS IN PAYLOAD:', p.energizers, typeof p.energizers);
  
  // EXPLICIT DEBUGGING FOR THE EXACT RPC CALL
  const rpcParams = {
    p_energy: p.energy,
    p_sleep_quality: p.sleep_quality,
    p_sleep_hours: p.sleep_hours,
    p_soreness: p.soreness,
    p_stress: p.stress,
    p_mood: p.mood,
    p_energizers: p.energizers,
    p_illness: p.illness,
    p_alcohol: p.alcohol,
    p_workout_id: p.workout_id || null,
  };
  
  console.log('📤 EXACT RPC PARAMETERS BEING SENT:', rpcParams);
  console.log('📤 MOOD PARAMETER:', rpcParams.p_mood, typeof rpcParams.p_mood);
  console.log('📤 ILLNESS PARAMETER:', rpcParams.p_illness, typeof rpcParams.p_illness);
  console.log('📤 ALCOHOL PARAMETER:', rpcParams.p_alcohol, typeof rpcParams.p_alcohol);
  
  const { data, error } = await supabase.rpc('upsert_readiness_today', rpcParams);
  
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