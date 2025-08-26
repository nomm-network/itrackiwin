// Canonical warmup types - single source of truth
export type WarmupStep = {
  id: 'w1' | 'w2' | 'w3';
  percent: number;         // 0..1 of working weight
  reps: number;
  restSec: number;
};

export type WarmupPlan = {
  strategy: 'ramped' | 'pyramid' | 'none';
  steps: WarmupStep[];
  source: 'estimate' | 'last_set' | 'user_override' | 'auto';
  updatedAt: string;       // ISO
};