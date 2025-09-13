// src/features/workouts/targets/computeTargetV3.ts
// Single source of truth for target calculation (V3)

///////////////////////
// Types & contracts //
///////////////////////

export type WeightUnit = 'kg' | 'lb';
export type LoadType = 'dual_load' | 'single_load' | 'stack';
export type EntryMode = 'per_side' | 'total'; // UI toggle

export interface LastPerformance {
  prevWeightKg?: number;        // working-set total weight (kg)
  prevReps?: number;
  prevDateISO?: string;
  prevFeel?: 'too_little' | 'excellent' | 'too_much' | null; // from emoji
}

export interface ReadinessContext {
  todayScore0to100: number;     // 0–100 UI score
  lastScore0to100?: number;     // optional (for "delta vs last time")
}

export interface SafetyPrefs {
  // upper/lower rails to stop runaway targets
  maxPctUpPerSession?: number;     // e.g. 6 (%)
  maxPctDownPerSession?: number;   // e.g. 10 (%)
  minWorkingReps?: number;         // e.g. 5
  maxWorkingReps?: number;         // e.g. 20
}

export interface EquipmentContext {
  exerciseId: string;
  equipmentRefId?: string | null;  // resolved equipment UUID (barbell, etc.)
  gymId?: string | null;
  userDisplayUnit?: WeightUnit;    // for formatting only
  loadType: LoadType;              // from exercise
  entryMode: EntryMode;            // user toggle (per_side / total)
}

export interface IntentHints {
  targetRepGoal?: number;          // plan's rep prescription
  microProgressionPct?: number;    // e.g. +1.5% baseline nudged each session
}

export interface ComputeTargetV3Input {
  last: LastPerformance;
  readiness: ReadinessContext;
  safety?: SafetyPrefs;
  equipment: EquipmentContext;
  intent?: IntentHints;
}

export interface TargetSuggestion {
  totalWeightKg: number;       // final resolved target (kg, includes bar if barbell)
  perSideKg?: number;          // for dual_load + per_side entry display
  reps: number;
  unitDisplay: WeightUnit;     // mirrors EquipmentContext.userDisplayUnit or 'kg'
  notes?: string;              // short UX hint ("snapped to 97.5 kg")
}

export interface ComputeTargetV3Result {
  target: TargetSuggestion;
  stages: {
    baseline: StageSnapshot;
    readiness: StageSnapshot;
    safety: StageSnapshot;
    equipment: StageSnapshot & {
      snappedFromKg?: number;
      residualKg?: number;
      implement?: string;      // "barbell", "machine-stack", …
      barWeightKg?: number;
      plateRecipe?: { perSide: number[] } | null;
    };
  };
  debug: DebugBundle;
}

export interface StageSnapshot {
  weightKg: number;
  reps: number;
  reason: string;
}

export interface DebugBundle {
  input: ComputeTargetV3Input;
  lastPerfNormalized: { weightKg?: number; reps?: number };
  readiness: {
    today: number; last?: number; delta?: number;
    strengthMultiplier: number;      // applied scalar
    repBias: number;                  // +/− reps from readiness
  };
  rails: {
    maxUpPct: number; maxDownPct: number;
    clampedFromKg?: number;
  };
  equipment: {
    entryMode: EntryMode;
    loadType: LoadType;
    equipmentRefId?: string | null;
    usedV2Resolver: boolean;
  };
  decisions: string[];               // ordered log of choices
}

///////////////////////////
// Public API (one call) //
///////////////////////////

export async function computeTargetV3(input: ComputeTargetV3Input): Promise<ComputeTargetV3Result> {
  const decisions: string[] = [];

  // 1) Baseline (progression without readiness/equipment)
  const baseline = stage1_baseline(input, decisions);

  // 2) Readiness modulation
  const afterReadiness = stage2_readiness(input, baseline, decisions);

  // 3) Safety rails (clamps)
  const afterSafety = stage3_safety(input, afterReadiness, decisions);

  // 4) Equipment snapping (plates/stacks, bar math, dual-load per-side)
  const afterEquipment = await stage4_equipment(input, afterSafety, decisions);

  // 5) Assemble final debug
  const debug = stage5_debug(input, baseline, afterReadiness, afterSafety, afterEquipment, decisions);

  const unit = input.equipment.userDisplayUnit ?? 'kg';
  const perSideKg =
    input.equipment.loadType === 'dual_load'
      ? afterEquipment.weightKgPerSide ?? afterEquipment.weightKg / 2
      : undefined;

  return {
    target: {
      totalWeightKg: afterEquipment.weightKg,
      perSideKg,
      reps: afterEquipment.reps,
      unitDisplay: unit,
      notes: afterEquipment.note,
    },
    stages: {
      baseline: toStage(baseline),
      readiness: toStage(afterReadiness),
      safety: toStage(afterSafety),
      equipment: {
        ...toStage(afterEquipment),
        snappedFromKg: afterEquipment.snappedFromKg,
        residualKg: afterEquipment.residualKg,
        implement: afterEquipment.implement,
        barWeightKg: afterEquipment.barWeightKg,
        plateRecipe: afterEquipment.plateRecipe ?? null,
      },
    },
    debug,
  };
}

