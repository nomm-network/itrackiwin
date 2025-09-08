import { supabase } from '@/integrations/supabase/client';

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