import { supabase } from '@/integrations/supabase/client';

export type WeightUnit = 'kg' | 'lb';

export interface PlateProfile {
  unit: WeightUnit;
  barbell_weight: number;
  ezbar_weight: number;
  fixedbar_weight: number;
  sides: number[];
  micro: number[];
}

export interface EquipmentProfile {
  plates: PlateProfile;
  dumbbells: number[];
  stacks: {
    steps: number[];
    aux: number[];
  };
}

// Fetch effective equipment profile for a gym
export const fetchEffectivePlates = async (
  gymId?: string,
  unit: WeightUnit = 'kg'
): Promise<PlateProfile | null> => {
  if (!gymId) return null;

  const { data, error } = await supabase.rpc('get_effective_plate_profile', {
    _gym_id: gymId,
    _unit: unit
  });

  if (error) {
    console.error('Error fetching effective plates:', error);
    return null;
  }

  return data as unknown as PlateProfile;
};

// Save gym plate profile
export const saveGymPlateProfile = async (
  gymId: string,
  unit: WeightUnit,
  profile: {
    bar: number;
    ez: number;
    fixed: number;
    sides: number[];
    micro: number[];
  }
) => {
  const { error } = await supabase.rpc('upsert_gym_plate_profile', {
    _gym_id: gymId,
    _unit: unit,
    _bar: profile.bar,
    _ez: profile.ez,
    _fixed: profile.fixed,
    _sides: profile.sides,
    _micro: profile.micro
  });

  if (error) throw error;
};

// Save gym dumbbell sets
export const saveGymDumbbells = async (
  gymId: string,
  unit: WeightUnit,
  pairs: number[]
) => {
  const { error } = await supabase.rpc('upsert_gym_dumbbell_sets', {
    _gym_id: gymId,
    _unit: unit,
    _pairs: pairs
  });

  if (error) throw error;
};

// Save gym stack steps
export const saveGymStackSteps = async (
  gymId: string,
  machineId: string,
  unit: WeightUnit,
  steps: number[],
  aux: number[]
) => {
  const { error } = await supabase.rpc('upsert_gym_stack_steps', {
    _gym_id: gymId,
    _machine_id: machineId,
    _unit: unit,
    _steps: steps,
    _aux: aux
  });

  if (error) throw error;
};

// Fetch global equipment defaults
export const fetchGlobalDefaults = async () => {
  const [platesRes, dumbbellsRes, barsRes, stacksRes] = await Promise.all([
    supabase.from('plate_profiles').select('*').eq('is_active', true),
    supabase.from('dumbbell_sets').select('*').eq('is_active', true),
    supabase.from('fixed_bars').select('*').eq('is_active', true),
    supabase.from('stack_profiles').select('*').eq('is_active', true)
  ]);

  return {
    plates: platesRes.data || [],
    dumbbells: dumbbellsRes.data || [],
    bars: barsRes.data || [],
    stacks: stacksRes.data || []
  };
};

// Save global plate profile
export const saveGlobalPlateProfile = async (profile: {
  name: string;
  default_unit: WeightUnit;
  plates: { weight_kg: number; display_order: number }[];
}) => {
  const { data: plateProfile, error: profileError } = await supabase
    .from('plate_profiles')
    .insert({
      name: profile.name,
      default_unit: profile.default_unit,
      notes: 'Global default'
    })
    .select()
    .single();

  if (profileError) throw profileError;

  const { error: platesError } = await supabase
    .from('plate_profile_plates')
    .insert(
      profile.plates.map(p => ({
        profile_id: plateProfile.id,
        weight_kg: p.weight_kg,
        display_order: p.display_order
      }))
    );

  if (platesError) throw platesError;
};