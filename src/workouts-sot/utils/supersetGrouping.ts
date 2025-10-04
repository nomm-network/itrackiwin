// Superset grouping utilities
export interface SupersetExercise {
  id: string;
  exercise_id: string;
  order_index: number;
  superset_order: number;
  superset_rounds_target: number;
  sets: any[];
  exercise: any;
  // ... all other exercise properties
  [key: string]: any;
}

export interface SupersetGroup {
  type: 'superset';
  superset_group_id: string;
  exercises: SupersetExercise[];
  rounds_target: number;
  order_index: number;
}

export interface SingleExerciseBlock {
  type: 'single';
  exercise: any;
  order_index: number;
}

export type ExerciseBlock = SupersetGroup | SingleExerciseBlock;

/**
 * Groups exercises into blocks (supersets or singles)
 * Exercises with the same superset_group_id are grouped together
 */
export function groupExercisesIntoBlocks(exercises: any[]): ExerciseBlock[] {
  if (!exercises?.length) return [];
  
  // Sort by order_index first
  const sorted = [...exercises].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
  
  const blocks: ExerciseBlock[] = [];
  const supersetMap = new Map<string, SupersetExercise[]>();
  
  for (const ex of sorted) {
    if (ex.superset_group_id) {
      // Part of a superset
      if (!supersetMap.has(ex.superset_group_id)) {
        supersetMap.set(ex.superset_group_id, []);
      }
      supersetMap.get(ex.superset_group_id)!.push(ex);
    } else {
      // Single exercise
      blocks.push({
        type: 'single',
        exercise: ex,
        order_index: ex.order_index ?? 0
      });
    }
  }
  
  // Convert superset groups to blocks
  for (const [groupId, groupExercises] of supersetMap.entries()) {
    // Sort by superset_order within the group
    const sortedGroup = groupExercises.sort((a, b) => 
      (a.superset_order ?? 1) - (b.superset_order ?? 1)
    );
    
    blocks.push({
      type: 'superset',
      superset_group_id: groupId,
      exercises: sortedGroup,
      rounds_target: sortedGroup[0]?.superset_rounds_target ?? 3,
      order_index: sortedGroup[0]?.order_index ?? 0
    });
  }
  
  // Sort blocks by the order_index of their first exercise
  return blocks.sort((a, b) => a.order_index - b.order_index);
}

/**
 * Get the current round number for a superset group
 * Round is determined by the MINIMUM set count across all exercises in the group
 */
export function getCurrentRound(exercises: SupersetExercise[]): number {
  if (!exercises?.length) return 0;
  
  const setCounts = exercises.map(ex => {
    const completedSets = (ex.sets || []).filter((s: any) => s.is_completed).length;
    return completedSets;
  });
  
  // Current round is the minimum count + 1
  return Math.min(...setCounts) + 1;
}

/**
 * Check if a round is complete (all exercises have at least n sets)
 */
export function isRoundComplete(exercises: SupersetExercise[], roundNumber: number): boolean {
  if (!exercises?.length) return false;
  
  return exercises.every(ex => {
    const completedSets = (ex.sets || []).filter((s: any) => s.is_completed).length;
    return completedSets >= roundNumber;
  });
}

/**
 * Get superset letter (A, B, C, etc.) based on order
 */
export function getSupersetLetter(order: number): string {
  return String.fromCharCode(64 + order); // 1=A, 2=B, 3=C
}

/**
 * Calculate rest duration for superset transitions
 * Short rest between exercises (A→B), normal rest between rounds
 */
export function getSupersetRestDuration(
  isLastExerciseInRound: boolean,
  lastSetRpe?: number
): number {
  if (isLastExerciseInRound) {
    // End of round - use normal rest logic
    if (!lastSetRpe) return 90; // Default
    if (lastSetRpe >= 8) return 120; // Hard set
    if (lastSetRpe >= 6) return 90;  // Moderate
    return 60; // Easy
  } else {
    // Between exercises in a round - short transition
    return 15; // 15 seconds
  }
}
