import { WarmupPlan, WarmupStep } from '@/features/workouts/types/warmup';
import { WeightModel, closestBarbellWeightKg } from '@/lib/equipment/gymWeightModel';
import { calculateWarmupSetsFromWarmth } from '@/lib/training/muscleWarmupContext';

type Feel = '--' | '-' | '=' | '+' | '++';
type Feedback = 'not_enough' | 'excellent' | 'too_much';

export type CalcWarmupInput = {
  topWeightKg: number;        // heaviest working set weight (total)
  repsGoal: number;           // target reps for working sets
  strategy?: 'ramped' | 'quick' | 'power';
  roundingKg: number;         // gym increment (2.5 for stacks, minPlate*2 for barbell)
  minWeightKg?: number;       // empty bar or machine minimum
  feedback?: Feedback | null; // last chosen feedback for this exercise in this workout
  muscleGroupIds?: string[];  // for warmth-based set count calculation
  weightModel?: WeightModel;  // for equipment-aware snapping
};

const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x));
const roundTo = (x: number, step: number) => Math.round(x / step) * step;

function getBaseSteps(strategy: 'ramped' | 'quick' | 'power' = 'ramped') {
  switch (strategy) {
    case 'quick':
      return [{ p: 0.5, r: 8 }, { p: 0.7, r: 5 }];
    case 'power':
      return [{ p: 0.4, r: 5 }, { p: 0.6, r: 3 }, { p: 0.8, r: 1 }];
    default: // ramped
      return [{ p: 0.4, r: 10 }, { p: 0.6, r: 8 }, { p: 0.8, r: 5 }];
  }
}

export function buildWarmupPlan(input: CalcWarmupInput): WarmupPlan {
  const {
    topWeightKg,
    strategy = 'ramped',
    roundingKg,
    minWeightKg = 0,
    feedback,
    muscleGroupIds = [],
    weightModel
  } = input;

  // Use muscle warmth context if available, otherwise fallback to strategy
  let baseSteps;
  if (muscleGroupIds.length > 0) {
    const warmthResult = calculateWarmupSetsFromWarmth(muscleGroupIds);
    const percentages = warmthResult.percentages;
    baseSteps = percentages.map((p, i) => ({
      p: p / 100,
      r: Math.max(5, 12 - i * 2) // Decreasing reps: 12, 10, 8, etc.
    }));
  } else {
    baseSteps = getBaseSteps(strategy);
  }

  // Micro-adjust by feedback (±5% total volume feel)
  let volBias = 0;
  if (feedback === 'not_enough') volBias = +0.05;
  if (feedback === 'too_much') volBias = -0.05;

  const steps = baseSteps.map((s, i) => {
    // Distribute volume bias toward earlier sets
    const pAdj = s.p + volBias * (1 - i / baseSteps.length);
    let targetWeight = clamp(topWeightKg * pAdj, minWeightKg, topWeightKg * 0.95);
    
    // Snap to achievable weight if weight model is provided
    if (weightModel) {
      const plateProfile = {
        unit: weightModel.unit,
        sides: weightModel.platesKgPerSide,
        micro: weightModel.auxIncrementsKg || [],
        barbell_weight: weightModel.barTypes.barbell?.barKg || 20,
        ezbar_weight: weightModel.barTypes.ezbar?.barKg || 7.5,
        fixedbar_weight: weightModel.barTypes.fixed?.barKg || 20
      };
      const plateResult = closestBarbellWeightKg(
        plateProfile,
        targetWeight,
        weightModel.barTypes.barbell?.barKg || 20
      );
      targetWeight = plateResult.total_kg;
    } else {
      targetWeight = Math.max(minWeightKg, roundTo(targetWeight, roundingKg));
    }

    // Progressive rest times: 60s, 90s, 120s
    const restTimes = [60, 90, 120];

    return {
      id: (['w1', 'w2', 'w3', 'w4'][i] as WarmupStep['id']),
      percent: targetWeight / topWeightKg, // Store the actual percentage used
      reps: s.r,
      restSec: restTimes[i] || 60,
    };
  });

  return {
    strategy: 'ramped',
    est_minutes: 3,
    base_weight: topWeightKg,
    steps: steps.map(s => ({
      ...s,
      rest_sec: s.restSec,
      id: s.id.toUpperCase() as WarmupStep['id']
    }))
  };
}

// Helper to get actual weight for a step
export function getStepWeight(step: WarmupStep, workingWeight: number, minIncrement: number): number {
  return roundTo(step.percent * workingWeight, minIncrement);
}
