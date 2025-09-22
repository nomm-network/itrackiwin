// v108-SOT — DO NOT DUPLICATE
if (typeof window !== 'undefined') {
  console.log('[v108] Mounted: SmartSetForm');
}

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

export default function SmartSetForm({ exercise, workoutExerciseId, setIndex, onLogged, onCancel, className }: {
  exercise: any; workoutExerciseId: string; setIndex: number; onLogged: () => void; onCancel?: () => void; className?: string;
}) {
  const effort: EffortMode = exercise?.exercise?.effort_mode ?? exercise?.effort_mode ?? null;
  const load: LoadMode = exercise?.exercise?.load_mode ?? exercise?.load_mode ?? null;

  console.log('[v108] SmartSetForm.resolve', {
    exerciseId: exercise?.id,
    effort_mode: effort, load_mode: load,
    name: exercise?.display_name || exercise?.exercise?.display_name || exercise?.exercise?.name
  });

  // effort first (time/distance/calories => cardio form)
  if (effort === 'time' || effort === 'distance' || effort === 'calories') {
    return <CardioSetForm exercise={exercise} workoutExerciseId={workoutExerciseId} setIndex={setIndex} onLogged={onLogged} onCancel={onCancel} className={className} />;
  }

  // reps-based => choose by load_mode
  if (load === 'bodyweight_plus_optional' || load === 'external_assist') {
    return <BodyweightSetForm exercise={exercise} workoutExerciseId={workoutExerciseId} setIndex={setIndex} onLogged={onLogged} onCancel={onCancel} className={className} />;
  }

  // default
  return <WeightRepsSetForm exercise={exercise} workoutExerciseId={workoutExerciseId} setIndex={setIndex} onLogged={onLogged} onCancel={onCancel} className={className} />;
}

// removed duplicate export
