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
const ImprovedWorkoutSession: React.FC<ImprovedWorkoutSessionProps> = (props) => {
  console.warn('🚨 DEPRECATED: ImprovedWorkoutSession wrapper used - update to EnhancedWorkoutSession');
  
  // Step 2: Pass-through to EnhancedWorkoutSession (unified flow)
  const { EnhancedWorkoutSession } = require('@/features/workouts/components/EnhancedWorkoutSession');
  return <EnhancedWorkoutSession source="improved-wrapper" {...props} />;
};

export default ImprovedWorkoutSession;