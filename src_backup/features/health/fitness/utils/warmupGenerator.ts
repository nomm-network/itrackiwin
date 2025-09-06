interface WarmupSet {
  setIndex: number;
  weight: number;
  reps: number;
  restSeconds: number;
  setKind: 'warmup';
}

interface WarmupLadder {
  exerciseId: string;
  targetWeight: number;
  warmupSets: WarmupSet[];
  totalWarmupTimeEstimate: number;
}

interface GymInventory {
  plates?: number[];
  miniweights?: number[];
  barbellWeight?: number;
  increment?: number;
}

/**
 * Rounds weight to the nearest available increment based on gym inventory
 */
function roundToGymIncrement(weight: number, gym?: GymInventory): number {
  const increment = gym?.increment || 2.5;
  return Math.round(weight / increment) * increment;
}

/**
 * Calculates 1RM estimate from any RM using Epley formula
 */
function calculateE1RM(weight: number, reps: number): number {
  if (reps === 1) return weight;
  return weight * (1 + reps / 30);
}

/**
 * Calculates weight for target reps from 1RM
 */
function weightFromE1RM(e1rm: number, targetReps: number): number {
  if (targetReps === 1) return e1rm;
  return e1rm / (1 + targetReps / 30);
}

/**
 * Determines number of warmup steps based on target intensity
 */
function getWarmupSteps(targetWeight: number, estimatedE1RM: number): number {
  const intensity = targetWeight / estimatedE1RM;
  
  if (intensity < 0.6) return 2;      // Light work: 2 steps
  if (intensity < 0.8) return 3;      // Moderate: 3 steps  
  return 4;                           // Heavy work: 4 steps
}

/**
 * Adjusts warmup for pre-fatigue from previous exercises
 */
function adjustForPreFatigue(
  steps: number, 
  musclesUsedBefore: string[], 
  currentPrimaryMuscle: string,
  currentSecondaryMuscles: string[]
): number {
  const overlap = musclesUsedBefore.some(muscle => 
    muscle === currentPrimaryMuscle || 
    currentSecondaryMuscles.includes(muscle)
  );
  
  return overlap ? Math.max(1, steps - 1) : steps;
}

/**
 * Generates warmup ladder for an exercise
 */
export function generateWarmupLadder(params: {
  exerciseId: string;
  targetWeight: number;
  targetReps?: number;
  estimatedE1RM?: number;
  gym?: GymInventory;
  previousMuscles?: string[];
  primaryMuscle?: string;
  secondaryMuscles?: string[];
}): WarmupLadder {
  const {
    exerciseId,
    targetWeight,
    targetReps = 8,
    estimatedE1RM,
    gym,
    previousMuscles = [],
    primaryMuscle = '',
    secondaryMuscles = []
  } = params;

  // Estimate 1RM if not provided
  const e1rm = estimatedE1RM || calculateE1RM(targetWeight, targetReps);
  
  // Determine warmup steps
  let steps = getWarmupSteps(targetWeight, e1rm);
  steps = adjustForPreFatigue(steps, previousMuscles, primaryMuscle, secondaryMuscles);
  
  // Generate warmup percentages
  const percentages: number[] = [];
  switch (steps) {
    case 1:
      percentages.push(0.5);
      break;
    case 2:
      percentages.push(0.4, 0.65);
      break;
    case 3:
      percentages.push(0.4, 0.6, 0.8);
      break;
    case 4:
      percentages.push(0.4, 0.6, 0.75, 0.9);
      break;
  }

  // Generate warmup sets
  const warmupSets: WarmupSet[] = percentages.map((pct, index) => {
    const rawWeight = targetWeight * pct;
    const roundedWeight = roundToGymIncrement(rawWeight, gym);
    
    // Reps: higher for lighter weights
    const reps = pct < 0.5 ? 10 : pct < 0.7 ? 8 : pct < 0.85 ? 5 : 3;
    
    return {
      setIndex: index + 1,
      weight: Math.max(roundedWeight, gym?.barbellWeight || 20),
      reps,
      restSeconds: 60,
      setKind: 'warmup' as const,
    };
  });

  // Calculate total time estimate
  const totalTime = warmupSets.length * 60 + (warmupSets.length - 1) * 60; // 1min per set + 1min rest

  return {
    exerciseId,
    targetWeight,
    warmupSets,
    totalWarmupTimeEstimate: totalTime,
  };
}

/**
 * Quick helper for common use case
 */
export function generateQuickWarmup(
  exerciseId: string, 
  targetWeight: number, 
  gym?: GymInventory
): WarmupLadder {
  return generateWarmupLadder({
    exerciseId,
    targetWeight,
    gym,
  });
}