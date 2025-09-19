import React from 'react';
import { EnhancedSetEditor } from '@/components/workout/EnhancedSetEditor';

interface ImprovedWorkoutSessionProps {
  exercise: {
    id: string;
    workout_exercise_id: string;
    name: string;
    target_sets: number;
    completed_sets: any[];
    load_type?: string;
    equipment_ref?: string;
    load_mode?: string;
    effort_mode?: string;
    equipment_id?: string;
    attribute_values_json?: {
      bodyweight_involvement_pct?: number;
      [key: string]: any;
    };
  };
  userId?: string;
  exerciseId?: string;
  templateTargetReps?: number;
  templateTargetWeight?: number;
  isLastExercise?: boolean;
  onSetComplete?: (setData: any) => void;
  onExerciseComplete?: () => void;
  onFinishWorkout?: () => void;
  onAddExtraSet?: () => void;
  onUpdateSet?: (setIndex: number, setData: any) => void;
  unit?: string;
}

// DEPRECATED: flattened in v0.5.0. Safe to delete after 2 releases.
/**
 * Step 3: Simple pass-through to EnhancedSetEditor (will be removed in next step)
 */
const ImprovedWorkoutSession: React.FC<ImprovedWorkoutSessionProps> = ({
  exercise,
  onSetComplete
}) => {
  console.log('⚠️ WARNING: Using deprecated ImprovedWorkoutSession - rogue router detected');
  
  // Step 3: Simple pass-through to EnhancedSetEditor (will be removed in next step)
  return (
    <EnhancedSetEditor
      workoutExerciseId={exercise.workout_exercise_id}
      exercise={{
        id: exercise.id,
        effort_mode: (exercise.effort_mode as 'reps' | 'time' | 'distance' | 'calories') || 'reps',
        load_mode: (exercise.load_mode as 'none' | 'bodyweight_plus_optional' | 'external_added' | 'external_assist' | 'machine_level' | 'band_level') || 'external_added',
        equipment_id: exercise.equipment_id,
        equipment_ref: exercise.equipment_ref,
        equipment: {
          slug: exercise.equipment_ref,
          equipment_type: undefined
        }
      }}
      setIndex={0} // Will be properly managed in EnhancedWorkoutSession
      onLogged={onSetComplete ? () => onSetComplete({}) : () => {}}
    />
  );
};

export default ImprovedWorkoutSession;