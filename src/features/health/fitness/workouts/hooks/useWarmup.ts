// src/features/health/fitness/workouts/hooks/useWarmup.ts
export const extractServerWarmup = (attr?: any) => {
  const steps = attr?.warmup;
  if (Array.isArray(steps) && steps.length) return steps;
  return null;
};