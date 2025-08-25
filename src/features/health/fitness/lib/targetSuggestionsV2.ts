import { Feel } from './feelToRpe';

export interface LastSet {
  weight: number;        // total kg
  reps: number;
  feel?: Feel | null;    // from your feel component; fallback via RPE mapping if you still parse old data
  hadPain?: boolean;
  notes?: string;
  rpe?: number;
}

export interface Range { 
  repMin: number; 
  repMax: number; 
}

export interface EquipmentCtx {
  isUnilateral: boolean;           // e.g., barbell = false, plate‑loaded Hammer Strength press = true
  barWeightKg?: number | null;     // 20 for oly bar, null for stack machines
  plateIncrementKg: number;        // 1.25, 2.5 etc (one side)
  stackIncrementKg: number;        // 2.5 or 5 on stacks; ignored if not a stack
  isStack: boolean;                // true for pulley stacks
  preferSideEntry: boolean;        // your UI mode; one‑side entry
}

export interface UserCtx {
  badDay: boolean;                  // from preworkout_checkins
  cyclePhase?: 'low'|'neutral'|'high'; // 'low' during period/late luteal
}

export interface TargetOut {
  weight: number;  // total kg
  reps: number;
  rationale: string[];
}

export function suggestTargetV2(
  last: LastSet | null,
  range: Range,
  eq: EquipmentCtx,
  user: UserCtx
): TargetOut {
  const notes: string[] = [];
  const r = (msg: string) => notes.push(msg);

  // If no history, start at template or 0; UI should preload a reasonable value
  if (!last) {
    r('no-history: use template baseline');
    return { weight: 0, reps: range.repMin, rationale: notes };
  }

  const feel: Feel = last.feel ?? '=';
  const MIN = range.repMin, MAX = range.repMax;
  const isLowPhase = user.cyclePhase === 'low';
  const conservative = user.badDay || last.hadPain || isLowPhase;

  // Step calculation
  const step = eq.isStack ? eq.stackIncrementKg
            : (eq.isUnilateral ? eq.plateIncrementKg * 2 : eq.plateIncrementKg);
  let weight = last.weight;
  let reps   = last.reps;

  if (conservative) {
    r('conservative-mode (pain/bad-day/low-phase)');
    if (feel === '--') { 
      reps = Math.max(MIN, reps - 1); 
      r('reduce reps slightly'); 
    }
    return { weight, reps, rationale: notes };
  }

  // If not at top, push reps up towards MAX
  if (reps < MAX) {
    if (feel === '--') { 
      r('too hard: hold until reaching capacity'); 
    } else { 
      reps = reps + 1; 
      r('below range top: +1 rep'); 
    }
    return { weight, reps, rationale: notes };
  }

  // At or above top of range: consider weight bump
  if (reps >= MAX) {
    if (feel === '--') {
      reps = Math.max(MIN, reps - 1);
      r('top but too hard: hold weight, -1 rep');
      return { weight, reps, rationale: notes };
    }
    // forgiving bump even on '-' if user still at top
    weight = Math.max(0, weight + step);
    reps = MIN;
    r(`top reached: +${step}kg, reset reps to ${MIN}`);
  }

  // Bonus: large overachievement → micro extra step
  if (last.reps >= MAX + 2 && feel !== '--') {
    const extra = step; // cap to one extra step
    weight += extra;
    r(`overachieved by 2+: extra +${extra}kg`);
  }

  return { weight, reps, rationale: notes };
}

// Helper function to fetch cycle phase
export async function fetchCyclePhase(userId: string): Promise<'low'|'neutral'|'high'> {
  // This would be implemented with Supabase client
  // For now, return neutral as default
  return 'neutral';
}

// Helper function to get default rep ranges by focus
export function getDefaultRepRange(focus?: string): Range {
  switch (focus) {
    case 'strength': return { repMin: 3, repMax: 6 };
    case 'hypertrophy': return { repMin: 8, repMax: 12 };
    case 'endurance': return { repMin: 12, repMax: 20 };
    default: return { repMin: 6, repMax: 10 }; // general
  }
}