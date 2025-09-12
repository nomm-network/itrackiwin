import { supabase } from "@/integrations/supabase/client";

export type EntryMode = 'per_side' | 'total';

export interface EquipmentProfile {
  barWeightKg?: number;
  entryModeDefault: EntryMode;
  plateProfileId?: string;
  equipmentSlug?: string;
}

export interface EnhancedLoadResult {
  implement: string;
  totalKg: number;
  perSideKg: number;
  barWeightKg: number;
  entryMode: EntryMode;
  plateProfileId?: string;
  residualKg: number;
  source: 'gym' | 'default' | 'fallback';
  achievable: boolean;
}

export async function fetchExerciseEquipProfile(
  exerciseId: string,
  gymId?: string
): Promise<EquipmentProfile> {
  try {
    // First try to get exercise equipment profile
    const { data: profile, error } = await supabase
      .from('exercise_equipment_profiles')
      .select('*')
      .eq('exercise_id', exerciseId)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.warn('Failed to fetch exercise equipment profile:', error);
    }

    if (profile) {
      return {
        barWeightKg: profile.default_bar_weight_kg || 0,
        entryModeDefault: (profile.default_entry_mode as EntryMode) || 'total',
        plateProfileId: profile.plate_profile_id || undefined,
        equipmentSlug: profile.equipment_slug
      };
    }

    // Fallback: try to get from exercise.equipment_ref_id
    const { data: exercise } = await supabase
      .from('exercises')
      .select('equipment_ref_id, load_type')
      .eq('id', exerciseId)
      .single();

    if (exercise?.equipment_ref_id) {
      const { data: equipment } = await supabase
        .from('equipment')
        .select('default_bar_weight_kg, slug')
        .eq('id', exercise.equipment_ref_id)
        .single();

      if (equipment) {
        return {
          barWeightKg: equipment.default_bar_weight_kg || 0,
          entryModeDefault: exercise.load_type === 'dual_load' ? 'per_side' : 'total',
          equipmentSlug: equipment.slug
        };
      }
    }

    // Final fallback
    return {
      barWeightKg: 20, // Standard Olympic bar
      entryModeDefault: 'per_side',
      equipmentSlug: 'olympic-barbell'
    };
  } catch (error) {
    console.error('Error fetching equipment profile:', error);
    return {
      barWeightKg: 20,
      entryModeDefault: 'per_side',
      equipmentSlug: 'olympic-barbell'
    };
  }
}

export async function snapToAvailablePlates(
  desiredTotalKg: number,
  plateProfileId?: string,
  gymId?: string,
  barWeightKg: number = 0
): Promise<{
  totalKg: number;
  implement: string;
  residualKg: number;
  achievable: boolean;
  source: 'gym' | 'default' | 'fallback';
}> {
  try {
    // For now, implement basic rounding to 2.5kg increments
    // This should be enhanced to use actual plate profiles
    const increment = 2.5;
    const targetWithoutBar = Math.max(0, desiredTotalKg - barWeightKg);
    const roundedWithoutBar = Math.round(targetWithoutBar / increment) * increment;
    const snappedTotal = barWeightKg + roundedWithoutBar;

    return {
      totalKg: snappedTotal,
      implement: 'barbell',
      residualKg: snappedTotal - desiredTotalKg,
      achievable: true,
      source: plateProfileId ? 'default' : 'fallback'
    };
  } catch (error) {
    console.error('Error snapping to plates:', error);
    return {
      totalKg: desiredTotalKg,
      implement: 'barbell',
      residualKg: 0,
      achievable: true,
      source: 'fallback'
    };
  }
}

export async function resolveAchievableLoadEnhanced(
  exerciseId: string,
  userDesiredKg: number,
  gymId?: string,
  forcedMode?: EntryMode
): Promise<EnhancedLoadResult> {
  try {
    const profile = await fetchExerciseEquipProfile(exerciseId, gymId);
    const entryMode: EntryMode = forcedMode ?? profile.entryModeDefault ?? 'total';
    const bar = profile.barWeightKg ?? 0;

    // Convert input to TOTAL for resolution
    const desiredTotalKg = entryMode === 'per_side' 
      ? bar + 2 * userDesiredKg
      : userDesiredKg;

    // Snap to available plates
    const snapped = await snapToAvailablePlates(desiredTotalKg, profile.plateProfileId, gymId, bar);

    // Compute derived per-side for display
    const perSide = Math.max(0, (snapped.totalKg - bar) / 2);

    return {
      implement: snapped.implement,
      totalKg: snapped.totalKg,
      perSideKg: perSide,
      barWeightKg: bar,
      entryMode,
      plateProfileId: profile.plateProfileId,
      residualKg: snapped.residualKg,
      source: snapped.source,
      achievable: snapped.achievable
    };
  } catch (error) {
    console.error('Error resolving load:', error);
    
    // Fallback result
    return {
      implement: 'barbell',
      totalKg: userDesiredKg,
      perSideKg: Math.max(0, (userDesiredKg - 20) / 2),
      barWeightKg: 20,
      entryMode: forcedMode ?? 'per_side',
      residualKg: 0,
      source: 'fallback',
      achievable: true
    };
  }
}