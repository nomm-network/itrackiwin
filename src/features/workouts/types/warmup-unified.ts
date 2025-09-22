export interface WarmupStep {
  label: string;
  percent: number;
  reps: number;
  rest_sec: number;
}

export interface WarmupPlan {
  strategy: string;
  top_weight: number;
  steps: WarmupStep[];
  last_recalc_at: string;
  source: string;
}

export type WarmupFeedback = 'too_little' | 'excellent' | 'too_much';

export interface UnilateralSetData {
  side: 'left' | 'right' | 'both';
  weight?: number;
  reps?: number;
}