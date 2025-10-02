import { supabase } from '@/integrations/supabase/client';
import { getFeatureFlag, logWeightResolution } from './featureFlags';
import { WeightModel, closestBarbellWeightKg, closestMachineWeightKg } from './gymWeightModel';
import { PlateProfile } from './api';
import { convertWeight } from './convert';

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

/**
 * V2 implementation with mixed-unit support and proper equipment resolution
 */
async function resolveAchievableLoadV2(
  exerciseId: string,
  desiredKg: number,
  gymId?: string,
  opts?: { equipmentRefId?: string; snapStrategy?: 'down' | 'nearest' | 'up' }
): Promise<LoadResolutionResult> {
  console.log('🎯 DEBUG: resolveAchievableLoadV2 - Starting V2 resolution', {
    exerciseId,
    desiredKg,
    gymId
  });
  
  // Get user's display unit preference (default to kg)
  const userUnit = 'kg'; // TODO: Get from user preferences
  
  // Fetch gym inventory and determine unit preference
  console.log('🎯 DEBUG: resolveAchievableLoadV2 - Fetching gym inventory');
  const inventory = await fetchGymInventory(gymId);
  console.log('🎯 DEBUG: resolveAchievableLoadV2 - Gym inventory fetched:', {
    hasInventory: !!inventory,
    platesCount: inventory?.plates?.length || 0,
    dumbbellsCount: inventory?.dumbbells?.length || 0,
    machinesCount: inventory?.machines?.length || 0
  });
  
  const unitPreference = determineUnitPreference(userUnit, inventory);
  console.log('🎯 DEBUG: resolveAchievableLoadV2 - Unit preference determined:', {
    userUnit,
    unitPreference
  });
  
  // Get exercise data and determine implement from load_type
  console.log('🎯 DEBUG: resolveAchievableLoadV2 - Fetching exercise data');
  const exerciseData = await fetchExerciseData(exerciseId);
  console.log('🎯 DEBUG: resolveAchievableLoadV2 - Exercise data fetched:', exerciseData);
  
  const implement = mapLoadTypeToImplement(exerciseData?.load_type || 'dual_load');
  console.log('🎯 DEBUG: resolveAchievableLoadV2 - Implement determined:', {
    loadType: exerciseData?.load_type,
    implement
  });
  
  let result: LoadResolutionResult;
  
  switch (implement) {
    case 'dumbbell':
      console.log('🎯 DEBUG: resolveAchievableLoadV2 - Resolving dumbbell load');
      result = await resolveDumbbellLoad(desiredKg, inventory, unitPreference);
      break;
    case 'machine':
      console.log('🎯 DEBUG: resolveAchievableLoadV2 - Resolving machine load');
      result = await resolveMachineLoad(desiredKg, inventory, unitPreference);
      break;
    default:
      console.log('🎯 DEBUG: resolveAchievableLoadV2 - Resolving barbell load', {
        barType: exerciseData?.default_bar_type_id || 'standard',
        snapStrategy: opts?.snapStrategy || 'down'
      });
      result = await resolveBarbellLoad(desiredKg, inventory, unitPreference, exerciseData?.default_bar_type_id || 'standard', opts?.snapStrategy || 'down');
      break;
  }
  
  console.log('🎯 DEBUG: resolveAchievableLoadV2 - Load resolution completed:', result);
  
  // Log telemetry if significant difference
  if (Math.abs(result.residualKg) >= 0.25) {
    console.log('🎯 Weight Resolution V2 (equipment snapping):', {
      exerciseId,
      gymId,
      desired: desiredKg,
      resolved: result.totalKg,
      implement: result.implement,
      source: result.source,
      residualKg: result.residualKg,
      achievable: result.achievable
    });
    
    logWeightResolution({
      exercise_id: exerciseId,
      gym_id: gymId,
      desired_weight: desiredKg,
      resolved_weight: result.totalKg,
      implement: result.implement,
      resolution_source: result.source,
      feature_version: 'v2'
    });
  }
  
  return result;
}

/**
 * V1 fallback implementation
 */
