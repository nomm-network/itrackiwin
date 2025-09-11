import { supabase } from '@/integrations/supabase/client';

export interface EquipmentResolvedWeight {
  weight: number;
  unit: 'kg' | 'lb';
  achievable: boolean;
  breakdown?: {
    leftSide: number;
    rightSide: number;
    microPlates: number;
    barWeight: number;
    total: number;
  };
  minIncrement: number;
}

/**
 * Resolves achievable weight for an exercise using equipment profiles
 */
export async function resolveAchievableLoad(
  exerciseId: string,
  targetWeight: number,
  gymId?: string,
  targetUnit: 'kg' | 'lb' = 'kg'
): Promise<EquipmentResolvedWeight> {
  try {
    // Get equipment for this exercise
    const { data: exercises } = await supabase
      .from('exercises')
      .select('equipment_id, load_type')
      .eq('id', exerciseId)
      .single();

    if (!exercises) {
      throw new Error('Exercise not found');
    }

    // Get effective equipment profile (gym override or global)
    const { data: profileData } = await supabase.rpc('get_equipment_profile', {
      p_equipment_id: exercises.equipment_id,
      p_user_gym_id: gymId || null
    });

    const profile = profileData?.[0];
    
    if (!profile) {
      // Fallback to basic resolution
      return {
        weight: targetWeight,
        unit: targetUnit,
        achievable: true,
        minIncrement: 2.5
      };
    }

    // Handle different load types
    switch (exercises.load_type) {
      case 'dual_load':
      case 'single_load':
        return await resolvePlateLoad(
          profile.plate_profile_id,
          targetWeight,
          targetUnit,
          exercises.load_type === 'dual_load'
        );
        
      case 'stack':
        return await resolveStackLoad(
          profile.stack_profile_id,
          targetWeight,
          targetUnit
        );
        
      default:
        return {
          weight: targetWeight,
          unit: targetUnit,
          achievable: true,
          minIncrement: 2.5
        };
    }
  } catch (error) {
    console.error('Error resolving achievable load:', error);
    return {
      weight: targetWeight,
      unit: targetUnit,
      achievable: false,
      minIncrement: 2.5
    };
  }
}

async function resolvePlateLoad(
  plateProfileId: string | null,
  targetWeight: number,
  targetUnit: 'kg' | 'lb',
  isDualLoad: boolean
): Promise<EquipmentResolvedWeight> {
  if (!plateProfileId) {
    return {
      weight: targetWeight,
      unit: targetUnit,
      achievable: true,
      minIncrement: 2.5
    };
  }

  // Get plate profile and plates
  const { data: profile } = await supabase
    .from('plate_profiles')
    .select('*, plate_profile_plates(*)')
    .eq('id', plateProfileId)
    .single();

  if (!profile) {
    return {
      weight: targetWeight,
      unit: targetUnit,
      achievable: true,
      minIncrement: 2.5
    };
  }

  // Convert target weight to profile unit
  const profileWeight = targetUnit === profile.default_unit 
    ? targetWeight 
    : convertWeight(targetWeight, targetUnit, profile.default_unit);

  // Get available plates
  const plates = profile.plate_profile_plates
    .map((p: any) => p.weight_kg) // Use weight_kg instead of weight
    .sort((a: number, b: number) => b - a); // Descending order

  // Calculate closest achievable weight
  let achievableWeight = 0;
  let breakdown = null;

  if (isDualLoad) {
    // Barbell/dual-sided loading
    const barWeight = 20; // Default to 20kg/45lb bar - TODO: get from equipment
    const targetPerSide = (profileWeight - barWeight) / 2;
    
    if (targetPerSide >= 0) {
      const sideWeight = findClosestPlateLoad(plates, targetPerSide);
      achievableWeight = barWeight + (sideWeight * 2);
      
      breakdown = {
        leftSide: sideWeight,
        rightSide: sideWeight,
        microPlates: 0,
        barWeight,
        total: achievableWeight
      };
    } else {
      achievableWeight = barWeight;
      breakdown = {
        leftSide: 0,
        rightSide: 0,
        microPlates: 0,
        barWeight,
        total: barWeight
      };
    }
  } else {
    // Single-sided loading (dumbbells, etc.)
    achievableWeight = findClosestPlateLoad(plates, profileWeight);
  }

  // Convert back to target unit if needed
  const finalWeight = targetUnit === profile.default_unit 
    ? achievableWeight 
    : convertWeight(achievableWeight, profile.default_unit, targetUnit);

  return {
    weight: Math.round(finalWeight * 100) / 100,
    unit: targetUnit,
    achievable: Math.abs(finalWeight - targetWeight) < 0.1,
    breakdown,
    minIncrement: plates.length > 0 ? Math.min(...plates) * (isDualLoad ? 2 : 1) : 2.5
  };
}

