import { supabase } from '@/integrations/supabase/client';

export interface PlateItem {
  weight: number;
  unit: string;
  count_per_side: number;
}

export interface DumbbellItem {
  weight: number;
  unit: string;
}

export interface StackStep {
  step_weight: number;
  unit: string;
}

export async function fetchPlateItems(profileId: string): Promise<PlateItem[]> {
  if (!profileId) return [];
  
  try {
    const { data, error } = await supabase
      .from("plate_profile_plates")
      .select("weight_kg, display_order")
      .eq("profile_id", profileId)
      .order("weight_kg", { ascending: false });
      
    if (error) throw error;
    
    // Convert to expected format
    return (data || []).map(item => ({
      weight: item.weight_kg,
      unit: 'kg',
      count_per_side: 999 // Assume unlimited for now
    }));
  } catch (error) {
    console.error('Error fetching plate items:', error);
    return [];
  }
}

export async function fetchDumbbells(profileId: string): Promise<DumbbellItem[]> {
  if (!profileId) return [];
  
  try {
    // For now, generate standard dumbbell range since detailed profile system
    // is still being built
    const weights = [];
    for (let w = 2.5; w <= 50; w += 2.5) {
      weights.push({ weight: w, unit: 'kg' });
    }
    return weights;
  } catch (error) {
    console.error('Error fetching dumbbell items:', error);
    return [];
  }
}

export async function fetchStackSteps(profileId: string): Promise<StackStep[]> {
  if (!profileId) return [];
  
  try {
    // Generate standard stack steps
    const steps = [];
    for (let w = 5; w <= 120; w += 5) {
      steps.push({ step_weight: w, unit: 'kg' });
    }
    return steps;
  } catch (error) {
    console.error('Error fetching stack steps:', error);
    return [];
  }
}

export async function fetchBarWeight(exerciseId?: string, barType: string = 'barbell'): Promise<number> {
  // Default bar weights
  const defaults = {
    'barbell': 20,
    'ezbar': 7.5,
    'fixed': 20
  };
  
  return defaults[barType as keyof typeof defaults] || 20;
}