import { supabase } from '@/integrations/supabase/client';
import { computeReadinessScore, type ReadinessInput } from './readiness/calc';
import { useReadinessStore, type ReadinessState } from '@/stores/readinessStore';

export type ReadinessInputs = ReadinessInput;

// Re-export the main calculator
export { computeReadinessScore } from './readiness/calc';

/**
 * Save today's readiness data and computed score
 */
export async function saveTodayReadiness(input: ReadinessInput): Promise<number> {
  console.log('💾 saveTodayReadiness called with input:', input);
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  console.log('👤 User authenticated:', user.id);

  const score = computeReadinessScore(input);
  console.log('📊 Computed score:', score);
  
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  console.log('📅 Today date:', today);

  const dbPayload = {
    user_id: user.id,
    checkin_at: new Date().toISOString(),
    energy: input.energy,
    sleep_quality: input.sleepQuality,
    sleep_hours: input.sleepHours,
    soreness: input.soreness,
    stress: input.stress,
    energizers: input.preworkout, // Use 'energizers' field
    score,
    computed_at: new Date().toISOString()
  };
  
  console.log('💿 DB payload:', dbPayload);

  // Save to database
  const { error } = await supabase
    .from('readiness_checkins')
    .upsert(dbPayload, { 
      onConflict: 'user_id,checkin_at',
      ignoreDuplicates: false 
    });

  if (error) {
    console.error('❌ DB error:', error);
    throw error;
  }
  
  console.log('✅ Successfully saved to DB');

  // Update store immediately
  const storePayload = {
    date: today,
    score,
    energy: input.energy,
    sleepQuality: input.sleepQuality,
    sleepHours: input.sleepHours,
    soreness: input.soreness,
    stress: input.stress,
    preworkout: input.preworkout,
  };
  
  console.log('🏪 Updating store with:', storePayload);
  useReadinessStore.getState().setReadiness(storePayload);

  return score;
}

/**
 * Load today's readiness data for the current user
 */
export async function loadTodayReadiness(): Promise<ReadinessState | null> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }

  const today = new Date().toISOString().slice(0, 10);
  
  const { data, error } = await supabase
    .from('readiness_checkins')
    .select('*')
    .eq('user_id', user.id)
    .gte('checkin_at', `${today}T00:00:00.000Z`)
    .lt('checkin_at', `${today}T23:59:59.999Z`)
    .order('checkin_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error loading readiness data:', error);
    return null;
  }

  if (!data) {
    return null;
  }

  const readinessState: ReadinessState = {
    date: today,
    score: Number(data.score) || 0,
    energy: Number(data.energy) || 0,
    sleepQuality: Number(data.sleep_quality) || 0,
    sleepHours: Number(data.sleep_hours) || 0,
    soreness: Number(data.soreness) || 0,
    stress: Number(data.stress) || 0,
    preworkout: Boolean(data.energizers),
  };

  // Update store
  useReadinessStore.getState().setReadiness(readinessState);

  return readinessState;
}

/**
 * Get the current user's latest readiness score (legacy function for compatibility)
 */
export async function getCurrentUserReadinessScore(): Promise<number> {
  const readiness = await loadTodayReadiness();
  return readiness?.score || 0; // Return 0 instead of 65 fallback
}

/**
 * Get the latest readiness check-in with computed score for a user (legacy function)
 */
export async function getLatestReadinessCheckin(userId?: string) {
  let userIdToUse = userId;
  
  if (!userIdToUse) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    userIdToUse = user.id;
  }

  const { data, error } = await supabase
    .from('readiness_checkins')
    .select(`
      *,
      score,
      computed_at
    `)
    .eq('user_id', userIdToUse)
    .gte('checkin_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
    .order('checkin_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching latest readiness checkin:', error);
    throw error;
  }

  return data;
}

/**
 * Get readiness score color based on the score value
 */
export function getReadinessScoreColor(score: number): string {
  if (score >= 80) return 'text-green-500';
  if (score >= 60) return 'text-yellow-500';
  if (score >= 40) return 'text-orange-500';
  return 'text-red-500';
}

/**
 * Get readiness score description
 */
export function getReadinessScoreDescription(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Poor';
}

/**
 * Format readiness score for display
 */
export function formatReadinessScore(score: number): string {
  return Math.round(score).toString();
}