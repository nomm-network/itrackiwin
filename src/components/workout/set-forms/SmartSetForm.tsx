// wf-step1: SmartSetForm router (safe, no DB changes)
import React from 'react';
import BodyweightSetForm from './bodyweight/BodyweightSetForm';
import CardioSetForm from './cardio/CardioSetForm';

// 👉 IMPORTANT: keep using YOUR existing weight form (don't change its UI).
// Update this import to point at your current "Weight x Reps" set form:
import WeightRepsSetForm from './WeightRepsSetForm'; // adjust path if needed

/**
 * Minimal types we read from your workout query.
 * Keep these lenient so this file compiles on v106 without touching your query types.
 */
export type EffortMode = 'reps' | 'time' | 'distance' | 'calories' | null | undefined;
export type LoadMode =
  | 'none'
  | 'bodyweight_plus_optional'
  | 'external_added'
  | 'external_assist'
  | 'machine_level'
  | null
  | undefined;

export interface SmartSetFormProps {
  workoutExerciseId: string;  // Required by existing forms
  exercise: any;              // must contain exercise.effort_mode & exercise.load_mode
  setIndex: number;           // 1-based
  onLogged: () => void;       // Required by existing forms
  onCancel?: () => void;      // optional cancel handler
  className?: string;         // optional styling
  // We pass everything else through so your current form keeps working
  [key: string]: any;
}

// Decide which form we should render
function resolveForm(
  effort_mode: EffortMode,
  load_mode: LoadMode
): 'weight' | 'bodyweight' | 'cardio' {
  // Cardio first
  if (effort_mode === 'time' || effort_mode === 'distance' || effort_mode === 'calories') {
    return 'cardio';
  }

  // Reps-based → decide by load_mode
  switch (load_mode) {
    case 'bodyweight_plus_optional':
    case 'external_assist': // assist is bodyweight with negative values
      return 'bodyweight';
    // external_added, machine_level, none → normal weight x reps (your current UI)
    default:
      return 'weight';
  }
}

const SmartSetForm: React.FC<SmartSetFormProps> = (props) => {
  const { exercise } = props;
  const effort: EffortMode = exercise?.exercise?.effort_mode ?? exercise?.effort_mode ?? 'reps';
  const load: LoadMode   = exercise?.exercise?.load_mode   ?? exercise?.load_mode   ?? 'none';

  const kind = resolveForm(effort, load);

  // Tiny debug tag so you can confirm the new router is being used
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__WF_STEP__ = 'wf-step1-smart-router';
    }
  }, []);

  // Create wrapper to bridge interface differences for new forms
  const bodyweightProps = {
    ...props,
    onSubmit: async (payload: any) => {
      // Here we would bridge to your existing logging system
      // For now, just call onLogged to keep existing flow
      props.onLogged();
    }
  };

  const cardioProps = {
    ...props,
    onSubmit: async (payload: any) => {
      // Here we would bridge to your existing logging system
      // For now, just call onLogged to keep existing flow  
      props.onLogged();
    }
  };

  if (kind === 'bodyweight') {
    return <BodyweightSetForm {...bodyweightProps} />;
  }
  if (kind === 'cardio') {
    return <CardioSetForm {...cardioProps} />;
  }
  // Default: keep using your current weight x reps UI
  return <WeightRepsSetForm {...props} />;
};

export default SmartSetForm;