/////////////////////////
// Stage implementations
/////////////////////////

type Working = { weightKg: number; reps: number; reason: string };

// Stage 1 — Baseline (progress a bit on top of last performance)
function stage1_baseline(input: ComputeTargetV3Input, decisions: string[]): Working {
  const { last, intent } = input;

  // sensible defaults if no history
  const baseReps = intent?.targetRepGoal ?? Math.max(8, last.prevReps ?? 8);
  const micro = intent?.microProgressionPct ?? 1.0; // +1% by default
  const lastW = last.prevWeightKg ?? 0;

  let w = lastW > 0 ? lastW * (1 + micro / 100) : seedWeightForNewLifter(input);
  let r = clamp(baseReps, 5, 20);

  // "feel" nudges (legacy behavior collapsed into baseline)
  if (last.prevFeel === 'too_little') { w *= 1.02; decisions.push('Baseline: +2% (prev feel too little)'); }
  if (last.prevFeel === 'too_much')  { w *= 0.98; decisions.push('Baseline: −2% (prev feel too much)'); }

  const reason = last.prevWeightKg
    ? `Progressed ${micro}% from last ${last.prevWeightKg.toFixed(1)}kg`
    : 'No history — seeded starter load';

  return { weightKg: round1(w), reps: r, reason };
}

// Stage 2 — Readiness (scale by readiness score + bias reps)
function stage2_readiness(input: ComputeTargetV3Input, prev: Working, decisions: string[]): Working {
  const { readiness } = input;
  const s = clamp(readiness.todayScore0to100, 0, 100);

  // map readiness (0..100) → multiplier ~ [−7%, +6%] around 50
  // and a small rep bias (−2..+1)
  const strengthMult = lerp(-0.07, +0.06, s / 100);
  const repBias = Math.round(lerp(-2, +1, (s - 40) / 60)); // <40 cuts reps faster

  const w = prev.weightKg * (1 + strengthMult);
  const r = clamp(prev.reps + repBias, 3, 20);

  decisions.push(`Readiness: score=${s}, mult=${(strengthMult*100).toFixed(1)}%, repBias=${repBias}`);

  return { weightKg: round1(w), reps: r, reason: 'Readiness-adjusted' };
}

// Stage 3 — Safety rails (clamp delta vs last session)
function stage3_safety(input: ComputeTargetV3Input, prev: Working, decisions: string[]): Working {
  const rails: Required<SafetyPrefs> = {
    maxPctUpPerSession: input.safety?.maxPctUpPerSession ?? 6,
    maxPctDownPerSession: input.safety?.maxPctDownPerSession ?? 12,
    minWorkingReps: input.safety?.minWorkingReps ?? 5,
    maxWorkingReps: input.safety?.maxWorkingReps ?? 20,
  };

  let w = prev.weightKg;
  const base = input.last.prevWeightKg ?? w;

  const upLimit = base * (1 + rails.maxPctUpPerSession / 100);
  const downLimit = base * (1 - rails.maxPctDownPerSession / 100);

  let clampedFrom: number | undefined;
  if (w > upLimit)   { clampedFrom = w; w = upLimit; decisions.push(`Safety: clamped down to +${rails.maxPctUpPerSession}%`); }
  if (w < downLimit) { clampedFrom = w; w = downLimit; decisions.push(`Safety: clamped up to −${rails.maxPctDownPerSession}%`); }

  const r = clamp(prev.reps, rails.minWorkingReps, rails.maxWorkingReps);
  return { weightKg: round1(w), reps: r, reason: 'Safety rails applied' };
}

