// Warmup calculation - stub for migration
import type { WarmupPlan } from '../types/warmup-unified';

export const buildWarmupPlan = (exerciseId: string, targetWeight?: number): WarmupPlan => {
  return {
    id: `warmup-${exerciseId}`,
    plan_text: `Warmup for exercise ${exerciseId}${targetWeight ? ` with target ${targetWeight}kg` : ''}`,
    source: 'auto'
  };
};

export const getStepWeight = (weight: number): number => {
  // Simple step weight calculation
  if (weight <= 20) return 2.5;
  if (weight <= 40) return 5;
  if (weight <= 80) return 10;
  return 20;
};