import { supabase } from "@/integrations/supabase/client";
import { type EquipmentCapabilities } from './equipmentCapabilities.service';

export interface ExerciseConstraints {
  excludeExerciseIds?: string[];
  maxDifficulty?: 'beginner' | 'intermediate' | 'advanced';
  preferredEquipment?: string[];
  avoidInjuries?: string[]; // body part IDs to avoid
  requiresBilateral?: boolean; // true for bilateral movements, false for unilateral
}

export interface ExerciseAlternative {
  exerciseId: string;
  name: string;
  slug: string;
  matchScore: number; // 0-100 similarity score
  matchReasons: string[];
  equipment?: {
    id: string;
    slug: string;
  };
  difficultyLevel?: string;
  movementPattern?: string;
}

export interface MovementPattern {
  primary: 'push' | 'pull' | 'squat' | 'hinge' | 'lunge' | 'carry' | 'rotation' | 'static';
  plane: 'sagittal' | 'frontal' | 'transverse' | 'combined';
  kinetic_chain: 'open' | 'closed';
  force_type: 'concentric' | 'eccentric' | 'isometric' | 'plyometric';
}

// Movement pattern inference based on exercise names and equipment
const MOVEMENT_PATTERNS: Record<string, Partial<MovementPattern>> = {
  // Push patterns
  'bench-press': { primary: 'push', plane: 'sagittal', kinetic_chain: 'open', force_type: 'concentric' },
  'chest-press': { primary: 'push', plane: 'sagittal', kinetic_chain: 'open', force_type: 'concentric' },
  'overhead-press': { primary: 'push', plane: 'sagittal', kinetic_chain: 'open', force_type: 'concentric' },
  'shoulder-press': { primary: 'push', plane: 'sagittal', kinetic_chain: 'open', force_type: 'concentric' },
  'push-up': { primary: 'push', plane: 'sagittal', kinetic_chain: 'closed', force_type: 'concentric' },
  'dip': { primary: 'push', plane: 'sagittal', kinetic_chain: 'closed', force_type: 'concentric' },
  
  // Pull patterns  
  'pull-up': { primary: 'pull', plane: 'sagittal', kinetic_chain: 'closed', force_type: 'concentric' },
  'chin-up': { primary: 'pull', plane: 'sagittal', kinetic_chain: 'closed', force_type: 'concentric' },
  'row': { primary: 'pull', plane: 'sagittal', kinetic_chain: 'open', force_type: 'concentric' },
  'pulldown': { primary: 'pull', plane: 'sagittal', kinetic_chain: 'open', force_type: 'concentric' },
  'lat-pulldown': { primary: 'pull', plane: 'sagittal', kinetic_chain: 'open', force_type: 'concentric' },
  
  // Squat patterns
  'squat': { primary: 'squat', plane: 'sagittal', kinetic_chain: 'closed', force_type: 'concentric' },
  'goblet-squat': { primary: 'squat', plane: 'sagittal', kinetic_chain: 'closed', force_type: 'concentric' },
  'front-squat': { primary: 'squat', plane: 'sagittal', kinetic_chain: 'closed', force_type: 'concentric' },
  'leg-press': { primary: 'squat', plane: 'sagittal', kinetic_chain: 'open', force_type: 'concentric' },
  
  // Hinge patterns
  'deadlift': { primary: 'hinge', plane: 'sagittal', kinetic_chain: 'closed', force_type: 'concentric' },
  'romanian-deadlift': { primary: 'hinge', plane: 'sagittal', kinetic_chain: 'closed', force_type: 'concentric' },
  'hip-thrust': { primary: 'hinge', plane: 'sagittal', kinetic_chain: 'closed', force_type: 'concentric' },
  'good-morning': { primary: 'hinge', plane: 'sagittal', kinetic_chain: 'closed', force_type: 'concentric' },
  
  // Lunge patterns
  'lunge': { primary: 'lunge', plane: 'sagittal', kinetic_chain: 'closed', force_type: 'concentric' },
  'step-up': { primary: 'lunge', plane: 'sagittal', kinetic_chain: 'closed', force_type: 'concentric' },
  'bulgarian-split-squat': { primary: 'lunge', plane: 'sagittal', kinetic_chain: 'closed', force_type: 'concentric' },
};

// Equipment compatibility matrix
const EQUIPMENT_COMPATIBILITY: Record<string, string[]> = {
  'barbell': ['smith-machine', 'safety-bar', 'trap-bar'],
  'dumbbell': ['kettlebell', 'cable', 'resistance-band'],
  'machine': ['cable', 'smith-machine'],
  'cable': ['resistance-band', 'machine'],
  'bodyweight': ['suspension-trainer', 'resistance-band'],
  'smith-machine': ['barbell', 'machine'],
  'kettlebell': ['dumbbell', 'cable']
};

