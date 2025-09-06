// ============================================================================
// TARGET COMPUTATION ENGINE - Pure functions for progression
// Rule: Calculations live in logic/ so FlutterFlow or Edge Functions can reuse them
// ============================================================================

export type Feel = '--' | '-' | '=' | '+' | '++';
export type LoadingMode = 'dual_plates' | 'stack' | 'fixed';

export interface LastSetData {
  weight: number;
  reps: number;
  feel: Feel;
}

export interface TemplateTarget {
  repMin: number;
  repMax: number;
}

export interface SafeguardContext {
  pain: boolean;
  sickDay: boolean;
}

export interface TargetInput {
  last: LastSetData | null;
  template: TemplateTarget;
  equipmentStepKg: number;
  gymLoadingMode: LoadingMode;
  guard: SafeguardContext;
}

export interface TargetOutput {
  weight: number;
  reps: number;
  note: string;
}

// ============================================================================
// CORE TARGET COMPUTATION
// ============================================================================

export function computeTarget(input: TargetInput): TargetOutput {
  const { last, template, equipmentStepKg, gymLoadingMode, guard } = input;
  
  // Safety first - if sick or in pain, suggest deload
  if (guard.pain || guard.sickDay) {
    const baseWeight = last?.weight || 40;
    return {
      weight: roundToEquipmentStep(baseWeight * 0.8, equipmentStepKg),
      reps: Math.max(template.repMin, 8),
      note: guard.pain ? 'Deload due to pain - listen to your body' : 'Deload due to illness - recover first'
    };
  }
  
  // No previous data - use conservative start
  if (!last) {
    return {
      weight: roundToEquipmentStep(40, equipmentStepKg),
      reps: template.repMin,
      note: 'Starting weight - adjust as needed'
    };
  }
  
  // Progressive overload based on feel
  const progression = getProgressionFromFeel(last.feel);
  let newWeight = last.weight;
  let newReps = last.reps;
  let note = '';
  
  switch (progression.type) {
    case 'increase_weight':
      newWeight = last.weight + progression.amount;
      newReps = Math.max(template.repMin, last.reps - 1); // Drop reps slightly with weight increase
      note = `Progressive overload: +${progression.amount}kg`;
      break;
      
    case 'increase_reps':
      newWeight = last.weight;
      newReps = Math.min(template.repMax, last.reps + progression.amount);
      note = `Progressive overload: +${progression.amount} reps`;
      break;
      
    case 'maintain':
      newWeight = last.weight;
      newReps = last.reps;
      note = 'Maintaining current load';
      break;
      
    case 'deload':
      newWeight = last.weight * 0.9;
      newReps = Math.max(template.repMin, last.reps);
      note = 'Deload - too challenging last time';
      break;
  }
  
  // Round to equipment constraints
  newWeight = roundToEquipmentStep(newWeight, equipmentStepKg);
  
  // Validate rep range
  if (newReps < template.repMin) newReps = template.repMin;
  if (newReps > template.repMax) newReps = template.repMax;
  
  return {
    weight: newWeight,
    reps: newReps,
    note
  };
}

// ============================================================================
// FEEL-TO-PROGRESSION MAPPING
// ============================================================================

interface ProgressionAction {
  type: 'increase_weight' | 'increase_reps' | 'maintain' | 'deload';
  amount: number;
}

function getProgressionFromFeel(feel: Feel): ProgressionAction {
  switch (feel) {
    case '++': // Very easy - big jump
      return { type: 'increase_weight', amount: 5 };
    case '+': // Easy - moderate increase
      return { type: 'increase_weight', amount: 2.5 };
    case '=': // Just right - small progression
      return { type: 'increase_reps', amount: 1 };
    case '-': // Hard - maintain
      return { type: 'maintain', amount: 0 };
    case '--': // Very hard/failed - deload
      return { type: 'deload', amount: 0 };
    default:
      return { type: 'maintain', amount: 0 };
  }
}

// ============================================================================
// EQUIPMENT CONSTRAINTS
// ============================================================================

function roundToEquipmentStep(weight: number, stepKg: number): number {
  // Round to nearest step size
  return Math.round(weight / stepKg) * stepKg;
}

export function getEquipmentStepSize(loadingMode: LoadingMode, equipmentData?: any): number {
  switch (loadingMode) {
    case 'dual_plates':
      // Standard barbell with plates - 2.5kg increments (2 x 1.25kg plates)
      return 2.5;
    case 'stack':
      // Cable machine stack - typically 5kg increments
      return equipmentData?.stackIncrementKg || 5;
    case 'fixed':
      // Fixed weight dumbbells - varies by gym
      return equipmentData?.fixedIncrementKg || 2;
    default:
      return 2.5;
  }
}

// ============================================================================
// REP RANGE OPTIMIZATION
// ============================================================================

export function optimizeRepRange(current: { weight: number; reps: number }, template: TemplateTarget, feel: Feel): TargetOutput {
  // If current reps are outside template range, adjust towards range
  if (current.reps < template.repMin) {
    return {
      weight: current.weight * 0.9, // Reduce weight to hit more reps
      reps: template.repMin,
      note: 'Reducing weight to hit target rep range'
    };
  }
  
  if (current.reps > template.repMax) {
    return {
      weight: current.weight * 1.1, // Increase weight to reduce reps
      reps: template.repMax,
      note: 'Increasing weight to stay in target rep range'
    };
  }
  
  // Within range - use standard progression
  return computeTarget({
    last: { ...current, feel },
    template,
    equipmentStepKg: 2.5,
    gymLoadingMode: 'dual_plates',
    guard: { pain: false, sickDay: false }
  });
}

// ============================================================================
// WARMUP COMPUTATION
// ============================================================================

export interface WarmupSet {
  setIndex: number;
  weight: number;
  reps: number;
  restSeconds: number;
}

export function computeWarmup(workingWeight: number, equipmentStep: number = 2.5): WarmupSet[] {
  const warmupSets: WarmupSet[] = [];
  
  // 3-set warmup progression: 40%, 60%, 80% of working weight
  const percentages = [0.4, 0.6, 0.8];
  const reps = [12, 9, 6];
  
  percentages.forEach((percentage, index) => {
    const weight = roundToEquipmentStep(workingWeight * percentage, equipmentStep);
    warmupSets.push({
      setIndex: index + 1,
      weight: Math.max(weight, equipmentStep), // Minimum one step
      reps: reps[index],
      restSeconds: 45
    });
  });
  
  return warmupSets;
}