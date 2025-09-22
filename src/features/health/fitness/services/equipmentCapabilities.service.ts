import { supabase } from "@/integrations/supabase/client";

export interface EquipmentCapabilities {
  bars: {
    available: boolean;
    weights: number[]; // Available bar weights in kg
    defaultWeight: number;
  };
  plates: {
    available: boolean;
    weights: number[]; // Available plate weights in kg (pairs)
    miniweights: number[]; // Micro plates for fine adjustments
  };
  dumbbells: {
    available: boolean;
    weights: number[]; // Available dumbbell weights in kg
    increment: number; // Typical increment between weights
  };
  machines: {
    available: boolean;
    stacks: Record<string, {
      equipmentId: string;
      stackWeights: number[];
      auxWeights: number[];
      increment: number;
    }>;
  };
  cables: {
    available: boolean;
    increment: number; // Typical cable machine increment
  };
}

export async function getEquipmentCapabilities(userId: string): Promise<EquipmentCapabilities> {
  // Default capabilities (fallback)
  const defaultCapabilities: EquipmentCapabilities = {
    bars: { available: false, weights: [], defaultWeight: 20 },
    plates: { available: false, weights: [], miniweights: [] },
    dumbbells: { available: false, weights: [], increment: 2.5 },
    machines: { available: false, stacks: {} },
    cables: { available: false, increment: 5 }
  };

  try {
    // Get user's default gym
    const { data: userGym } = await supabase
      .from('user_gyms')
      .select('id, is_default')
      .eq('user_id', userId)
      .eq('is_default', true)
      .single();

    const gymId = userGym?.id;

    // Fetch user's personal equipment inventory
    const [
      { data: userDumbbells },
      { data: userPlates },
      { data: userBars },
      { data: userMachines },
      { data: userMiniweights }
    ] = await Promise.all([
      supabase.from('user_gym_dumbbells').select('weight').eq('user_gym_id', gymId || ''),
      supabase.from('user_gym_plates').select('weight').eq('user_gym_id', gymId || ''),
      supabase.from('user_gym_bars').select('bar_type_id, bar_types(default_weight)').eq('user_gym_id', gymId || ''),
      supabase.from('user_gym_machines').select('equipment_id, stack_values, aux_increment').eq('user_gym_id', gymId || ''),
      supabase.from('user_gym_miniweights').select('weight').eq('user_gym_id', gymId || '')
    ]);

    // Fetch public gym equipment (if gym is known)
    let publicEquipment: any = null;
    if (gymId) {
      const { data: gymEquipment } = await supabase
        .from('gym_equipment_availability')
        .select(`
          equipment_id,
          quantity,
          equipment(slug)
        `)
        .eq('gym_id', gymId)
        .eq('is_functional', true);

      // TODO: Fix after gym_machines table is properly defined
      const gymMachines: any[] = [];
      /*
      const { data: gymMachines } = await supabase
        .from('gym_machines')
        .select('equipment_id, stack_values, aux_increment, quantity')
        .eq('gym_id', gymId);
      */

      publicEquipment = { gymEquipment, gymMachines };
    }

    // Merge and build capabilities
    const capabilities: EquipmentCapabilities = {
      bars: buildBarCapabilities(userBars || []),
      plates: buildPlateCapabilities(userPlates || [], userMiniweights || []),
      dumbbells: buildDumbbellCapabilities(userDumbbells || []),
      machines: buildMachineCapabilities(userMachines || [], publicEquipment?.gymMachines || []),
      cables: buildCableCapabilities(publicEquipment?.gymEquipment || [])
    };

    return capabilities;
  } catch (error) {
    console.warn('Failed to fetch equipment capabilities:', error);
    return defaultCapabilities;
  }
}

function buildBarCapabilities(userBars: any[]): EquipmentCapabilities['bars'] {
  if (!userBars.length) {
    return { available: false, weights: [], defaultWeight: 20 };
  }

  const weights = userBars
    .map(bar => bar.bar_types?.default_weight)
    .filter(Boolean)
    .sort((a, b) => a - b);

  return {
    available: true,
    weights: [...new Set(weights)],
    defaultWeight: weights[0] || 20
  };
}

function buildPlateCapabilities(userPlates: any[], userMiniweights: any[]): EquipmentCapabilities['plates'] {
  const plateWeights = userPlates.map(p => p.weight).filter(Boolean).sort((a, b) => a - b);
  const miniWeights = userMiniweights.map(m => m.weight).filter(Boolean).sort((a, b) => a - b);

  return {
    available: plateWeights.length > 0,
    weights: [...new Set(plateWeights)],
    miniweights: [...new Set(miniWeights)]
  };
}

function buildDumbbellCapabilities(userDumbbells: any[]): EquipmentCapabilities['dumbbells'] {
  if (!userDumbbells.length) {
    return { available: false, weights: [], increment: 2.5 };
  }

  const weights = userDumbbells
    .map(d => d.weight)
    .filter(Boolean)
    .sort((a, b) => a - b);

  // Calculate typical increment
  const increments = weights.slice(1).map((w, i) => w - weights[i]);
  const avgIncrement = increments.length ? increments.reduce((a, b) => a + b) / increments.length : 2.5;

  return {
    available: true,
    weights: [...new Set(weights)],
    increment: Math.round(avgIncrement * 2) / 2 // Round to nearest 0.5
  };
}

function buildMachineCapabilities(
  userMachines: any[], 
  gymMachines: any[]
): EquipmentCapabilities['machines'] {
  const allMachines = [...userMachines, ...gymMachines];
  
  if (!allMachines.length) {
    return { available: false, stacks: {} };
  }

  const stacks: Record<string, any> = {};

  allMachines.forEach(machine => {
    const key = machine.equipment_id || `machine-${Object.keys(stacks).length}`;
    
    stacks[key] = {
      equipmentId: machine.equipment_id,
      stackWeights: machine.stack_values || [],
      auxWeights: [], // Could be expanded based on aux_increment
      increment: machine.aux_increment || 5
    };
  });

  return {
    available: true,
    stacks
  };
}

function buildCableCapabilities(gymEquipment: any[]): EquipmentCapabilities['cables'] {
  const hasCables = gymEquipment.some(eq => 
    eq.equipment?.slug?.includes('cable') || 
    eq.equipment?.slug?.includes('pulley')
  );

  return {
    available: hasCables,
    increment: 5 // Standard cable machine increment
  };
}

// Helper function to check if specific equipment is available
export function hasEquipment(capabilities: EquipmentCapabilities, equipmentType: string): boolean {
  switch (equipmentType.toLowerCase()) {
    case 'barbell':
    case 'bar':
      return capabilities.bars.available;
    case 'dumbbell':
    case 'dumbbells':
      return capabilities.dumbbells.available;
    case 'machine':
    case 'machines':
      return capabilities.machines.available;
    case 'cable':
    case 'cables':
      return capabilities.cables.available;
    default:
      return false;
  }
}

// Helper function to get available weights for equipment type
export function getAvailableWeights(capabilities: EquipmentCapabilities, equipmentType: string): number[] {
  switch (equipmentType.toLowerCase()) {
    case 'barbell':
    case 'bar':
      return capabilities.bars.weights;
    case 'dumbbell':
    case 'dumbbells':
      return capabilities.dumbbells.weights;
    case 'plates':
      return capabilities.plates.weights;
    default:
      return [];
  }
}