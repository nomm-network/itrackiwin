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

  switch (feel) {
    case '++': 
      weight = Math.max(0, weight + stepKg); 
      break;
    case '+':  
      reps = Math.max(1, (lastReps ?? reps) + 1); 
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

  return { weight, reps };
}
