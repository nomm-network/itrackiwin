import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { User, Dumbbell, Activity } from 'lucide-react';
import SmartSetForm from '@/components/workout/set-forms/SmartSetForm';
import { Exercise } from '@/components/workout/set-forms/BaseSetForm';

interface EnhancedSetEditorProps {
  workoutExerciseId: string;
  exercise: {
    id?: string;
    load_type?: string;
    effort_mode?: 'reps' | 'time' | 'distance' | 'calories';
    load_mode?: 'none' | 'bodyweight_plus_optional' | 'external_added' | 'external_assist' | 'machine_level' | 'band_level';
    equipment_id?: string;
    equipment_ref?: string;
    equipment?: {
      slug?: string;
      equipment_type?: string;
    };
  };
  setIndex: number;
  onLogged: () => void;
  className?: string;
}

// DEPRECATED: flattened in v0.5.0. Safe to delete after 2 releases.
/**
 * Enhanced Set Editor - now just a pass-through to SmartSetForm
 * Step 2 of refactor: Remove detection logic, let SmartSetForm handle everything
 */
export const EnhancedSetEditor: React.FC<EnhancedSetEditorProps> = ({
  workoutExerciseId,
  exercise,
  setIndex,
  onLogged,
  className = ""
}) => {
  // Convert exercise data to match our SmartSetForm interface - no detection, just pass through
  const smartFormExercise: Exercise = {
    id: exercise.id || workoutExerciseId,
    effort_mode: exercise.effort_mode || 'reps',
    load_mode: exercise.load_mode || 'external_added',
    equipment: {
      equipment_type: exercise.equipment?.equipment_type,
      slug: exercise.equipment?.slug || exercise.equipment_ref
    }
  };

  console.log('🎯 EnhancedSetEditor Pass-Through v0.5.0:', {
    exerciseId: exercise.id,
    passedLoadMode: exercise.load_mode,
    passedEffortMode: exercise.effort_mode,
    equipmentId: exercise.equipment_id
  });

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Direct pass-through to SmartSetForm - no detection here */}
      <SmartSetForm
        workoutExerciseId={workoutExerciseId}
        exercise={smartFormExercise}
        setIndex={setIndex}
        onLogged={onLogged}
        className="space-y-4"
      />
    </div>
  );
};

export default EnhancedSetEditor;