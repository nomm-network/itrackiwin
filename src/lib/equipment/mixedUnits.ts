// Step 7: Mixed-Unit & Inventory Consistency
// Single source of truth for mixed-unit weight operations

export type WeightUnit = 'kg' | 'lb';

// 7.2 Weight math helpers - single source of truth
export function toKg(value: number, unit: WeightUnit): number {
  return unit === 'kg' ? value : value * 0.45359237;
}

export function toUnit(kgValue: number, targetUnit: WeightUnit): number {
  return targetUnit === 'kg' ? kgValue : kgValue / 0.45359237;
}

// Enhanced conversion with display precision
export function toDisplayUnit(kgValue: number, targetUnit: WeightUnit): number {
  const converted = toUnit(kgValue, targetUnit);
  // Round to display precision based on unit
  return targetUnit === 'kg' ? Math.round(converted * 2) / 2 : Math.round(converted);
}

// Sum plates with mixed units - returns both kg and target unit
export interface PlateSum {
  totalKg: number;
  totalDisplay: number;
  unitDisplay: WeightUnit;
}

export function sumPlates(plates: Array<{weight: number, unit: WeightUnit}>, displayUnit: WeightUnit): PlateSum {
  const totalKg = plates.reduce((sum, plate) => sum + toKg(plate.weight, plate.unit), 0);
  
  return {
    totalKg,
    totalDisplay: toDisplayUnit(totalKg, displayUnit),
    unitDisplay: displayUnit
  };
}

// 7.2 Selection logic for display unit
export interface UnitContext {
  exerciseUnit?: WeightUnit;
  userUnit?: WeightUnit;
  gymUnit?: WeightUnit;
}

export function getDisplayUnit(context: UnitContext): WeightUnit {
  // Priority: exercise preferred → user preference → gym default → kg fallback
  return context.exerciseUnit || context.userUnit || context.gymUnit || 'kg';
}

// 7.4 Target & readiness integration with mixed units
export function calculateReadinessTarget(
  baseTargetKg: number, 
  readinessMultiplier: number,
  availableSteps: number[],
  displayUnit: WeightUnit
): { targetKg: number; targetDisplay: number; matchedStep: number | null } {
  // Apply readiness scaling to kg target
  const adjustedKg = baseTargetKg * readinessMultiplier;
  
  // Find nearest achievable step considering mixed inventory
  let matchedStep: number | null = null;
  let bestDiff = Infinity;
  
  for (const step of availableSteps) {
    const stepKg = toKg(step, displayUnit);
    const diff = Math.abs(stepKg - adjustedKg);
    if (diff < bestDiff) {
      bestDiff = diff;
      matchedStep = step;
    }
  }
  
  const finalKg = matchedStep ? toKg(matchedStep, displayUnit) : adjustedKg;
  
  return {
    targetKg: finalKg,
    targetDisplay: toDisplayUnit(finalKg, displayUnit),
    matchedStep
  };
}

// 7.4 Micro-increment logic across mixed inventories
export function calculateMixedIncrement(
  gymInventory: Array<{weight: number, unit: WeightUnit, type: 'plate' | 'dumbbell' | 'stack'}>,
  loadType: 'dual_load' | 'single_load' | 'stack',
  displayUnit: WeightUnit
): number {
  const plateItems = gymInventory.filter(item => item.type === 'plate');
  const singleItems = gymInventory.filter(item => item.type === 'dumbbell' || item.type === 'stack');
  
  if (loadType === 'dual_load') {
    // Find smallest plate across all units, multiply by 2 (both sides)
    const minPlateKg = Math.min(...plateItems.map(item => toKg(item.weight, item.unit)));
    return toDisplayUnit(minPlateKg * 2, displayUnit);
  } else {
    // Single load: smallest available increment
    const minIncrementKg = Math.min(...singleItems.map(item => toKg(item.weight, item.unit)));
    return toDisplayUnit(minIncrementKg, displayUnit);
  }
}

// 7.3 UI formatting helpers
export function formatWeightWithConversion(
  nativeWeight: number,
  nativeUnit: WeightUnit,
  displayUnit: WeightUnit,
  showHint: boolean = true
): string {
  if (nativeUnit === displayUnit) {
    return `${nativeWeight} ${displayUnit}`;
  }
  
  const convertedWeight = toDisplayUnit(toKg(nativeWeight, nativeUnit), displayUnit);
  const hintWeight = toDisplayUnit(toKg(nativeWeight, nativeUnit), nativeUnit === 'kg' ? 'lb' : 'kg');
  const hintUnit = nativeUnit === 'kg' ? 'lb' : 'kg';
  
  if (showHint) {
    return `${convertedWeight} ${displayUnit} (≈ ${hintWeight} ${hintUnit})`;
  }
  
  return `${convertedWeight} ${displayUnit}`;
}

// 7.5 Validation helpers
export function validateMixedUnitRoundTrip(
  originalWeight: number,
  originalUnit: WeightUnit,
  targetUnit: WeightUnit,
  tolerancePounds: number = 0.1
): boolean {
  const convertedKg = toKg(originalWeight, originalUnit);
  const convertedTarget = toUnit(convertedKg, targetUnit);
  const backToOriginal = toUnit(toKg(convertedTarget, targetUnit), originalUnit);
  
  const difference = Math.abs(originalWeight - backToOriginal);
  const toleranceOriginalUnit = originalUnit === 'lb' ? tolerancePounds : tolerancePounds * 0.45359237;
  
  return difference <= toleranceOriginalUnit;
}