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
  pct: number;          // percentage of working weight (0.40, 0.60, 0.80)
  weight_kg: number;    // actual weight for this step
  reps: number;         // reps to perform
  rest_s: number;       // rest seconds after this step
}