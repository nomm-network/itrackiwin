/**
 * Enhanced warmup context tracking muscle group warmth across exercises
 */

export type MuscleGroupId = string;

interface MuscleWarmthState {
  groupWarmth: Map<MuscleGroupId, number>; // 0 = cold, 1 = touched, 2+ = warmed
  exerciseOrder: number;
}

const warmthState: MuscleWarmthState = {
  groupWarmth: new Map(),
  exerciseOrder: 0
};

/**
 * Reset warmth context for new workout session
 */
export function resetMuscleWarmthContext(): void {
  warmthState.groupWarmth.clear();
  warmthState.exerciseOrder = 0;
}

/**
 * Log a working set to update muscle warmth
 */
export function logMuscleActivation(
  primaryMuscleGroupIds: MuscleGroupId[],
  secondaryMuscleGroupIds: MuscleGroupId[] = []
): void {
  warmthState.exerciseOrder++;
  
  // Primary muscles get +2 warmth
  primaryMuscleGroupIds.forEach(groupId => {
    const current = warmthState.groupWarmth.get(groupId) || 0;
    warmthState.groupWarmth.set(groupId, current + 2);
  });
  
  // Secondary muscles get +1 warmth
  secondaryMuscleGroupIds.forEach(groupId => {
    const current = warmthState.groupWarmth.get(groupId) || 0;
    warmthState.groupWarmth.set(groupId, Math.max(current + 1, current)); // Don't downgrade from primary
  });
}

/**
 * Get warmth score for muscle groups (for warmup calculation)
 */
export function getMuscleWarmthScore(
  primaryMuscleGroupIds: MuscleGroupId[],
  secondaryMuscleGroupIds: MuscleGroupId[] = []
): number {
  // Take the highest warmth score among the primary muscle groups
  let maxWarmth = 0;
  
  primaryMuscleGroupIds.forEach(groupId => {
    const warmth = warmthState.groupWarmth.get(groupId) || 0;
    maxWarmth = Math.max(maxWarmth, warmth);
  });
  
  // Consider secondary muscle carryover (but at reduced weight)
  secondaryMuscleGroupIds.forEach(groupId => {
    const warmth = (warmthState.groupWarmth.get(groupId) || 0) * 0.5;
    maxWarmth = Math.max(maxWarmth, warmth);
  });
  
  return maxWarmth;
}

/**
 * Calculate recommended warmup sets based on muscle warmth
 */
export function calculateWarmupSetsFromWarmth(
  primaryMuscleGroupIds: MuscleGroupId[],
  secondaryMuscleGroupIds: MuscleGroupId[] = []
): {
  setCount: number;
  percentages: number[];
  reason: string;
} {
  const warmthScore = getMuscleWarmthScore(primaryMuscleGroupIds, secondaryMuscleGroupIds);
  
  if (warmthScore >= 2) {
    return {
      setCount: 1,
      percentages: [70],
      reason: 'Muscles already warmed from previous exercises'
    };
  }
  
  if (warmthScore >= 1) {
    return {
      setCount: 2,
      percentages: [55, 75],
      reason: 'Muscles partially warmed (secondary carryover)'
    };
  }
  
  // Cold start
  return {
    setCount: 3,
    percentages: [40, 60, 80],
    reason: 'Cold muscles - full warmup needed'
  };
}

/**
 * Get current warmth state for debugging/telemetry
 */
export function getWarmthState(): {
  groupWarmth: Record<string, number>;
  exerciseOrder: number;
} {
  return {
    groupWarmth: Object.fromEntries(warmthState.groupWarmth),
    exerciseOrder: warmthState.exerciseOrder
  };
}