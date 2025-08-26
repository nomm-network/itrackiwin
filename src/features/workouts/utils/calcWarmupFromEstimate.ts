export type WarmupStep = { 
  label: string; 
  weight: number; 
  reps: number; 
  restSec: number; 
};

export type WarmupPlan = {
  strategy: 'ramped' | 'straight';
  estMinutes: number;
  steps: WarmupStep[];
};

export function calcWarmupFromEstimate(est10RMkg: number): WarmupPlan {
  // Round to nearest 2.5kg for gym plate compatibility
  const round = (n: number) => Math.round(n / 2.5) * 2.5;
  
  return {
    strategy: 'ramped',
    estMinutes: 3,
    steps: [
      { label: 'W1', weight: round(est10RMkg * 0.4), reps: 10, restSec: 60 },
      { label: 'W2', weight: round(est10RMkg * 0.6), reps: 8, restSec: 60 },
      { label: 'W3', weight: round(est10RMkg * 0.7), reps: 5, restSec: 60 },
    ],
  };
}

// Calculate warmup based on current workout data (logged sets)
export function calcWarmupFromCurrentData(currentWeight: number): WarmupPlan {
  // Round to nearest 2.5kg for gym plate compatibility
  const round = (n: number) => Math.round(n / 2.5) * 2.5;
  
  return {
    strategy: 'ramped',
    estMinutes: 3,
    steps: [
      { label: 'W1', weight: round(currentWeight * 0.4), reps: 10, restSec: 60 },
      { label: 'W2', weight: round(currentWeight * 0.6), reps: 8, restSec: 60 },
      { label: 'W3', weight: round(currentWeight * 0.8), reps: 5, restSec: 60 },
    ],
  };
}