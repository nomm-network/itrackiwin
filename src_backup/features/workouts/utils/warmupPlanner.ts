import type { WarmupPlan, WarmupStep, WarmupFeedback, GymConfig } from '../types/warmup';

export function computeWarmupPlan(opts: {
  workingWeight: number;           // kg
  mainRepRange: [number, number];  // [min, max]
  feedback?: WarmupFeedback;
  gym: GymConfig;
}): WarmupPlan {
  const [minR, maxR] = opts.mainRepRange;
  const cap = maxR + 3;

  const baseSteps: WarmupStep[] = [
    { id: 'W1', percent: 0.40, reps: Math.min(cap, Math.max(10, maxR + 3)), rest_sec: 60 },
    { id: 'W2', percent: 0.60, reps: Math.min(cap, Math.max(8, maxR + 2)), rest_sec: 60 },
    { id: 'W3', percent: 0.80, reps: Math.max(5, Math.min(maxR, 5)), rest_sec: 60 }
  ];

  // feedback tuning
  const tuned = baseSteps.map(s => ({ ...s }));
  if (opts.feedback === 'not_enough') {
    tuned.forEach(s => { s.reps = Math.min(cap, s.reps + 2); });
    tuned[0].percent = Math.min(0.65, tuned[0].percent + 0.05);
    tuned[1].percent = Math.min(0.85, tuned[1].percent + 0.05);
  } else if (opts.feedback === 'too_much') {
    tuned.forEach(s => { s.reps = Math.max(3, s.reps - 2); });
    tuned.forEach(s => { if (s.reps <= 3) s.percent = Math.max(0.30, s.percent - 0.05); });
  }

  const plan: WarmupPlan = {
    strategy: 'ramped',
    est_minutes: 3,
    base_weight: opts.workingWeight,
    tuned_from_feedback: opts.feedback,
    steps: tuned
  };
  
  return plan;
}

export function roundWarmupToGym(plan: WarmupPlan, gym: GymConfig): WarmupPlan {
  const round = (raw: number) => {
    switch (gym.loading_mode) {
      case 'barbell_sym': {
        const bar = gym.bar_kg ?? 20;
        const plate = gym.min_plate_kg ?? 1.25; // allow micros if present
        const eachSide = Math.max(0, (raw - bar) / 2);
        const roundedSide = Math.round(eachSide / plate) * plate;
        return bar + 2 * roundedSide;
      }
      case 'selectorized': {
        const inc = gym.stack_increment_kg ?? 5;
        return Math.round(raw / inc) * inc;
      }
      case 'fixed_dumbbells': {
        if (!gym.dumbbell_set?.length) return raw;
        // choose the nearest pair sum
        let best = gym.dumbbell_set[0] * 2;
        let diff = Math.abs(best - raw);
        for (const d of gym.dumbbell_set) {
          const total = d * 2;
          const nd = Math.abs(total - raw);
          if (nd < diff) { diff = nd; best = total; }
        }
        return best;
      }
      default:
        return raw;
    }
  };

  plan.steps = plan.steps.map(s => {
    const target = plan.base_weight * s.percent;
    const rounded = round(target);
    // small compensation if we rounded down far
    const pctLoss = (target - rounded) / plan.base_weight; // negative if down
    const reps = pctLoss > 0.05 ? (s.reps + 1) : s.reps;
    return { ...s, reps };
  });
  
  return plan;
}