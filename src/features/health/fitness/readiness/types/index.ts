export interface ReadinessInput {
  energy: number;           // 1-10
  sleep_quality: number;    // 1-10
  sleep_hours: number;      // e.g. 7.5
  soreness: number;         // 1-10 (lower is better)
  stress: number;           // 1-10 (lower is better)
  illness: boolean;
  alcohol: boolean;
  supplements: string[];    // ["protein", "creatine"]
}

export interface WarmupStep {
  pct: number;
  reps: number;
  rest_s: number;
  weight_kg: number;
}

export interface SmartTargetInfo {
  target_weight_kg: number | null;
  readiness_score: number | null;
  base_source: 'recent_workout' | 'template' | 'estimate' | null;
  readiness_multiplier: number;
  warmup_steps: WarmupStep[] | null;
}