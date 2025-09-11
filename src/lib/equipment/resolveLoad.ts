import { supabase } from '@/integrations/supabase/client';

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
    const { data, error } = await supabase.rpc('fn_resolve_achievable_load', {
      exercise_id: exerciseId,
      gym_id: gymId || null,
      desired_kg: desiredKg,
      allow_mix_units: true
    });

    if (error) {
      console.error('Error resolving achievable load:', error);
      throw error;
    }

    const result = data as any; // Type assertion for RPC result
    return {
      implement: result.implement,
      totalKg: result.total_kg,
      details: result.details,
      source: result.source,
      achievable: result.achievable,
      residualKg: result.residual_kg
    };
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