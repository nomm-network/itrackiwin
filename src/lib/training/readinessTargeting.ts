import { scaleByReadiness } from './readinessScaling';
import { WeightModel, closestBarbellWeightKg, closestMachineWeightKg, nextWeightStepKg } from '../equipment/gymWeightModel';

export interface TargetProposal {
  proposedKg: number;
  baselineKg: number;
  readinessScore: number;
  readinessMultiplier: number;
  minStepKg: number;
  rationale: string[];
  discreteSnap: {
    beforeKg: number;
    afterKg: number;
    achievable: boolean;
  };
}

/**
 * Enhanced readiness multiplier with more granular scaling
 */
export function readinessMultiplier(score0to100: number): number {
  const s = Math.max(0, Math.min(100, score0to100));
  
  if (s >= 85) return 1.03;  // Elite day
  if (s >= 70) return 1.015; // Good day - mild progression
  if (s >= 55) return 1.0;   // Normal day
  if (s >= 40) return 0.985; // Slightly off
  if (s >= 25) return 0.97;  // Poor day - reduce load
  return 0.94; // Very poor - significant reduction
}

/**
 * Propose target weight considering readiness and gym equipment constraints
 */
export function proposeTargetKg(
  lastKg: number | undefined,
  templateKg: number | undefined,
  score: number,
  model: WeightModel,
  barTypeKey: string = 'barbell',
  desiredMode: 'progress_weight' | 'progress_reps' | 'maintain' = 'progress_weight'
): TargetProposal {
  const rationale: string[] = [];
  
  // Establish baseline
  const baselineKg = lastKg ?? templateKg ?? 0;
  if (!lastKg && templateKg) {
    rationale.push('Using template baseline (no history)');
  } else if (lastKg) {
    rationale.push(`Previous performance: ${lastKg}kg`);
  } else {
    rationale.push('No baseline available');
  }
  
  // Apply readiness scaling
  const multiplier = readinessMultiplier(score);
  const scaledKg = baselineKg * multiplier;
  
  if (multiplier > 1.0) {
    rationale.push(`Readiness boost: +${((multiplier - 1) * 100).toFixed(1)}%`);
  } else if (multiplier < 1.0) {
    rationale.push(`Readiness reduction: ${((1 - multiplier) * 100).toFixed(1)}%`);
  }
  
  // Calculate minimum step size
  const minStepKg = nextWeightStepKg(
    'dual_load', // Most exercises are barbell-based
    Math.min(...model.platesKgPerSide.filter(p => p > 0)),
    model.singleMinIncrementKg
  );
  
  // Apply progression/conservation policy based on readiness bands
  let desiredKg = scaledKg;
  
  if (score >= 70 && desiredMode === 'progress_weight') {
    desiredKg += minStepKg;
    rationale.push(`High readiness: +${minStepKg}kg progression`);
  } else if (score < 25) {
    desiredKg = Math.max(0, scaledKg - minStepKg);
    rationale.push(`Low readiness: -${minStepKg}kg conservation`);
  } else if (score >= 25 && score < 70) {
    rationale.push('Moderate readiness: maintaining load');
  }
  
  // Snap to gym equipment constraints
  const barKg = model.barTypes[barTypeKey]?.barKg ?? 20;
  const beforeSnap = desiredKg;
  
  let afterSnap: number;
  let achievable = true;
  
  if (barTypeKey === 'stack' || barTypeKey === 'machine') {
    afterSnap = closestMachineWeightKg(
      [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80], // Default stack
      model.auxIncrementsKg || [],
      desiredKg
    );
  } else {
    const plateProfile = {
      unit: model.unit,
      sides: model.platesKgPerSide,
      micro: model.auxIncrementsKg || [],
      barbell_weight: barKg,
      ezbar_weight: model.barTypes.ezbar?.barKg || 7.5,
      fixedbar_weight: model.barTypes.fixed?.barKg || 20
    };
    const plateResult = closestBarbellWeightKg(
      plateProfile,
      desiredKg,
      barKg
    );
    afterSnap = plateResult.total_kg;
    
    // Check if we achieved a reasonable approximation
    if (Math.abs(plateResult.residual_kg) > minStepKg) {
      achievable = false;
      rationale.push(`⚠️ Limited by available plates (${Math.abs(plateResult.residual_kg).toFixed(1)}kg difference)`);
    }
  }
  
  if (Math.abs(afterSnap - beforeSnap) > 0.1) {
    rationale.push(`Snapped to achievable: ${beforeSnap.toFixed(1)}kg → ${afterSnap.toFixed(1)}kg`);
  }
  
  return {
    proposedKg: afterSnap,
    baselineKg,
    readinessScore: score,
    readinessMultiplier: multiplier,
    minStepKg,
    rationale,
    discreteSnap: {
      beforeKg: beforeSnap,
      afterKg: afterSnap,
      achievable
    }
  };
}

/**
 * Legacy compatibility wrapper for existing suggestTarget function
 */
export function enhancedSuggestTarget(params: {
  lastWeight?: number;
  lastReps?: number;
  feel?: string;
  templateTargetReps?: number;
  templateTargetWeight?: number;
  stepKg?: number;
  model?: WeightModel;
  readinessScore?: number;
}): { weight: number; reps: number; rationale?: string[] } {
  const {
    lastWeight,
    templateTargetWeight,
    model,
    readinessScore = 65,
    stepKg = 2.5
  } = params;
  
  if (!model) {
    // Fallback to original logic if no model provided
    return {
      weight: lastWeight ?? templateTargetWeight ?? 60,
      reps: params.templateTargetReps ?? 8
    };
  }
  
  const proposal = proposeTargetKg(
    lastWeight,
    templateTargetWeight,
    readinessScore,
    model
  );
  
  return {
    weight: proposal.proposedKg,
    reps: params.templateTargetReps ?? 8,
    rationale: proposal.rationale
  };
}