// Unified warmup types - single source of truth for all warmup functionality
export type WarmupStep = {
  id: 'W1' | 'W2' | 'W3';
  pct: number;          // 0.4, 0.6, 0.8
  reps: number;
  restSec: number;
  targetWeight: number; // computed & rounded
};

export type WarmupPlan = {
  strategy: 'ramped';
  baseWeight: number;   // the weight we derived the plan from
  steps: WarmupStep[];
  updated_from: 'estimate' | 'current_working_set' | 'manual';
  updatedAt: string;    // ISO timestamp
};

export type WarmupFeedback = 'not_enough' | 'excellent' | 'too_much';