async function resolveAchievableLoadV1(
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

    if (error) throw error;

    const result = data as any;
    return {
      implement: result.implement,
      totalKg: result.total_kg,
      details: result.details,
      source: result.source,
      achievable: result.achievable,
      residualKg: result.residual_kg
    };
  } catch (error) {
    console.error('V1 resolution failed:', error);
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

/**
 * Main public API - single entrypoint for all weight resolution
 */
export async function resolveAchievableLoad(
  exerciseId: string,
  desiredKg: number,
  gymId?: string,
  opts?: { equipmentRefId?: string; snapStrategy?: 'down' | 'nearest' | 'up' }
): Promise<LoadResolutionResult> {
  console.log('🎯 v113.2 resolveAchievableLoad - ENTRY:', {
    exerciseId,
    desiredKg,
    gymId,
    snapStrategy: opts?.snapStrategy || 'not provided'
  });
  
  try {
    // Check if gym equipment v2 is enabled
    const v2Enabled = await getFeatureFlag('gym_equipment_v2');
    
    console.log('🎯 v113.2 resolveAchievableLoad - Feature flag:', {
      flag: 'gym_equipment_v2',
      v2Enabled,
      willUseVersion: v2Enabled ? 'V2' : 'V1'
    });
    
    const result = v2Enabled 
      ? await resolveAchievableLoadV2(exerciseId, desiredKg, gymId, opts)
      : await resolveAchievableLoadV1(exerciseId, desiredKg, gymId);
    
    console.log('🎯 v113.2 resolveAchievableLoad - ✅ COMPLETE:', {
      version: v2Enabled ? 'V2' : 'V1',
      inputWeight: desiredKg,
      outputWeight: result.totalKg,
      weightChanged: result.totalKg !== desiredKg,
      implement: result.implement,
      residualKg: result.residualKg,
      details: result.details
    });
    
    return result;
  } catch (error) {
    console.error('🎯 DEBUG: resolveAchievableLoad - Resolution failed:', error);
    
    // Fallback to original weight
    const fallbackResult = {
      implement: 'barbell' as const,
      totalKg: desiredKg,
      details: { unit: 'kg' },
      source: 'default' as const,
      achievable: true,
      residualKg: 0
    };
    
    console.log('🎯 DEBUG: resolveAchievableLoad - Using fallback result:', fallbackResult);
    
    return fallbackResult;
  }
}

// Helper functions for V2 implementation
async function fetchGymInventory(gymId?: string) {
  if (!gymId) return null;
  
  const [platesRes, dumbbellsRes, machinesRes] = await Promise.all([
    supabase.from('user_gym_plates').select('*').eq('user_gym_id', gymId),
    supabase.from('user_gym_dumbbells').select('*').eq('user_gym_id', gymId),
    supabase.from('user_gym_miniweights').select('*').eq('user_gym_id', gymId)
  ]);
  
  return {
    plates: platesRes.data || [],
    dumbbells: dumbbellsRes.data || [],
    machines: machinesRes.data || []
  };
}

async function fetchExerciseData(exerciseId: string) {
  const { data } = await supabase
    .from('exercises')
    .select('load_type, default_bar_type_id')
    .eq('id', exerciseId)
    .single();
  
  return data;
}

function mapLoadTypeToImplement(loadType: string): 'barbell' | 'dumbbell' | 'machine' {
  switch (loadType) {
    case 'single_load':
      return 'dumbbell';
    case 'stack':
      return 'machine';
    case 'dual_load':
    case 'barbell':
    default:
      return 'barbell';
  }
}

function determineUnitPreference(userUnit: string, inventory: any) {
  if (!inventory) return userUnit;
  
  // Check if gym has inventory in user's preferred unit
  const hasUserUnit = inventory.plates.some((p: any) => p.native_unit === userUnit) ||
                     inventory.dumbbells.some((d: any) => d.native_unit === userUnit);
  
  return hasUserUnit ? userUnit : 'kg'; // Default fallback
}

async function resolveBarbellLoad(
  desiredKg: number,
  inventory: any,
  unitPreference: string,
  barTypeId: string = 'standard',
  snapStrategy: 'down' | 'nearest' | 'up' = 'down'
): Promise<LoadResolutionResult> {
  const barWeight = barTypeId === 'ezbar' ? 7.5 : 20; // kg
  
  if (desiredKg < barWeight) {
    return {
      implement: 'barbell',
      totalKg: barWeight,
      details: { barWeight, unit: 'kg' },
      source: inventory ? 'gym' : 'default',
      achievable: false,
      residualKg: desiredKg - barWeight
    };
  }
  
  if (!inventory?.plates?.length) {
    // Use global defaults - always snap down for safety
    const profile: PlateProfile = {
      unit: 'kg',
      barbell_weight: barWeight,
      ezbar_weight: 7.5,
      fixedbar_weight: 20,
      sides: [25, 20, 15, 10, 5, 2.5, 1.25],
      micro: [0.5]
    };
    
    const result = closestBarbellWeightKg(profile, desiredKg, barWeight);
    
    // Apply snap strategy for default plates
    let finalWeight = result.total_kg;
    if (snapStrategy === 'down' && result.total_kg > desiredKg) {
      // Find highest achievable weight <= desired
      const candidates = [];
      for (let plates = 0; plates <= 8; plates++) {
        for (const plateWeight of profile.sides) {
          const total = barWeight + (plates * plateWeight * 2);
          if (total <= desiredKg) candidates.push(total);
        }
      }
      finalWeight = candidates.length > 0 ? Math.max(...candidates) : barWeight;
    }
    
    return {
      implement: 'barbell',
      totalKg: finalWeight,
      details: {
        barWeight,
        perSidePlates: finalWeight > barWeight ? [(finalWeight - barWeight) / 2] : [],
        unit: 'kg'
      },
      source: 'default',
      achievable: Math.abs(finalWeight - desiredKg) < 0.1,
      residualKg: desiredKg - finalWeight
    };
  }
  
  // Use gym inventory with proper snapping
  const plates = inventory.plates
    .map((p: any) => convertWeight(p.weight, p.unit || 'kg', 'kg'))
    .sort((a: number, b: number) => b - a);
  
  // Generate all possible plate combinations
  const candidates: number[] = [barWeight]; // Start with bare bar
  
  // Try all combinations of plates (up to reasonable limit)
  for (let totalPlates = 1; totalPlates <= 16; totalPlates += 2) { // Pairs only for dual load
    for (const plateWeight of plates) {
      const platesPerSide = totalPlates / 2;
      const total = barWeight + (platesPerSide * plateWeight * 2);
      if (total <= desiredKg * 1.1) { // Don't go too far over
        candidates.push(total);
      }
    }
    
    // Mixed plate combinations (2 different plate types per side)
    if (totalPlates >= 4) {
      for (let i = 0; i < plates.length; i++) {
        for (let j = i; j < plates.length; j++) {
          const heavyPlates = Math.floor(totalPlates / 4);
          const lightPlates = totalPlates / 2 - heavyPlates;
          const total = barWeight + (heavyPlates * plates[i] * 2) + (lightPlates * plates[j] * 2);
          if (total <= desiredKg * 1.1) {
            candidates.push(total);
          }
        }
      }
    }
  }
  
  // Apply snap strategy
  const uniqueCandidates = [...new Set(candidates)].sort((a, b) => a - b);
  let finalWeight: number;
  
  if (snapStrategy === 'down') {
    const validCandidates = uniqueCandidates.filter(w => w <= desiredKg);
    finalWeight = validCandidates.length > 0 ? Math.max(...validCandidates) : barWeight;
  } else if (snapStrategy === 'up') {
    const validCandidates = uniqueCandidates.filter(w => w >= desiredKg);
    finalWeight = validCandidates.length > 0 ? Math.min(...validCandidates) : Math.min(...uniqueCandidates);
  } else { // nearest
    finalWeight = uniqueCandidates.reduce((best, current) => 
      Math.abs(current - desiredKg) < Math.abs(best - desiredKg) ? current : best
    );
  }
  
  // Calculate plate breakdown for final weight
  const plateLoad = (finalWeight - barWeight) / 2;
  const perSidePlates: number[] = [];
  let remaining = plateLoad;
  
  for (const plate of plates) {
    const count = Math.floor(remaining / plate);
    for (let i = 0; i < count; i++) {
      perSidePlates.push(plate);
    }
    remaining -= count * plate;
  }
  
  return {
    implement: 'barbell',
    totalKg: finalWeight,
    details: {
      barWeight,
      perSidePlates,
      unit: 'kg'
    },
    source: 'gym',
    achievable: Math.abs(finalWeight - desiredKg) < 0.1,
    residualKg: desiredKg - finalWeight
  };
}

async function resolveDumbbellLoad(
  desiredKg: number,
  inventory: any,
  unitPreference: string
): Promise<LoadResolutionResult> {
  const weights = inventory?.dumbbells?.length 
    ? inventory.dumbbells.map((d: any) => convertWeight(d.weight, d.native_unit, 'kg'))
    : [5, 7.5, 10, 12.5, 15, 17.5, 20, 22.5, 25, 27.5, 30]; // Default set
  
  weights.sort((a: number, b: number) => a - b);
  
  // Find closest dumbbell
  let closest = weights[0];
  let minDiff = Math.abs(desiredKg - closest);
  
  for (const weight of weights) {
    const diff = Math.abs(desiredKg - weight);
    if (diff < minDiff) {
      minDiff = diff;
      closest = weight;
    }
  }
  
  return {
    implement: 'dumbbell',
    totalKg: closest,
    details: {
      dumbbellWeight: closest,
      unit: 'kg'
    },
    source: inventory?.dumbbells?.length ? 'gym' : 'default',
    achievable: minDiff < 0.1,
    residualKg: desiredKg - closest
  };
}

async function resolveMachineLoad(
  desiredKg: number,
  inventory: any,
  unitPreference: string
): Promise<LoadResolutionResult> {
  // Default stack steps
  const stackSteps = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100];
  const auxSteps = [2.5, 5];
  
  let bestWeight = stackSteps[0];
  let minDiff = Math.abs(desiredKg - bestWeight);
  let usedAux = false;
  
  // Try stack steps alone
  for (const step of stackSteps) {
    const diff = Math.abs(desiredKg - step);
    if (diff < minDiff) {
      minDiff = diff;
      bestWeight = step;
      usedAux = false;
    }
  }
  
  // Try stack + single aux (prefer non-overshoot)
  for (const step of stackSteps) {
    for (const aux of auxSteps) {
      const combined = step + aux;
      const diff = Math.abs(desiredKg - combined);
      // Prefer non-overshoot combinations
      const isOvershoot = combined > desiredKg;
      const currentIsOvershoot = bestWeight > desiredKg;
      
      if ((diff < minDiff) || 
          (diff === minDiff && !isOvershoot && currentIsOvershoot)) {
        minDiff = diff;
        bestWeight = combined;
        usedAux = true;
      }
    }
  }
  
  // Try stack + sum of all aux
  const totalAux = auxSteps.reduce((sum, aux) => sum + aux, 0);
  for (const step of stackSteps) {
    const combined = step + totalAux;
    const diff = Math.abs(desiredKg - combined);
    const isOvershoot = combined > desiredKg;
    const currentIsOvershoot = bestWeight > desiredKg;
    
    if ((diff < minDiff) || 
        (diff === minDiff && !isOvershoot && currentIsOvershoot)) {
      minDiff = diff;
      bestWeight = combined;
      usedAux = true;
    }
  }
  
  return {
    implement: 'machine',
    totalKg: bestWeight,
    details: {
      stackWeight: bestWeight,
      unit: 'kg'
    },
    source: inventory?.machines?.length ? 'gym' : 'default',
    achievable: minDiff < 2.5, // More tolerance for machines
    residualKg: desiredKg - bestWeight
  };
}

export function formatLoadSuggestion(result: LoadResolutionResult): string {
  const { implement, totalKg, residualKg } = result;
  
  if (Math.abs(residualKg) < 0.1) {
    return `${totalKg}kg (${implement})`;
  }
  
  const direction = residualKg > 0 ? 'up' : 'down';
  return `Snapped ${direction} to ${totalKg}kg (${implement})`;
}