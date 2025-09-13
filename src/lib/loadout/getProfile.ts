import { supabase } from '@/integrations/supabase/client';
import type { PlateProfile, Unit } from './resolveLoadout';

// Get the *effective* profile for (gym_id, equipment_id) with gym override > default.
export async function getEffectivePlateProfile(gymId: string | null, equipmentId: string | null): Promise<PlateProfile | null> {
  try {
    // Get default equipment profile based on equipment type
    let profile: PlateProfile = {
      unit: 'kg',
      barWeight: 20,
      perSidePlates: [25, 20, 15, 10, 5, 2.5, 1.25],
      microPlates: [1.0, 0.5],
      stackSteps: [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100],
      stackAddOns: [1.25, 2.5],
      dumbbellSet: [2.5, 5, 7.5, 10, 12.5, 15, 17.5, 20, 22.5, 25, 27.5, 30, 32.5, 35, 37.5, 40, 42.5, 45, 47.5, 50],
      fixedBars: [7.5, 10, 12.5, 15, 17.5, 20, 22.5, 25]
    };

    // If we have a gym ID, try to get gym-specific overrides from existing tables
    if (gymId) {
      // Try to get plate profiles from existing plate_profiles table
      const { data: plateProfile } = await supabase
        .from('plate_profiles')
        .select('*')
        .eq('is_active', true)
        .maybeSingle();

      if (plateProfile) {
        // Get plate items - assuming we have plate_profile_plates table
        const { data: plateItems } = await supabase
          .from('plate_profile_plates')
          .select('weight_kg')
          .eq('profile_id', plateProfile.id)
          .order('weight_kg', { ascending: false });

        if (plateItems?.length) {
          profile.perSidePlates = plateItems.map(item => item.weight_kg);
        }
      }

      // Try to get dumbbell sets from existing dumbbell_sets table
      const { data: dumbbellSet } = await supabase
        .from('dumbbell_sets')
        .select('*')
        .eq('is_active', true)
        .maybeSingle();

      if (dumbbellSet) {
        // Generate dumbbell weights from min/max/step
        const weights = [];
        for (let w = dumbbellSet.min_kg; w <= dumbbellSet.max_kg; w += dumbbellSet.step_kg) {
          weights.push(w);
        }
        profile.dumbbellSet = weights;
      }
    }

    // If equipment ID is provided, get equipment-specific defaults
    if (equipmentId) {
      const { data: equipment } = await supabase
        .from('equipment')
        .select(`
          load_type,
          default_bar_weight_kg,
          default_stack,
          default_side_min_plate_kg
        `)
        .eq('id', equipmentId)
        .maybeSingle();

      if (equipment) {
        if (equipment.default_bar_weight_kg) {
          profile.barWeight = equipment.default_bar_weight_kg;
        }
        
        if (equipment.default_stack && Array.isArray(equipment.default_stack)) {
          profile.stackSteps = equipment.default_stack as number[];
        }
      }
    }

    return profile;
  } catch (error) {
    console.error('Error fetching effective plate profile:', error);
    return null;
  }
}

// Helper to get current user's gym context
export async function getCurrentGymContext(): Promise<{ gymId: string | null; userUnit: Unit }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { gymId: null, userUnit: 'kg' };

    // Get user's default gym
    const { data: defaultGym } = await supabase
      .from('user_gyms')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_default', true)
      .maybeSingle();

    return {
      gymId: defaultGym?.id || null,
      userUnit: 'kg' // Would get from user preferences
    };
  } catch (error) {
    console.error('Error getting gym context:', error);
    return { gymId: null, userUnit: 'kg' };
  }
}