export async function findAlternatives(
  exerciseId: string,
  equipmentCaps: EquipmentCapabilities,
  targetMuscles?: string[],
  constraints: ExerciseConstraints = {}
): Promise<ExerciseAlternative[]> {
  try {
    // Get the original exercise details
    const { data: originalExercise } = await supabase
      .from('exercises')
      .select(`
        id, name, slug, 
        primary_muscle_id,
        secondary_muscle_group_ids,
        equipment_id,
        equipment(slug),
        body_part_id
      `)
      .eq('id', exerciseId)
      .single();

    if (!originalExercise) {
      throw new Error('Original exercise not found');
    }

    // Get potential alternatives
    const { data: potentialAlternatives } = await supabase
      .from('exercises')
      .select(`
        id, name, slug,
        primary_muscle_id,
        secondary_muscle_group_ids, 
        equipment_id,
        equipment(slug),
        body_part_id,
        popularity_rank
      `)
      .eq('is_public', true)
      .neq('id', exerciseId)
      .not('id', 'in', `(${constraints.excludeExerciseIds?.join(',') || 'null'})`)
      .limit(50);

    if (!potentialAlternatives?.length) {
      return [];
    }

    // Score and filter alternatives
    const scoredAlternatives: ExerciseAlternative[] = [];

    for (const alternative of potentialAlternatives) {
      const score = calculateMatchScore(originalExercise, alternative, targetMuscles);
      
      // Must have at least 40% match to be considered
      if (score.total < 40) continue;

      // Check equipment availability
      if (!isEquipmentAvailable(alternative.equipment?.slug, equipmentCaps)) continue;

      // Apply constraints
      if (!meetsConstraints(alternative, constraints)) continue;

      scoredAlternatives.push({
        exerciseId: alternative.id,
        name: alternative.name,
        slug: alternative.slug,
        matchScore: score.total,
        matchReasons: score.reasons,
      equipment: alternative.equipment ? {
        id: alternative.equipment_id || 'unknown',
        slug: alternative.equipment.slug
      } : undefined,
        movementPattern: inferMovementPattern(alternative.slug)?.primary
      });
    }

    // Sort by match score and popularity
    return scoredAlternatives
      .sort((a, b) => {
        // Primary sort by match score
        if (Math.abs(a.matchScore - b.matchScore) > 5) {
          return b.matchScore - a.matchScore;
        }
        // Secondary sort by name for consistency
        return a.name.localeCompare(b.name);
      })
      .slice(0, 10); // Return top 10 alternatives

  } catch (error) {
    console.error('Failed to find alternatives:', error);
    return [];
  }
}

function calculateMatchScore(
  original: any, 
  alternative: any, 
  targetMuscles?: string[]
): { total: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  // Primary muscle match (40% weight)
  if (original.primary_muscle_id === alternative.primary_muscle_id) {
    score += 40;
    reasons.push('Same primary muscle');
  } else if (targetMuscles?.includes(alternative.primary_muscle_id)) {
    score += 25;
    reasons.push('Targets same muscle group');
  }

  // Secondary muscle overlap (20% weight)
  const originalSecondary = original.secondary_muscle_group_ids || [];
  const alternativeSecondary = alternative.secondary_muscle_group_ids || [];
  const secondaryOverlap = originalSecondary.filter((m: string) => 
    alternativeSecondary.includes(m)
  ).length;
  
  if (secondaryOverlap > 0) {
    score += Math.min(20, secondaryOverlap * 7);
    reasons.push(`${secondaryOverlap} shared secondary muscle${secondaryOverlap > 1 ? 's' : ''}`);
  }

  // Movement pattern match (25% weight)
  const originalPattern = inferMovementPattern(original.slug);
  const alternativePattern = inferMovementPattern(alternative.slug);
  
  if (originalPattern && alternativePattern) {
    if (originalPattern.primary === alternativePattern.primary) {
      score += 25;
      reasons.push('Same movement pattern');
    } else if (originalPattern.kinetic_chain === alternativePattern.kinetic_chain) {
      score += 12;
      reasons.push('Similar movement mechanics');
    }
  }

  // Equipment compatibility (15% weight)
  const originalEquipment = original.equipment?.slug;
  const alternativeEquipment = alternative.equipment?.slug;
  
  if (originalEquipment === alternativeEquipment) {
    score += 15;
    reasons.push('Same equipment');
  } else if (originalEquipment && alternativeEquipment) {
    const compatible = EQUIPMENT_COMPATIBILITY[originalEquipment]?.includes(alternativeEquipment) ||
                     EQUIPMENT_COMPATIBILITY[alternativeEquipment]?.includes(originalEquipment);
    if (compatible) {
      score += 8;
      reasons.push('Compatible equipment');
    }
  }

  return { total: Math.round(score), reasons };
}

