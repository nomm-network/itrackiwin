import { supabase } from '@/integrations/supabase/client';
import { PlateProfile, WeightUnit } from './api';
import { convertWeight } from './convert';

export interface WeightModel {
  unit: WeightUnit;
  barTypes: Record<string, { barKg: number }>;
  platesKgPerSide: number[];
  singleMinIncrementKg: number;
  stackIncrementKg?: number;
  auxIncrementsKg?: number[];
}

export interface BarTypeResult {
  total_kg: number;
  per_side: number[];
  bar_kg: number;
  residual_kg: number;
}

export interface DiscretePlateResult {
  leftSide: number[];
  rightSide: number[];
  microPlates: number[];
  barWeight: number;
  total: number;
}

/**
 * Canonical conversions with precise rounding
 */
export function toKg(value: number, unit: WeightUnit): number {
  return convertWeight(value, unit, 'kg');
}

export function fromKg(valueKg: number, unit: WeightUnit): number {
  const converted = convertWeight(valueKg, 'kg', unit);
  // Round to display precision based on unit
  return unit === 'kg' ? Math.round(converted * 2) / 2 : Math.round(converted);
}

/**
 * Calculate minimum step size for a given load type
 */
export function nextWeightStepKg(
  loadType: 'dual_load' | 'single_load' | 'stack',
  sideMinPlateKg: number,
  singleMinIncrementKg: number
): number {
  switch (loadType) {
    case 'dual_load':
      return 2 * sideMinPlateKg; // Both sides
    case 'single_load':
    case 'stack':
      return singleMinIncrementKg;
    default:
      return singleMinIncrementKg;
  }
}

/**
 * Find closest achievable barbell weight using available plates
 */
export function closestBarbellWeightKg(
  profile: PlateProfile,
  desiredKg: number,
  barKg: number = 20
): BarTypeResult {
  const remainingKg = Math.max(0, desiredKg - barKg);
  const perSideTarget = remainingKg / 2;
  
  // Sort plates descending for greedy algorithm
  const availablePlates = [...profile.sides].sort((a, b) => b - a);
  
  const selectedPlates: number[] = [];
  let remaining = perSideTarget;
  
  // Greedy plate selection
  for (const plateKg of availablePlates) {
    while (remaining >= plateKg && remaining > 0) {
      selectedPlates.push(plateKg);
      remaining -= plateKg;
    }
  }
  
  // Try to handle remaining with micro plates
  const microPlates = [...(profile.micro || [])].sort((a, b) => b - a);
  for (const microKg of microPlates) {
    while (remaining >= microKg && remaining > 0) {
      selectedPlates.push(microKg);
      remaining -= microKg;
    }
  }
  
  const actualPerSide = selectedPlates.reduce((sum, plate) => sum + plate, 0);
  const totalKg = barKg + (actualPerSide * 2);
  const residualKg = desiredKg - totalKg;
  
  return {
    total_kg: totalKg,
    per_side: selectedPlates,
    bar_kg: barKg,
    residual_kg: residualKg
  };
}

/**
 * Find closest machine weight using stack steps and aux weights
 */
export function closestMachineWeightKg(
  stackSteps: number[],
  auxSteps: number[],
  desiredKg: number
): number {
  let bestWeight = stackSteps[0] || 0;
  let minDiff = Math.abs(desiredKg - bestWeight);
  
  // Try all stack weights
  for (const stackWeight of stackSteps) {
    const diff = Math.abs(desiredKg - stackWeight);
    if (diff < minDiff) {
      minDiff = diff;
      bestWeight = stackWeight;
    }
    
    // Try stack + aux combinations
    for (const auxWeight of auxSteps) {
      const combined = stackWeight + auxWeight;
      const combinedDiff = Math.abs(desiredKg - combined);
      if (combinedDiff < minDiff) {
        minDiff = combinedDiff;
        bestWeight = combined;
      }
    }
  }
  
  return bestWeight;
}

/**
 * Get the effective weight model for a user's current gym context
 */
export async function getActiveWeightModel(userId: string): Promise<WeightModel | null> {
  try {
    // For now, return global default since user_profile_fitness schema doesn't match
    // This will be updated when the proper gym selection is implemented
    return getGlobalDefaultModel();
  } catch (error) {
    console.error('Error getting active weight model:', error);
    return getGlobalDefaultModel();
  }
}

/**
 * Get global default weight model as fallback
 */
async function getGlobalDefaultModel(): Promise<WeightModel> {
  return {
    unit: 'kg',
    barTypes: {
      barbell: { barKg: 20 },
      ezbar: { barKg: 7.5 },
      fixed: { barKg: 20 }
    },
    platesKgPerSide: [25, 20, 15, 10, 5, 2.5, 1.25],
    singleMinIncrementKg: 2.5,
    stackIncrementKg: 5,
    auxIncrementsKg: [2.5]
  };
}

/**
 * Calculate detailed plate breakdown for display
 */
export function calculatePlateBreakdown(
  totalKg: number,
  profile: PlateProfile,
  barKg: number = 20
): DiscretePlateResult {
  const result = closestBarbellWeightKg(profile, totalKg, barKg);
  
  // Separate micro plates (< 2.5kg) from regular plates
  const regularPlates = result.per_side.filter(p => p >= 2.5);
  const microPlates = result.per_side.filter(p => p < 2.5);
  
  return {
    leftSide: regularPlates,
    rightSide: regularPlates, // Same on both sides
    microPlates: microPlates,
    barWeight: barKg,
    total: result.total_kg
  };
}