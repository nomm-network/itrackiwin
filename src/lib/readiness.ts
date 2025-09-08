import { supabase } from '@/integrations/supabase/client';

export type ReadinessInputs = {
  energy: number;          // 0..10
  sleepQuality: number;    // 0..10
  sleepHours: number;      // e.g., 0..14
  soreness: number;        // 0..10 (higher worse)
  stress: number;          // 0..10 (higher worse)
  isSick?: boolean;
  hadAlcohol24h?: boolean;
  energizers?: boolean;    // creatine / preworkout taken
};

const clamp = (v: number, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v));
const norm01 = (x: number) => clamp(x / 10);
const inv01  = (x: number) => 1 - norm01(x);

// Triangular scoring: peak at 8h, down to 0 at ±4h from 8
const sleepTri01 = (hours: number) => clamp(1 - Math.abs(hours - 8) / 4);

export function computeReadiness(inputs: ReadinessInputs) {
  const e = norm01(inputs.energy);
  const q = norm01(inputs.sleepQuality);
  const h = sleepTri01(inputs.sleepHours);
  const sInv = inv01(inputs.soreness);
  const stInv = inv01(inputs.stress);

  // Base weighted average (0..1)
  const base =
      0.25 * e +
      0.20 * q +
      0.15 * h +
      0.15 * sInv +
      0.15 * stInv;

  let score = base * 100;             // 0..100
  if (inputs.energizers) score += 3;  // small boost

  if (inputs.isSick)       score -= 20;
  if (inputs.hadAlcohol24h) score -= 10;

  score = clamp(score, 0, 100);
  return {
    score,           // number 0..100
    breakdown: { e, q, h, sInv, stInv, base },
  };
}

/**
 * Compute readiness score for a specific check-in
 */
export async function computeReadinessScore(checkinId: string, persist: boolean = true): Promise<number> {
  const { data, error } = await supabase.rpc('fn_compute_readiness_score_v1', {
    p_checkin_id: checkinId,
    p_persist: persist,
  });
  
  if (error) {
    console.error('Error computing readiness score:', error);
    throw error;
  }
  
  return Number(data || 65); // Default moderate score if null
}

/**
 * Get the current user's latest readiness score
 */
export async function getCurrentUserReadinessScore(): Promise<number> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase.rpc('compute_readiness_for_user', {
    p_user_id: user.id,
  });
  
  if (error) {
    console.error('Error getting user readiness score:', error);
    throw error;
  }
  
  return Number(data || 65); // Default moderate score if null
}

/**
 * Get the latest readiness check-in with computed score for a user
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