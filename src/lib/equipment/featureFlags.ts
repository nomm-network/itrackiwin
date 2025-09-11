import { supabase } from '@/integrations/supabase/client';

export interface FeatureFlag {
  key: string;
  enabled: boolean;
}

export async function getFeatureFlag(key: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('app_flags')
      .select('enabled')
      .eq('key', key)
      .maybeSingle();

    if (error) {
      console.error('Error fetching feature flag:', error);
      return false;
    }

    return data?.enabled ?? false;
  } catch (error) {
    console.error('Feature flag check failed:', error);
    return false;
  }
}

export async function logWeightResolution(log: {
  user_id?: string;
  exercise_id?: string;
  gym_id?: string;
  desired_weight: number;
  resolved_weight: number;
  implement: string;
  resolution_source: string;
  feature_version?: string;
}) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('weight_resolution_log')
      .insert({
        user_id: user.id,
        exercise_id: log.exercise_id || null,
        gym_id: log.gym_id || null,
        desired_weight: log.desired_weight,
        resolved_weight: log.resolved_weight,
        implement: log.implement,
        resolution_source: log.resolution_source,
        feature_version: log.feature_version || 'v1'
      });
  } catch (error) {
    console.error('Failed to log weight resolution:', error);
  }
}