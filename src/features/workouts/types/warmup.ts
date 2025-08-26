// Canonical warmup types - single source of truth
export type WarmupStep = {
  id: 'W1' | 'W2' | 'W3' | 'W4';
  percent: number;        // percent of working weight, e.g. 0.40
  reps: number;           // explicit reps
  rest_sec: number;       // 45, 60, 90 ...
};

export type WarmupPlan = {
  strategy: 'ramped';
  est_minutes: number;
  base_weight: number;    // working weight this plan was derived from
  steps: WarmupStep[];
  tuned_from_feedback?: 'not_enough' | 'excellent' | 'too_much';
};

export type WarmupFeedback = 'not_enough' | 'excellent' | 'too_much';

export type GymConfig = {
  loading_mode: 'barbell_sym' | 'selectorized' | 'fixed_dumbbells' | 'cable';
  bar_kg?: number;               // if barbell
  min_plate_kg?: number;         // if plate-loaded
  stack_increment_kg?: number;   // if stack
  micro_kg?: number;             // optional micro inc
  dumbbell_set?: number[];       // allowed single-dbell weights (kg)
};