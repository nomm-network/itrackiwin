import { supabase } from '@/integrations/supabase/client';
import { getFeatureFlag, logWeightResolution } from './featureFlags';

export interface LoadResolutionResult {
  implement: 'barbell' | 'dumbbell' | 'machine';
  totalKg: number;
  details: {
    barWeight?: number;
    perSidePlates?: number[];
    dumbbellWeight?: number;
    stackWeight?: number;
    unit: string;
  };
  source: 'gym' | 'default';
  achievable: boolean;
  residualKg: number;
}

export async function resolveAchievableLoad(
  exerciseId: string,
  desiredKg: number,
  gymId?: string
): Promise<LoadResolutionResult> {
  try {
    // Check if gym equipment v2 is enabled
    const v2Enabled = await getFeatureFlag('gym_equipment_v2');
    
    const rpcFunction = v2Enabled ? 'fn_resolve_achievable_load_v2' : 'fn_resolve_achievable_load';
    
    const { data, error } = await supabase.rpc(
      rpcFunction as any, // Type assertion for dynamic RPC function name
      {
        exercise_id: exerciseId,
        gym_id: gymId || null,
        desired_kg: desiredKg,
        allow_mix_units: true,
        ...(v2Enabled && { user_unit: 'kg' })
      }
    );

    if (error) {
      console.error('Error resolving achievable load:', error);
      throw error;
    }

    const result = data as any;
    const resolvedResult = {
      implement: result.implement,
      totalKg: result.total_kg,
      details: result.details,
      source: result.source,
      achievable: result.achievable,
      residualKg: result.residual_kg
    };

    // Log the resolution for telemetry (only if significant difference)
    if (Math.abs(resolvedResult.residualKg) >= 0.25) {
      logWeightResolution({
        exercise_id: exerciseId,
        gym_id: gymId,
        desired_weight: desiredKg,
        resolved_weight: resolvedResult.totalKg,
        implement: resolvedResult.implement,
        resolution_source: resolvedResult.source,
        feature_version: v2Enabled ? 'v2' : 'v1'
      });
    }

    return resolvedResult;
  } catch (error) {
    console.error('Failed to resolve achievable load:', error);
    // Fallback to original weight
    return {
      implement: 'barbell',
      totalKg: desiredKg,
      details: { unit: 'kg' },
      source: 'default',
      achievable: true,
      residualKg: 0
    };
  }
}

export function formatLoadSuggestion(result: LoadResolutionResult): string {
  const { implement, totalKg, residualKg } = result;
  
  if (Math.abs(residualKg) < 0.1) {
    return `${totalKg}kg (${implement})`;
  }
  
  const direction = residualKg > 0 ? 'up' : 'down';
  return `Snapped ${direction} to ${totalKg}kg (${implement})`;
}