function inferMovementPattern(exerciseSlug: string): Partial<MovementPattern> | null {
  // Direct match first
  if (MOVEMENT_PATTERNS[exerciseSlug]) {
    return MOVEMENT_PATTERNS[exerciseSlug];
  }

  // Pattern matching
  for (const [pattern, movement] of Object.entries(MOVEMENT_PATTERNS)) {
    if (exerciseSlug.includes(pattern) || pattern.includes(exerciseSlug.split('-')[0])) {
      return movement;
    }
  }

  // Fallback based on exercise name keywords
  const slug = exerciseSlug.toLowerCase();
  if (slug.includes('press') || slug.includes('push')) {
    return { primary: 'push', plane: 'sagittal' };
  } else if (slug.includes('pull') || slug.includes('row')) {
    return { primary: 'pull', plane: 'sagittal' };
  } else if (slug.includes('squat')) {
    return { primary: 'squat', plane: 'sagittal' };
  } else if (slug.includes('deadlift') || slug.includes('hip')) {
    return { primary: 'hinge', plane: 'sagittal' };
  } else if (slug.includes('lunge') || slug.includes('step')) {
    return { primary: 'lunge', plane: 'sagittal' };
  }

  return null;
}

function isEquipmentAvailable(equipmentSlug?: string, equipmentCaps?: EquipmentCapabilities): boolean {
  if (!equipmentSlug || equipmentSlug === 'bodyweight') return true;
  if (!equipmentCaps) return false;

  if (equipmentSlug.includes('barbell') || equipmentSlug.includes('bar')) {
    return equipmentCaps.bars.available;
  } else if (equipmentSlug.includes('dumbbell')) {
    return equipmentCaps.dumbbells.available;
  } else if (equipmentSlug.includes('machine') || equipmentSlug.includes('smith')) {
    return equipmentCaps.machines.available;
  } else if (equipmentSlug.includes('cable')) {
    return equipmentCaps.cables.available;
  }

  return true; // Unknown equipment types are assumed available
}

function meetsConstraints(exercise: any, constraints: ExerciseConstraints): boolean {
  // Check injury avoidance
  if (constraints.avoidInjuries?.length && exercise.body_part_id) {
    if (constraints.avoidInjuries.includes(exercise.body_part_id)) {
      return false;
    }
  }

  // Check preferred equipment
  if (constraints.preferredEquipment?.length) {
    const exerciseEquipment = exercise.equipment?.slug;
    if (exerciseEquipment && !constraints.preferredEquipment.includes(exerciseEquipment)) {
      return false;
    }
  }

  return true;
}

// Save user exercise preference - using template_exercises table for now
export async function saveExercisePreference(
  userId: string,
  templateId: string,
  originalExerciseId: string,
  preferredExerciseId: string
): Promise<void> {
  // For now, we'll store preferences as notes in template_exercises
  // This is a simplified approach until we have a dedicated preferences table
  
  const { error } = await supabase
    .from('template_exercises')
    .update({
      notes: `User prefers ${preferredExerciseId} over ${originalExerciseId}`,
      updated_at: new Date().toISOString()
    })
    .eq('template_id', templateId)
    .eq('exercise_id', originalExerciseId);

  if (error) {
    throw new Error(`Failed to save exercise preference: ${error.message}`);
  }
}

// Get user exercise preferences - simplified approach
export async function getUserExercisePreferences(
  userId: string,
  templateId?: string
): Promise<Record<string, string>> {
  // For now, return empty preferences since we're using notes field
  // In a real implementation, we'd parse the notes or use a dedicated table
  
  const preferences: Record<string, string> = {};
  
  try {
    const query = supabase
      .from('template_exercises')
      .select('exercise_id, notes, template_id');

    if (templateId) {
      query.eq('template_id', templateId);
    }

    const { data } = await query;

    // Parse preferences from notes (simplified)
    data?.forEach(item => {
      if (item.notes?.includes('User prefers')) {
        // This is a simplified parser - in reality you'd want more robust parsing
        const match = item.notes.match(/User prefers (\S+) over (\S+)/);
        if (match) {
          preferences[match[2]] = match[1]; // original -> preferred
        }
      }
    });

  } catch (error) {
    console.warn('Failed to fetch exercise preferences:', error);
  }

  return preferences;
}