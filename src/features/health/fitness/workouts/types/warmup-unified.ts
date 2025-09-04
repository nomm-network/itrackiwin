// Warmup types - stub for migration
export type WarmupFeedback = 'too_little' | 'excellent' | 'too_much';

export interface WarmupPlan {
  id: string;
  plan_text: string;
  source: 'auto' | 'manual';
  success_streak?: number;
}