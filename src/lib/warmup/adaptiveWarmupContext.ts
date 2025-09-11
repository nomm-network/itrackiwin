/**
 * Adaptive warmup context - tracks muscle group usage within a workout session
 * to dynamically adjust warmup set counts (3→2→1 rule)
 */

export type WarmupContext = { 
  primary: Set<string>; 
  secondary: Set<string>; 
};

export interface ExerciseMuscleData {
  primaryMuscleGroupId: string;
  secondaryMuscleGroupIds?: string[];
}

/**
 * Create new warmup context for a workout session
 */
export function createWarmupContext(): WarmupContext {
  return { 
    primary: new Set(), 
    secondary: new Set() 
  };
}

/**
 * Determine warmup set count based on muscle group usage
 * Rule: 3 sets for first time, 2 sets if touched as secondary, 1 set if already primary
 */
export function nextWarmupCountFor(
  exerciseMuscleData: ExerciseMuscleData, 
  ctx: WarmupContext
): 1 | 2 | 3 {
  const { primaryMuscleGroupId, secondaryMuscleGroupIds = [] } = exerciseMuscleData;
  
  // If primary muscle already worked as primary → 1 set
  if (ctx.primary.has(primaryMuscleGroupId)) {
    return 1;
  }
  
  // If primary muscle worked as secondary → 2 sets
  if (ctx.secondary.has(primaryMuscleGroupId)) {
    return 2;
  }
  
  // Cold muscle group → 3 sets
  return 3;
}

/**
 * Record muscle group usage after completing an exercise's warmup/working sets
 */
export function commitExercise(
  exerciseMuscleData: ExerciseMuscleData, 
  ctx: WarmupContext
): void {
  const { primaryMuscleGroupId, secondaryMuscleGroupIds = [] } = exerciseMuscleData;
  
  // Add to primary usage
  ctx.primary.add(primaryMuscleGroupId);
  
  // Add secondaries to secondary usage (but don't downgrade if already primary)
  secondaryMuscleGroupIds.forEach(groupId => {
    if (!ctx.primary.has(groupId)) {
      ctx.secondary.add(groupId);
    }
  });
}

/**
 * Get recommended warmup percentages based on set count
 */
export function getWarmupPercentages(setCount: 1 | 2 | 3): number[] {
  switch (setCount) {
    case 1:
      return [70];
    case 2:
      return [55, 75];
    case 3:
      return [40, 60, 80];
    default:
      return [40, 60, 80];
  }
}

/**
 * Handle superset edge case - use max warmup count of involved exercises
 */
export function nextWarmupCountForSuperset(
  exercises: ExerciseMuscleData[],
  ctx: WarmupContext
): 1 | 2 | 3 {
  const counts = exercises.map(ex => nextWarmupCountFor(ex, ctx));
  return Math.max(...counts) as 1 | 2 | 3;
}

/**
 * Get warmup context state for debugging/telemetry
 */
export function getWarmupContextState(ctx: WarmupContext): {
  primaryGroups: string[];
  secondaryGroups: string[];
} {
  return {
    primaryGroups: Array.from(ctx.primary),
    secondaryGroups: Array.from(ctx.secondary)
  };
}