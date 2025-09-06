export type LoadingMode = 'plates_per_side' | 'single_stack' | 'fixed_pair' | 'fixed_single' | 'cable_stack';
export type EntryStyle = 'per_side' | 'total';
export type Side = 'left' | 'right' | 'both';

export interface GymEquipmentConfig {
  loading_mode: LoadingMode;
  is_symmetrical?: boolean;
  bar_weight_kg?: number | null;
  min_plate_kg?: number | null;
  has_micro_plates?: boolean;
  micro_plate_min_kg?: number | null;
  stack_increment_kg?: number | null;
  stack_has_magnet?: boolean;
  stack_micro_kg?: number | null;
  fixed_increment_kg?: number | null;
}

export interface LoadMetadata {
  entry_mode: EntryStyle;
  per_side?: number;
  bar_weight?: number;
}

export interface LoadBuildOptions {
  mode: EntryStyle;
  totalWeight?: number;
  perSide?: number;
  barWeight?: number;
}

/**
 * Calculate the smallest valid weight jump for given equipment
 */
export function smallestValidJumpKg(config: GymEquipmentConfig): number {
  switch (config.loading_mode) {
    case 'plates_per_side': {
      const base = config.min_plate_kg ?? 1.25;
      const micro = config.has_micro_plates ? (config.micro_plate_min_kg ?? 0.5) : null;
      const perSideStep = Math.min(base, micro ?? base);
      // Total increment = left + right
      return 2 * perSideStep;
    }
    case 'single_stack':
    case 'cable_stack': {
      const inc = config.stack_increment_kg ?? 2.5;
      const micro = config.stack_has_magnet ? (config.stack_micro_kg ?? 1.25) : null;
      return Math.min(inc, micro ?? inc);
    }
    case 'fixed_pair':
    case 'fixed_single': {
      return config.fixed_increment_kg ?? 2.5;
    }
    default:
      return 2.5;
  }
}

/**
 * Convert per-side entry to total display weight
 */
export function toTotalDisplayKg(
  entered: number,
  config: GymEquipmentConfig,
  entryStyle: EntryStyle
): number {
  if (entryStyle === 'total') return entered;
  if (config.loading_mode === 'plates_per_side') {
    const bar = config.bar_weight_kg ?? 20;
    return (entered * 2) + bar;
  }
  return entered; // Other modes already total
}

/**
 * Build load data for saving to database
 */
export function buildLoadForSave(options: LoadBuildOptions) {
  const { mode, totalWeight, perSide, barWeight = 0 } = options;
  
  if (mode === 'total') {
    const w = Number(totalWeight || 0);
    return {
      weight: w,
      load_meta: { entry_mode: 'total' } as LoadMetadata
    };
  }
  
  // per_side mode
  const ps = Number(perSide || 0);
  const bw = Number(barWeight || 0);
  const total = ps * 2 + bw;
  return {
    weight: total,
    load_meta: { 
      entry_mode: 'per_side', 
      per_side: ps, 
      bar_weight: bw 
    } as LoadMetadata
  };
}

/**
 * Format set display with both per-side and total when relevant
 */
export function formatSetDisplay(set: {
  weight: number;
  load_meta?: LoadMetadata | Record<string, any>;
  reps?: number;
  side?: string;
}): string {
  const { weight, load_meta, reps = 0, side } = set;
  const m = (load_meta || {}) as any;

  if (m.entry_mode === 'per_side' && m.per_side != null) {
    const per = Number(m.per_side);
    const bar = Number(m.bar_weight || 0);
    const baseDisplay = `${per}kg/side`;
    const barDisplay = bar ? ` + ${bar}kg bar` : '';
    const totalDisplay = ` → ${weight}kg`;
    const repsDisplay = ` × ${reps}`;
    return `${baseDisplay}${barDisplay}${totalDisplay}${repsDisplay}`;
  }

  const baseDisplay = `${weight}kg × ${reps}`;
  const sideDisplay = side && side !== 'both' ? ` (${side})` : '';
  return `${baseDisplay}${sideDisplay}`;
}

/**
 * Calculate next weight proposal based on last performance and feel
 */
export function nextWeightProposalKg(
  lastWeightKg: number,
  lastReps: number,
  targetReps: number,
  feel: '--' | '-' | 'ok' | '+' | '++',
  config: GymEquipmentConfig
): number {
  const step = smallestValidJumpKg(config);
  
  switch (feel) {
    case '++': 
      return lastReps >= targetReps ? lastWeightKg + (2 * step) : lastWeightKg + step;
    case '+':  
      return lastReps >= targetReps ? lastWeightKg + step : lastWeightKg;
    case 'ok':  
      return lastWeightKg;
    case '-':  
      return Math.max(0, lastWeightKg - step);
    case '--': 
      return Math.max(0, lastWeightKg - 2 * step);
    default:
      return lastWeightKg;
  }
}

/**
 * Snap weight to valid increments for the equipment
 */
export function snapToValidWeight(weight: number, config: GymEquipmentConfig): number {
  const step = smallestValidJumpKg(config);
  return Math.round(weight / step) * step;
}