// Stage 4 — Equipment snapping & dual-load math
async function stage4_equipment(input: ComputeTargetV3Input, prev: Working, decisions: string[]) {
  const { equipment } = input;

  // Resolve with your v2 resolver (plates/stacks/bar math).
  // Replace this stub with your actual helper (it should accept desired total kg).
  const desiredTotalKg = prev.weightKg;

  const resolved = await resolveAchievableLoadV2({
    exerciseId: equipment.exerciseId,
    desiredKg: desiredTotalKg,
    gymId: equipment.gymId ?? undefined,
  });

  const usedV2 = !!resolved;
  if (usedV2) {
    decisions.push(`Equipment: snapped ${round1(desiredTotalKg)} → ${round1(resolved.totalKg)} kg (${resolved.implement})`);
  } else {
    decisions.push(`Equipment: fallback (no resolver) at ${round1(desiredTotalKg)} kg`);
  }

  const finalTotalKg = usedV2 ? resolved.totalKg : desiredTotalKg;
  const perSide = equipment.loadType === 'dual_load' ? finalTotalKg / 2 : undefined;

  return {
    weightKg: round1(finalTotalKg),
    reps: prev.reps,
    reason: usedV2 ? 'Snapped to achievable equipment load' : 'No snapping available',
    note: usedV2 ? `Snapped from ${round1(desiredTotalKg)}kg` : undefined,
    // debug extras:
    snappedFromKg: usedV2 ? desiredTotalKg : undefined,
    residualKg: usedV2 ? round1(resolved.residualKg ?? 0) : undefined,
    implement: usedV2 ? resolved.implement : undefined,
    barWeightKg: usedV2 ? resolved.details?.barWeight : undefined,
    plateRecipe: usedV2 && resolved.details?.perSidePlates ? { perSide: resolved.details.perSidePlates } : undefined,
    weightKgPerSide: perSide,
  };
}

// Stage 5 — Assemble debug
function stage5_debug(
  input: ComputeTargetV3Input,
  baseline: Working,
  rdy: Working,
  safe: Working,
  equip: any,
  decisions: string[]
): DebugBundle {
  const today = clamp(input.readiness.todayScore0to100, 0, 100);
  const last = input.readiness.lastScore0to100;
  const delta = last != null ? today - last : undefined;

  // replicate multiplier/bias for transparency
  const strengthMultiplier = lerp(-0.07, +0.06, today / 100);
  const repBias = Math.round(lerp(-2, +1, (today - 40) / 60));

  return {
    input,
    lastPerfNormalized: { weightKg: input.last.prevWeightKg, reps: input.last.prevReps },
    readiness: { today, last, delta, strengthMultiplier, repBias },
    rails: {
      maxUpPct: input.safety?.maxPctUpPerSession ?? 6,
      maxDownPct: input.safety?.maxPctDownPerSession ?? 12,
      clampedFromKg: safe.reason.includes('Safety') ? baseline.weightKg : undefined,
    },
    equipment: {
      entryMode: input.equipment.entryMode,
      loadType: input.equipment.loadType,
      equipmentRefId: input.equipment.equipmentRefId ?? null,
      usedV2Resolver: !!equip.implement,
    },
    decisions,
  };
}

/////////////////////
// Helper utilities
/////////////////////

function seedWeightForNewLifter(input: ComputeTargetV3Input): number {
  // Very conservative seed so equipment snapping will pull it to a real value
  // You can improve this with 1RM estimates or user profile.
  const isDual = input.equipment.loadType === 'dual_load';
  return isDual ? 30 : 20;
}

function clamp(n: number, min: number, max: number) { return Math.max(min, Math.min(max, n)); }
function round1(n: number) { return Math.round(n * 10) / 10; }
function lerp(a: number, b: number, t: number) { return a + (b - a) * clamp(t, 0, 1); }

function toStage(w: Working): StageSnapshot {
  return { weightKg: w.weightKg, reps: w.reps, reason: w.reason };
}

//////////////////////////////
// External integration stubs
//////////////////////////////

// Replace with your existing v2 resolver import.
// Contract expected by this file:
type ResolverResult = {
  implement: 'barbell' | 'machine-stack' | 'dumbbell' | string;
  totalKg: number;                       // snapped total
  residualKg?: number;                   // desired - snapped
  details?: {
    barWeight?: number;                  // if barbell
    perSidePlates?: number[];            // if plates
    unit?: WeightUnit;
  };
};

// Wire to: src/lib/equipment/resolveLoad.ts (your v1/v2 switch already exists)
async function resolveAchievableLoadV2(params: {
  exerciseId: string;
  desiredKg: number;
  gymId?: string;
}): Promise<ResolverResult> {
  // ---- IMPLEMENTATION HOOK ----
  // return await resolveAchievableLoad(params.exerciseId, params.desiredKg, params.gymId);
  // For skeleton purposes, echo the desired number:
  return {
    implement: 'barbell',
    totalKg: round1(params.desiredKg), // no snap here; your resolver will change it
    residualKg: 0,
    details: { barWeight: 20, perSidePlates: [], unit: 'kg' },
  };
}