// Import the new optimized API functions
import { saveTodayReadiness as saveReadinessAPI, fetchTodayReadiness } from './api/readiness';
import { computeReadinessScore, type ReadinessInput } from './readiness/calc';
import { useReadinessStore, type ReadinessState } from '@/stores/readinessStore';
import { supabase } from '@/integrations/supabase/client';

export type ReadinessInputs = ReadinessInput;

// Re-export the main calculator and API functions
export { computeReadinessScore } from './readiness/calc';
export { fetchTodayReadiness } from './api/readiness';

/**
 * Save today's readiness data using the new RPC function
 * This is the main function used by the UI components
 */
export async function saveTodayReadiness(input: ReadinessInput): Promise<number> {
  console.log('💾 saveTodayReadiness called with input:', input);
  
  // Convert ReadinessInput to ReadinessPayload format
  const payload = {
    energy: input.energy,
    sleep_quality: input.sleepQuality,
    sleep_hours: input.sleepHours,
    soreness: input.soreness,
    stress: input.stress,
    mood: 6, // Default mood value - can be enhanced later
    energizers: input.preworkout,
    illness: false, // Not currently captured in ReadinessInput
    alcohol: false, // Not currently captured in ReadinessInput
  };

  // Use the new RPC-based API
  const score = await saveReadinessAPI(payload);
  
  // Update store immediately
  const today = new Date().toISOString().slice(0, 10);
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
 * Uses the new fetchTodayReadiness API function
 */
export async function loadTodayReadiness(): Promise<ReadinessState | null> {
  const score = await fetchTodayReadiness();
  
  if (score === null) {
    return null;
  }

  const today = new Date().toISOString().slice(0, 10);
  
  // For now, we only have the score. We can extend this later to fetch all data
  const readinessState: ReadinessState = {
    date: today,
    score,
    // These will be populated when we fetch complete data
    energy: undefined,
    sleepQuality: undefined,
    sleepHours: undefined,
    soreness: undefined,
    stress: undefined,
    preworkout: undefined,
  };

  // Update store
  useReadinessStore.getState().setReadiness(readinessState);

  return readinessState;
}

/**
 * Get the current user's latest readiness score (legacy function for compatibility)
 */
export async function getCurrentUserReadinessScore(): Promise<number> {
  const score = await fetchTodayReadiness();
  return score ?? 0; // Return 0 instead of 65 fallback
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