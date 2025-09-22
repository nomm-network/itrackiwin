// wf-step1: SmartSetForm router (safe, no DB changes)
import React from 'react';
import BodyweightSetForm from './BodyweightSetForm';
import CardioSetForm from './cardio/CardioSetForm';
import WeightRepsSetForm from './WeightRepsSetForm';

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
  workoutExerciseId: string;
  exercise: any;              // must contain exercise.effort_mode & exercise.load_mode
  setIndex: number;           // 1-based
  onLogged: () => void;
  onCancel?: () => void;
  className?: string;
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
  const { exercise, workoutExerciseId, setIndex, onLogged, onCancel, className } = props;
  
  // v108 — CONSOLE LOG TO DEBUG RECEIVED DATA
  if (typeof window !== 'undefined') {
    console.log('🎯 SmartSetForm v108 RECEIVED DATA:', {
      exerciseId: exercise?.exercise_id || exercise?.id,
      exerciseName: exercise?.exercise_name || exercise?.display_name || exercise?.exercise?.display_name || 'unknown',
      effort_mode_direct: exercise?.effort_mode,
      load_mode_direct: exercise?.load_mode,
      effort_mode_nested: exercise?.exercise?.effort_mode,
      load_mode_nested: exercise?.exercise?.load_mode,
      fullExerciseData: exercise,
    });
  }
  
  // Try multiple paths to find effort_mode and load_mode
  const effort: EffortMode = exercise?.exercise?.effort_mode ?? exercise?.effort_mode ?? 'reps';
  const load: LoadMode = exercise?.exercise?.load_mode ?? exercise?.load_mode ?? 'none';

  const kind = resolveForm(effort, load);

  // Set debug flag
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__WF_STEP__ = 'wf-step1-smart-router';
    }
  }, []);

  // Transform props for consistent interface across all forms
  const baseProps = {
    workoutExerciseId,
    exercise: exercise?.exercise || exercise, // flatten if nested
    setIndex,
    onLogged: () => {
      console.log('✅ Set logged successfully');
      onLogged?.();
    },
    onCancel,
    className
  };

  if (kind === 'bodyweight') {
    return <BodyweightSetForm {...baseProps} />;
  }
  if (kind === 'cardio') {
    return <CardioSetForm {...baseProps} />;
  }
  // Default: keep using your current weight x reps UI
  return <WeightRepsSetForm {...baseProps} />;
};

export default SmartSetForm;
