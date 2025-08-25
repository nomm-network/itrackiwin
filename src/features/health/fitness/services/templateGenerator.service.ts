import { supabase } from "@/integrations/supabase/client";
import { getEquipmentCapabilities, type EquipmentCapabilities } from './equipmentCapabilities.service';
import { generatePriorityWeightMap } from './musclePriorityService';
import { getSexBasedTrainingConfig } from '../utils/sexBasedTraining';

export interface TemplateGeneratorInputs {
  userId: string;
  goal: 'strength' | 'hypertrophy' | 'endurance' | 'powerlifting' | 'general_fitness';
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  daysPerWeek: number; // 3-6
  sessionLengthMinutes: number; // 45-120
  prioritizedMuscles?: string[]; // muscle group IDs
  injuries?: string[]; // body part IDs to avoid
  equipmentCapabilities?: EquipmentCapabilities;
}

export interface GeneratedTemplate {
  template: {
    name: string;
    description: string;
    notes: string;
    estimated_duration_minutes: number;
    difficulty_level: string;
  };
  exercises: GeneratedExercise[];
}

export interface GeneratedExercise {
  exerciseId: string;
  orderIndex: number;
  defaultSets: number;
  targetReps: number;
  repRangeMin: number;
  repRangeMax: number;
  restSeconds: number;
  weightUnit: 'kg' | 'lbs';
  notes?: string;
  setType: 'normal' | 'warmup' | 'drop' | 'superset';
  progressionPolicy?: string;
}

export interface VolumeAllocation {
  muscleGroupId: string;
  weeklySetTarget: number;
  priorityMultiplier: number;
  setsPerSession: number;
}

// Core volume allocation logic
export function calculateVolumeAllocation(
  inputs: TemplateGeneratorInputs,
  priorityWeights: Record<string, number>,
  muscleGroups: any[]
): VolumeAllocation[] {
  const baseWeeklySets = getBaseWeeklySets(inputs.experienceLevel, inputs.goal);
  
  return muscleGroups.map(mg => {
    const priorityMultiplier = priorityWeights[mg.id] || 1.0;
    const weeklySetTarget = Math.round(baseWeeklySets * priorityMultiplier);
    const setsPerSession = Math.ceil(weeklySetTarget / inputs.daysPerWeek);
    
    return {
      muscleGroupId: mg.id,
      weeklySetTarget,
      priorityMultiplier,
      setsPerSession: Math.max(1, setsPerSession)
    };
  });
}

function getBaseWeeklySets(experienceLevel: string, goal: string): number {
  const baseSets = {
    beginner: 10,
    intermediate: 14,
    advanced: 18
  };
  
  const goalMultiplier = {
    strength: 0.8,
    hypertrophy: 1.2,
    endurance: 1.4,
    powerlifting: 0.7,
    general_fitness: 1.0
  };
  
  return Math.round(baseSets[experienceLevel as keyof typeof baseSets] * goalMultiplier[goal as keyof typeof goalMultiplier]);
}

// Exercise selection logic
export async function selectExercisesForMuscleGroup(
  muscleGroupId: string,
  setsRequired: number,
  equipmentCaps: EquipmentCapabilities,
  excludedExercises: string[] = []
): Promise<any[]> {
  const { data: exercises } = await supabase
    .from('v_exercises_with_translations')
    .select(`
      id, slug, translations, equipment_id,
      primary_muscle_id,
      secondary_muscle_group_ids,
      capability_schema,
      equipment(slug)
    `)
    .or(`primary_muscle_id.eq.${muscleGroupId},secondary_muscle_group_ids.cs.{${muscleGroupId}}`)
    .eq('is_public', true)
    .not('id', 'in', `(${excludedExercises.join(',') || 'null'})`)
    .order('popularity_rank', { ascending: true, nullsFirst: false })
    .limit(20);

  if (!exercises?.length) return [];

  // Filter by available equipment
  const availableExercises = exercises.filter(ex => {
    const equipmentSlug = ex.equipment?.slug;
    if (!equipmentSlug) return true; // Bodyweight exercises
    
    return (
      (equipmentSlug.includes('barbell') && equipmentCaps.bars.available) ||
      (equipmentSlug.includes('dumbbell') && equipmentCaps.dumbbells.available) ||
      (equipmentSlug.includes('machine') && equipmentCaps.machines.available) ||
      (equipmentSlug.includes('cable') && equipmentCaps.cables.available) ||
      equipmentSlug === 'bodyweight'
    );
  });

  // Select exercises based on sets required
  if (setsRequired <= 3) {
    return availableExercises.slice(0, 1); // Single exercise
  } else if (setsRequired <= 6) {
    return availableExercises.slice(0, 2); // Two exercises
  } else {
    return availableExercises.slice(0, 3); // Three exercises max
  }
}

