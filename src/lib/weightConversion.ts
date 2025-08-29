export type WeightUnit = 'kg' | 'lb';

const KG_TO_LB = 2.2046226218;
const LB_TO_KG = 1 / KG_TO_LB;

/**
 * Convert weight between units
 */
export const convertWeight = (weight: number, fromUnit: WeightUnit, toUnit: WeightUnit): number => {
  if (fromUnit === toUnit) return weight;
  
  if (fromUnit === 'kg' && toUnit === 'lb') {
    return weight * KG_TO_LB;
  }
  
  if (fromUnit === 'lb' && toUnit === 'kg') {
    return weight * LB_TO_KG;
  }
  
  return weight;
};

/**
 * Convert any weight to canonical kg storage
 */
export const toCanonicalKg = (weight: number, unit: WeightUnit): number => {
  return convertWeight(weight, unit, 'kg');
};

/**
 * Round weight appropriately for display
 */
export const roundWeight = (weight: number, unit: WeightUnit): number => {
  if (unit === 'kg') {
    return Math.round(weight * 2) / 2; // Round to 0.5 kg
  } else {
    return Math.round(weight); // Round to 1 lb
  }
};

/**
 * Format weight for display with unit
 */
export const formatWeight = (weight: number, unit: WeightUnit): string => {
  const rounded = roundWeight(weight, unit);
  return `${rounded} ${unit}`;
};

/**
 * Format dual weight display when session unit differs from user preference
 */
export const formatDualWeight = (
  weightKg: number, 
  userUnit: WeightUnit, 
  sessionUnit: WeightUnit
): string => {
  if (userUnit === sessionUnit) {
    return formatWeight(convertWeight(weightKg, 'kg', userUnit), userUnit);
  }
  
  const userWeight = convertWeight(weightKg, 'kg', userUnit);
  const sessionWeight = convertWeight(weightKg, 'kg', sessionUnit);
  
  return `${formatWeight(sessionWeight, sessionUnit)} / ${formatWeight(userWeight, userUnit)}`;
};

/**
 * Weight storage data structure
 */
export interface WeightData {
  weight_kg: number;        // Canonical storage in kg
  input_weight: number;     // What user actually typed
  input_unit: WeightUnit;   // Unit user used for input
}

/**
 * Create weight data for storage
 */
export const createWeightData = (inputWeight: number, inputUnit: WeightUnit): WeightData => {
  return {
    weight_kg: toCanonicalKg(inputWeight, inputUnit),
    input_weight: inputWeight,
    input_unit: inputUnit
  };
};

/**
 * Get display weight in preferred unit
 */
export const getDisplayWeight = (
  weightData: WeightData, 
  preferredUnit: WeightUnit
): number => {
  return convertWeight(weightData.weight_kg, 'kg', preferredUnit);
};

/**
 * Snap weight to equipment constraints (for stacks, plates, etc.)
 */
export const snapToEquipmentConstraints = (
  weight: number, 
  unit: WeightUnit, 
  availableWeights?: number[]
): number => {
  if (!availableWeights || availableWeights.length === 0) {
    return roundWeight(weight, unit);
  }
  
  // Find closest available weight
  let closest = availableWeights[0];
  let minDiff = Math.abs(weight - closest);
  
  for (const available of availableWeights) {
    const diff = Math.abs(weight - available);
    if (diff < minDiff) {
      minDiff = diff;
      closest = available;
    }
  }
  
  return closest;
};