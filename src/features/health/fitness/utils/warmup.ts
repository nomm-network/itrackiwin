export type WarmupStep = { 
  id: string; 
  weight: number; 
  reps: number; 
  rest?: number; 
};

export type WarmupPlan = {
  version: 1;
  strategy: 'ramped' | 'straight';
  unit: 'kg' | 'lb';
  top_set_hint?: { weight: number; reps: number; rpe?: number };
  steps: WarmupStep[];
};

export function generateWarmupClient(
  topWeight: number,
  topReps = 8,
  unit: 'kg' | 'lb' = 'kg'
): WarmupPlan {
  const w = (pct: number) => Math.round(topWeight * pct * 10) / 10; // 0.1 precision
  const steps: WarmupStep[] = [
    { id: 'w1', weight: w(0.4), reps: 10, rest: 60 },
    { id: 'w2', weight: w(0.55), reps: 8, rest: 60 },
    { id: 'w3', weight: w(0.7), reps: 5, rest: 60 },
  ];
  return {
    version: 1,
    strategy: 'ramped',
    unit,
    top_set_hint: { weight: topWeight, reps: topReps, rpe: 8 },
    steps,
  };
}