// Set/rep scheme logic
export function generateSetRepScheme(
  goal: string,
  experienceLevel: string,
  exerciseType: 'compound' | 'isolation' | 'accessory'
): { sets: number; repRangeMin: number; repRangeMax: number; restSeconds: number } {
  const schemes = {
    strength: {
      compound: { sets: 4, repRangeMin: 3, repRangeMax: 5, restSeconds: 180 },
      isolation: { sets: 3, repRangeMin: 6, repRangeMax: 8, restSeconds: 120 },
      accessory: { sets: 3, repRangeMin: 8, repRangeMax: 12, restSeconds: 90 }
    },
    hypertrophy: {
      compound: { sets: 3, repRangeMin: 6, repRangeMax: 8, restSeconds: 150 },
      isolation: { sets: 3, repRangeMin: 8, repRangeMax: 12, restSeconds: 90 },
      accessory: { sets: 3, repRangeMin: 12, repRangeMax: 15, restSeconds: 60 }
    },
    endurance: {
      compound: { sets: 3, repRangeMin: 12, repRangeMax: 15, restSeconds: 90 },
      isolation: { sets: 3, repRangeMin: 15, repRangeMax: 20, restSeconds: 60 },
      accessory: { sets: 2, repRangeMin: 20, repRangeMax: 25, restSeconds: 45 }
    },
    powerlifting: {
      compound: { sets: 5, repRangeMin: 1, repRangeMax: 3, restSeconds: 240 },
      isolation: { sets: 3, repRangeMin: 5, repRangeMax: 8, restSeconds: 120 },
      accessory: { sets: 3, repRangeMin: 8, repRangeMax: 12, restSeconds: 90 }
    },
    general_fitness: {
      compound: { sets: 3, repRangeMin: 8, repRangeMax: 12, restSeconds: 120 },
      isolation: { sets: 3, repRangeMin: 10, repRangeMax: 15, restSeconds: 90 },
      accessory: { sets: 2, repRangeMin: 12, repRangeMax: 15, restSeconds: 60 }
    }
  };

  return schemes[goal as keyof typeof schemes][exerciseType];
}

