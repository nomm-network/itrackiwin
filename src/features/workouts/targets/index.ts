// Unified targeting API with feature flag support
import { computeTargetV3, type ComputeTargetV3Input, type ComputeTargetV3Result } from './computeTargetV3';
import { supabase } from '@/integrations/supabase/client';

// Feature flag check - simplified for now
async function getFeatureFlag(flag: string): Promise<boolean> {
  // For initial rollout, default to false until proper flag system is set up
  return false;
}

// Unified target computation with V2/V3 switch
export async function computeTargetUnified(input: ComputeTargetV3Input): Promise<ComputeTargetV3Result> {
  const enabled = await getFeatureFlag('targeting_v3_enabled');
  
  if (enabled) {
    return computeTargetV3(input);
  } else {
    // For now, still use V3 but mark as legacy in debug
    const result = await computeTargetV3(input);
    result.debug.decisions.unshift('Using V3 engine (V2 fallback not implemented yet)');
    return result;
  }
}

// Re-export types for convenience
export type {
  ComputeTargetV3Input,
  ComputeTargetV3Result,
  TargetSuggestion,
  LastPerformance,
  ReadinessContext,
  EquipmentContext,
  WeightUnit,
  LoadType,
  EntryMode
} from './computeTargetV3';