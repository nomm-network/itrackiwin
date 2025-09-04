// Step weight calculation - stub for migration
export const getStepWeight = (weight: number): number => {
  // Simple step weight calculation
  if (weight <= 20) return 2.5;
  if (weight <= 40) return 5;
  if (weight <= 80) return 10;
  return 20;
};