// Main template generator
export async function generateTemplate(inputs: TemplateGeneratorInputs): Promise<GeneratedTemplate> {
  try {
    // Get user's equipment capabilities
    const equipmentCaps = inputs.equipmentCapabilities || 
      await getEquipmentCapabilities(inputs.userId);
    
    // Get muscle priority weights
    const { data: userPriorities } = await supabase
      .from('user_muscle_priorities')
      .select('muscle_group_id, priority_level')
      .eq('user_id', inputs.userId);
    
    const priorityWeights = generatePriorityWeightMap(userPriorities || []);
    
    // Get user's sex for training adjustments
    const { data: profile } = await supabase
      .from('user_profile_fitness')
      .select('sex')
      .eq('user_id', inputs.userId)
      .single();
    
    const sexConfig = getSexBasedTrainingConfig(profile?.sex || 'male');
    
    // Get muscle groups
    const { data: muscleGroups } = await supabase
      .from('muscle_groups')
      .select('id, slug')
      .limit(10);
    
    if (!muscleGroups?.length) {
      throw new Error('No muscle groups found');
    }
    
    // Calculate volume allocation
    const volumeAllocation = calculateVolumeAllocation(inputs, priorityWeights, muscleGroups);
    
    // Generate template metadata
    const templateName = generateTemplateName(inputs);
    const estimatedDuration = calculateEstimatedDuration(volumeAllocation, inputs.sessionLengthMinutes);
    
    // Generate exercises for each muscle group
    const allExercises: GeneratedExercise[] = [];
    let orderIndex = 1;
    const usedExercises: string[] = [];
    
    for (const allocation of volumeAllocation.slice(0, 6)) { // Limit to 6 muscle groups
      if (allocation.setsPerSession < 1) continue;
      
      const exercises = await selectExercisesForMuscleGroup(
        allocation.muscleGroupId,
        allocation.setsPerSession,
        equipmentCaps,
        usedExercises
      );
      
      for (const exercise of exercises) {
        const exerciseType = determineExerciseType(exercise);
        const scheme = generateSetRepScheme(inputs.goal, inputs.experienceLevel, exerciseType);
        
        // Apply sex-based adjustments
        const repRange = sexConfig.repRanges[inputs.goal as keyof typeof sexConfig.repRanges] || [scheme.repRangeMin, scheme.repRangeMax];
        const adjustedScheme = {
          ...scheme,
          repRangeMin: repRange[0],
          repRangeMax: repRange[1],
          restSeconds: sexConfig.defaultRest[exerciseType as keyof typeof sexConfig.defaultRest] || scheme.restSeconds
        };
        
        allExercises.push({
          exerciseId: exercise.id,
          orderIndex: orderIndex++,
          defaultSets: adjustedScheme.sets,
          targetReps: Math.round((adjustedScheme.repRangeMin + adjustedScheme.repRangeMax) / 2),
          repRangeMin: adjustedScheme.repRangeMin,
          repRangeMax: adjustedScheme.repRangeMax,
          restSeconds: adjustedScheme.restSeconds,
          weightUnit: 'kg',
          setType: 'normal',
          progressionPolicy: 'linear'
        });
        
        usedExercises.push(exercise.id);
        
        // Limit exercises per session
        if (allExercises.length >= 8) break;
      }
      
      if (allExercises.length >= 8) break;
    }
    
    return {
      template: {
        name: templateName,
        description: generateTemplateDescription(inputs),
        notes: generateTemplateNotes(inputs, sexConfig),
        estimated_duration_minutes: estimatedDuration,
        difficulty_level: inputs.experienceLevel
      },
      exercises: allExercises
    };
    
  } catch (error) {
    console.error('Template generation failed:', error);
    throw new Error(`Failed to generate template: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function generateTemplateName(inputs: TemplateGeneratorInputs): string {
  const goalNames = {
    strength: 'Strength',
    hypertrophy: 'Hypertrophy',
    endurance: 'Endurance',
    powerlifting: 'Powerlifting',
    general_fitness: 'General Fitness'
  };
  
  const frequency = inputs.daysPerWeek === 3 ? '3-Day' : 
                   inputs.daysPerWeek === 4 ? '4-Day' : 
                   inputs.daysPerWeek === 5 ? '5-Day' : 
                   `${inputs.daysPerWeek}-Day`;
  
  return `${frequency} ${goalNames[inputs.goal]} Split`;
}

function generateTemplateDescription(inputs: TemplateGeneratorInputs): string {
  return `A ${inputs.experienceLevel}-level ${inputs.goal} program designed for ${inputs.daysPerWeek} days per week. Session duration: approximately ${inputs.sessionLengthMinutes} minutes.`;
}

function generateTemplateNotes(inputs: TemplateGeneratorInputs, sexConfig: any): string {
  const notes = [
    `Generated for ${inputs.experienceLevel} level athlete`,
    `Target: ${inputs.goal} development`,
    `Frequency: ${inputs.daysPerWeek} days per week`
  ];
  
  if (sexConfig.volumeBias) {
    const bias = Object.entries(sexConfig.volumeBias).find(([key]) => 
      key.toLowerCase().includes('volume') || key.toLowerCase().includes('training')
    );
    if (bias) {
      notes.push(`Training emphasis: ${bias[0]} bias applied`);
    }
  }
  
  return notes.join(' • ');
}

function calculateEstimatedDuration(allocation: VolumeAllocation[], maxDuration: number): number {
  const totalSets = allocation.reduce((sum, a) => sum + a.setsPerSession, 0);
  const estimatedMinutes = Math.min(
    30 + (totalSets * 4), // 4 minutes per set including rest
    maxDuration
  );
  return Math.round(estimatedMinutes);
}

function determineExerciseType(exercise: any): 'compound' | 'isolation' | 'accessory' {
  const compoundPatterns = ['squat', 'deadlift', 'bench', 'press', 'row', 'pull-up', 'chin-up'];
  const exerciseName = exercise.translations?.en?.name?.toLowerCase() || exercise.translations?.ro?.name?.toLowerCase() || exercise.slug?.toLowerCase() || '';
  
  if (compoundPatterns.some(pattern => exerciseName.includes(pattern))) {
    return 'compound';
  }
  
  // Check if it targets multiple muscle groups
  if (exercise.secondary_muscle_group_ids?.length > 1) {
    return 'compound';
  }
  
  return 'isolation';
}