async function resolveStackLoad(
  stackProfileId: string | null,
  targetWeight: number,
  targetUnit: 'kg' | 'lb'
): Promise<EquipmentResolvedWeight> {
  if (!stackProfileId) {
    return {
      weight: targetWeight,
      unit: targetUnit,
      achievable: true,
      minIncrement: 5
    };
  }

  // Get stack profile
  const { data: profile } = await supabase
    .from('stack_profiles')
    .select('*')
    .eq('id', stackProfileId)
    .single();

  if (!profile) {
    return {
      weight: targetWeight,
      unit: targetUnit,
      achievable: true,
      minIncrement: 5
    };
  }

  // Convert target weight to profile unit
  const profileWeight = targetUnit === profile.default_unit 
    ? targetWeight 
    : convertWeight(targetWeight, targetUnit, profile.default_unit);

  // Find closest stack weight
  const stackWeights = profile.stack_steps_kg || [];
  const auxWeights = profile.aux_adders_kg || [];
  
  let closestWeight = 0;
  let minDiff = Infinity;

  // Check pure stack weights
  for (const weight of stackWeights) {
    const diff = Math.abs(weight - profileWeight);
    if (diff < minDiff) {
      minDiff = diff;
      closestWeight = weight;
    }
  }

  // Check stack + aux combinations
  for (const stackWeight of stackWeights) {
    for (const auxWeight of auxWeights) {
      const totalWeight = stackWeight + auxWeight;
      const diff = Math.abs(totalWeight - profileWeight);
      if (diff < minDiff) {
        minDiff = diff;
        closestWeight = totalWeight;
      }
    }
  }

  // Convert back to target unit
  const finalWeight = targetUnit === profile.default_unit 
    ? closestWeight 
    : convertWeight(closestWeight, profile.default_unit, targetUnit);

  return {
    weight: Math.round(finalWeight * 100) / 100,
    unit: targetUnit,
    achievable: Math.abs(finalWeight - targetWeight) < 2.5,
    minIncrement: stackWeights.length > 0 ? Math.min(...stackWeights) : 5
  };
}

function findClosestPlateLoad(plates: number[], targetWeight: number): number {
  if (plates.length === 0) return targetWeight;

  // Greedy algorithm: use largest plates first
  let remaining = targetWeight;
  let totalWeight = 0;

  for (const plateWeight of plates) {
    const count = Math.floor(remaining / plateWeight);
    if (count > 0) {
      totalWeight += count * plateWeight;
      remaining -= count * plateWeight;
    }
  }

  return totalWeight;
}

function convertWeight(weight: number, fromUnit: 'kg' | 'lb', toUnit: 'kg' | 'lb'): number {
  if (fromUnit === toUnit) return weight;
  
  if (fromUnit === 'kg' && toUnit === 'lb') {
    return weight * 2.20462;
  } else if (fromUnit === 'lb' && toUnit === 'kg') {
    return weight * 0.453592;
  }
  
  return weight;
}

export function formatLoadSuggestion(result: EquipmentResolvedWeight): string {
  const diff = Math.abs(result.weight - result.weight);
  
  if (result.achievable) {
    return `✅ Achievable: ${result.weight}${result.unit}`;
  } else {
    return `⚠️ Closest: ${result.weight}${result.unit} (${diff > 0 ? '+' : ''}${diff.toFixed(1)}${result.unit})`;
  }
}