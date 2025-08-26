import { WarmupPlan, WarmupStep } from '@/features/workouts/types/warmup';

type Feel = '--' | '-' | '=' | '+' | '++';
type Feedback = 'not_enough' | 'excellent' | 'too_much';

export type CalcWarmupInput = {
  workingWeightKg: number;
  workingReps: number;        // target reps for current set
  minIncrement: number;       // from gym rules (plates, stack + micro)
  feedback?: Feedback | null; // last chosen feedback for this exercise in this workout
};

const clampToIncrement = (kg: number, inc: number) =>
  Math.round(kg / inc) * inc;

export function defaultRampedSteps(): WarmupStep[] {
  return [
    { id: 'w1', percent: 0.40, reps: 10, restSec: 60 },
    { id: 'w2', percent: 0.60, reps: 8,  restSec: 60 },
    { id: 'w3', percent: 0.80, reps: 5,  restSec: 60 },
  ];
}

function tweakByFeedback(steps: WarmupStep[], fb?: Feedback | null): WarmupStep[] {
  if (!fb) return steps;

  // simple, effective rules:
  // - "not enough": add a light primer + slightly raise w2/w3 %s
  // - "too much": drop a step or reduce early %s
  switch (fb) {
    case 'not_enough':
      return [
        { id: 'w1', percent: 0.30, reps: 12, restSec: 45 }, // extra primer
        { ...steps[0], percent: steps[0].percent + 0.05 },
        { ...steps[1], percent: steps[1].percent + 0.05 },
        steps[2],
      ];
    case 'too_much':
      return [
        { ...steps[0], percent: Math.max(0.35, steps[0].percent - 0.05), reps: steps[0].reps - 2 },
        { ...steps[1], percent: Math.max(0.55, steps[1].percent - 0.05) },
        // keep w3 as is, or reduce by 0.05:
        { ...steps[2], percent: Math.max(0.75, steps[2].percent - 0.05) },
      ];
    default:
      return steps; // excellent
  }
}

export function buildWarmupPlan(input: CalcWarmupInput): WarmupPlan {
  const base = defaultRampedSteps();
  const adjusted = tweakByFeedback(base, input.feedback);

  const steps = adjusted.map(s => ({
    ...s,
    // Ensure proper ID assignment for adjusted steps
    id: s.id || (`w${adjusted.indexOf(s) + 1}` as any),
  }));

  return {
    strategy: 'ramped',
    steps,
    source: 'auto',
    updatedAt: new Date().toISOString(),
  };
}

// Helper to get actual weight for a step
export function getStepWeight(step: WarmupStep, workingWeight: number, minIncrement: number): number {
  return clampToIncrement(step.percent * workingWeight, minIncrement);
}
