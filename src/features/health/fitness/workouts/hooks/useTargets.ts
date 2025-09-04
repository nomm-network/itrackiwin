// src/features/health/fitness/workouts/hooks/useTargets.ts
export function pickFirstSetTarget(opts: {
  serverTargetKg?: number | null;
  lastGoodBaseKg?: number | null; // from last 60d with readiness >= 60
  readinessMultiplier?: number;   // 0.90…1.08
  templateDefaultKg?: number | null;
}): number | null {
  if (opts.serverTargetKg && opts.serverTargetKg > 0) return opts.serverTargetKg;
  const base = opts.lastGoodBaseKg ?? opts.templateDefaultKg ?? null;
  if (!base) return null;
  const m = opts.readinessMultiplier ?? 1;
  return Math.round(base * m * 2) / 2; // round to 0.5
}

export function makeWarmupSteps(topKg: number) {
  // 40%×12 (60s), 60%×10 (90s), 80%×8 (120s)
  const pct = [0.4, 0.6, 0.8];
  const reps = [12, 10, 8];
  const rests = [60, 90, 120];
  return pct.map((p, i) => ({
    kg: Math.round(topKg * p * 2) / 2,
    reps: reps[i],
    rest_s: rests[i],
  }));
}