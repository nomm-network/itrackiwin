import { MusclePriorityWithName } from '../hooks/useMusclePriorities.hook';

export interface PriorityWeightMap {
  [muscleSlug: string]: number;
}

export interface PriorityConfig {
  level: number;
  volumeMultiplier: number;
  progressionMultiplier: number;
  frequencyMultiplier: number;
}

// Configuration for priority levels
export const PRIORITY_CONFIGS: Record<number, PriorityConfig> = {
  1: {
    level: 1,
    volumeMultiplier: 1.3,     // +30% volume
    progressionMultiplier: 1.2, // +20% progression focus
    frequencyMultiplier: 1.2    // +20% frequency
  },
  2: {
    level: 2,
    volumeMultiplier: 1.2,     // +20% volume
    progressionMultiplier: 1.1, // +10% progression focus
    frequencyMultiplier: 1.1    // +10% frequency
  },
  3: {
    level: 3,
    volumeMultiplier: 1.1,     // +10% volume
    progressionMultiplier: 1.05, // +5% progression focus
    frequencyMultiplier: 1.05   // +5% frequency
  }
};

/**
 * Generates a normalized weight map from user muscle priorities
 */
export const generatePriorityWeightMap = (priorities: any[]): PriorityWeightMap => {
  const weightMap: PriorityWeightMap = {};
  
  priorities.forEach(priority => {
    const config = PRIORITY_CONFIGS[priority.priority_level];
    if (config) {
      weightMap[priority.muscle_group_id] = config.volumeMultiplier;
    }
  });
  
  return weightMap;
};

/**
 * Gets the volume multiplier for a specific muscle group
 */
export const getVolumeMultiplier = (muscleSlug: string, priorities: MusclePriorityWithName[]): number => {
  const priority = priorities.find(p => p.muscle_slug === muscleSlug);
  if (!priority) return 1.0; // Default multiplier
  
  const config = PRIORITY_CONFIGS[priority.priority_level];
  return config?.volumeMultiplier || 1.0;
};

/**
 * Gets the progression multiplier for a specific muscle group
 */
export const getProgressionMultiplier = (muscleSlug: string, priorities: MusclePriorityWithName[]): number => {
  const priority = priorities.find(p => p.muscle_slug === muscleSlug);
  if (!priority) return 1.0;
  
  const config = PRIORITY_CONFIGS[priority.priority_level];
  return config?.progressionMultiplier || 1.0;
};

/**
 * Gets the frequency multiplier for a specific muscle group
 */
export const getFrequencyMultiplier = (muscleSlug: string, priorities: MusclePriorityWithName[]): number => {
  const priority = priorities.find(p => p.muscle_slug === muscleSlug);
  if (!priority) return 1.0;
  
  const config = PRIORITY_CONFIGS[priority.priority_level];
  return config?.frequencyMultiplier || 1.0;
};

/**
 * Applies priority-based volume adjustments to base volume
 */
export const applyPriorityVolumeAdjustment = (
  baseVolume: number, 
  muscleSlug: string, 
  priorities: MusclePriorityWithName[]
): number => {
  const multiplier = getVolumeMultiplier(muscleSlug, priorities);
  return Math.round(baseVolume * multiplier);
};

/**
 * Gets a comprehensive priority summary for a muscle group
 */
export const getMusclePrioritySummary = (
  muscleSlug: string, 
  priorities: MusclePriorityWithName[]
) => {
  const priority = priorities.find(p => p.muscle_slug === muscleSlug);
  
  if (!priority) {
    return {
      isPrioritized: false,
      level: 0,
      volumeMultiplier: 1.0,
      progressionMultiplier: 1.0,
      frequencyMultiplier: 1.0,
      description: 'Standard focus'
    };
  }
  
  const config = PRIORITY_CONFIGS[priority.priority_level];
  const levelNames = {
    1: 'Primary Focus',
    2: 'Secondary Focus', 
    3: 'Tertiary Focus'
  };
  
  return {
    isPrioritized: true,
    level: priority.priority_level,
    volumeMultiplier: config.volumeMultiplier,
    progressionMultiplier: config.progressionMultiplier,
    frequencyMultiplier: config.frequencyMultiplier,
    description: levelNames[priority.priority_level as keyof typeof levelNames] || 'Prioritized'
  };
};

/**
 * Calculates total weekly volume for multiple muscle groups with priorities applied
 */
export const calculateTotalPrioritizedVolume = (
  baseVolumes: Record<string, number>,
  priorities: MusclePriorityWithName[]
): Record<string, number> => {
  const adjustedVolumes: Record<string, number> = {};
  
  Object.entries(baseVolumes).forEach(([muscleSlug, baseVolume]) => {
    adjustedVolumes[muscleSlug] = applyPriorityVolumeAdjustment(
      baseVolume,
      muscleSlug,
      priorities
    );
  });
  
  return adjustedVolumes;
};