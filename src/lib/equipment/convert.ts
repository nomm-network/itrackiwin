import { WeightUnit } from './api';

const KG_TO_LB = 2.2046226218;
const LB_TO_KG = 1 / KG_TO_LB;

// Convert kg to lb
export const kgToLb = (kg: number): number => kg * KG_TO_LB;

// Convert lb to kg  
export const lbToKg = (lb: number): number => lb * LB_TO_KG;

// Convert weight between units
export const convertWeight = (weight: number, fromUnit: WeightUnit, toUnit: WeightUnit): number => {
  if (fromUnit === toUnit) return weight;
  return fromUnit === 'kg' ? kgToLb(weight) : lbToKg(weight);
};

// Normalize weight steps (sort, dedupe, round)
export const normalizeSteps = (unit: WeightUnit, arr: number[]): number[] => {
  const precision = unit === 'kg' ? 1 : 0; // kg: 1 decimal, lb: integer
  
  return [...new Set(arr)]
    .filter(n => n > 0)
    .map(n => Number(n.toFixed(precision)))
    .sort((a, b) => a - b);
};

// Round weight appropriately for unit
export const roundWeight = (weight: number, unit: WeightUnit): number => {
  if (unit === 'kg') {
    return Math.round(weight * 2) / 2; // Round to 0.5 kg
  } else {
    return Math.round(weight); // Round to 1 lb
  }
};

// Format weight with unit
export const formatWeight = (weight: number, unit: WeightUnit): string => {
  const rounded = roundWeight(weight, unit);
  return `${rounded} ${unit}`;
};

// Convert array to target unit for display
export const convertWeights = (weights: number[], fromUnit: WeightUnit, toUnit: WeightUnit): number[] => {
  if (fromUnit === toUnit) return weights;
  return weights.map(w => convertWeight(w, fromUnit, toUnit));
};