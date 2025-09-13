import { supabase } from '@/integrations/supabase/client';

export interface PlateStepInfo {
  perSideStepKg: number;
  minPlateKg: number;
  hasCustomInventory: boolean;
}

/**
 * Calculate the minimum input step for per-side weight based on gym inventory
 */
export async function getPlateStepInfo(gymId?: string): Promise<PlateStepInfo> {
  if (!gymId) {
    return {
      perSideStepKg: 1.25, // Default Olympic plate increment
      minPlateKg: 1.25,
      hasCustomInventory: false
    };
  }

  try {
    // Get gym's plate inventory
    const { data: plates } = await supabase
      .from('user_gym_plates')
      .select('weight, unit')
      .eq('user_gym_id', gymId);

    if (!plates || plates.length === 0) {
      return {
        perSideStepKg: 1.25,
        minPlateKg: 1.25,
        hasCustomInventory: false
      };
    }

    // Convert all plates to kg and find minimum
    const plateWeightsKg = plates.map(plate => {
      if (plate.unit === 'lb') {
        return plate.weight * 0.453592; // Convert lb to kg
      }
      return plate.weight;
    });

    const minPlateKg = Math.min(...plateWeightsKg);

    return {
      perSideStepKg: minPlateKg,
      minPlateKg,
      hasCustomInventory: true
    };
  } catch (error) {
    console.error('Error getting plate step info:', error);
    return {
      perSideStepKg: 1.25,
      minPlateKg: 1.25,
      hasCustomInventory: false
    };
  }
}

/**
 * Calculate input step for weight based on load type and inventory
 */
export function getWeightStep(loadType: string, plateStepInfo: PlateStepInfo): number {
  switch (loadType) {
    case 'dual_load':
      return plateStepInfo.perSideStepKg; // Per-side step for dual load
    case 'single_load':
      return plateStepInfo.minPlateKg; // Direct weight for single load  
    case 'stack':
      return 2.5; // Standard machine increment
    default:
      return 0.5; // Safe fallback
  }
}