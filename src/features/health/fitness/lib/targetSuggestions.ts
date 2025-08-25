import { Feel, FEEL_TO_RPE } from './feelToRpe';

export function parseFeelFromNotes(notes?: string | null): Feel | undefined {
  if (!notes) return undefined;
  const feelMatch = notes.match(/Feel:\s*(\+\+|\+|=|--|-)/i);
  return feelMatch?.[1] as Feel || undefined;
}

export function parseFeelFromRPE(rpe?: number | null): Feel | undefined {
  if (!rpe) return undefined;
  if (rpe >= 9.5) return '--';
  if (rpe >= 8.5) return '-';
  if (rpe >= 7.5) return '=';
  if (rpe >= 6.5) return '+';
  return '++';
}

export interface TargetSuggestionOptions {
  lastWeight?: number | null;
  lastReps?: number | null;
  feel?: Feel;
  templateTargetReps?: number | null;
  templateTargetWeight?: number | null;
  stepKg?: number;
}

export function suggestTarget(options: TargetSuggestionOptions) {
  const {
    lastWeight,
    lastReps,
    feel,
    templateTargetReps,
    templateTargetWeight,
    stepKg = 2.5
  } = options;

  // Base weight to start from
  let weight = lastWeight ?? templateTargetWeight ?? 0;
  let reps = templateTargetReps ?? lastReps ?? 10;

  // Enhanced logic with rep ranges (using simple default range for now)
  const repMin = Math.max(1, Math.floor((templateTargetReps ?? 10) * 0.8)); // 80% of target as min
  const repMax = Math.ceil((templateTargetReps ?? 10) * 1.2); // 120% of target as max

  // If we have previous data, use progressive logic
  if (lastWeight && lastReps) {
    // If below max reps, try to increase reps first
    if (lastReps < repMax) {
      switch (feel) {
        case '++': 
          reps = Math.min(repMax, lastReps + 2);
          break;
        case '+':  
          reps = Math.min(repMax, lastReps + 1);
          break;
        case '=':  
          reps = Math.min(repMax, lastReps + 1);
          break;
        case '-':  
          reps = lastReps; // hold reps
          break;
        case '--': 
          reps = Math.max(repMin, lastReps - 1);
          break;
        default:
          reps = Math.min(repMax, lastReps + 1);
      }
      weight = lastWeight; // keep same weight when building reps
    } else {
      // At or above max reps, consider weight increase
      switch (feel) {
        case '++': 
          weight = Math.max(0, lastWeight + stepKg * 1.5); // bigger jump for very easy
          reps = repMin;
          break;
        case '+':  
        case '=':
          weight = Math.max(0, lastWeight + stepKg);
          reps = repMin;
          break;
        case '-':  
          // Still allow progression if at top of range, but smaller
          weight = Math.max(0, lastWeight + stepKg * 0.5);
          reps = repMin;
          break;
        case '--': 
          weight = lastWeight; // hold weight
          reps = Math.max(repMin, lastReps - 1);
          break;
        default:
          weight = Math.max(0, lastWeight + stepKg);
          reps = repMin;
      }
    }
  } else {
    // No previous data, use template/fallback logic
    switch (feel) {
      case '++': 
        weight = Math.max(0, weight + stepKg); 
        break;
      case '+':  
        reps = Math.max(1, reps + 1); 
        break;
      case '=':  
        // Keep same
        break;
      case '-':  
        weight = Math.max(0, weight - stepKg); 
        break;
      case '--': 
        weight = Math.max(0, weight - stepKg * 2); 
        break;
      default:
        // If no feel but last reps >> target, nudge up a bit
        if (lastReps && templateTargetReps && lastReps >= templateTargetReps + 2) {
          weight = Math.max(0, weight + stepKg);
        }
    }
  }

  return { weight, reps };
}
