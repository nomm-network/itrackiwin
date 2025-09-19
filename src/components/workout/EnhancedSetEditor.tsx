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

// DEPRECATED: Step 3 pass-through to SmartSetForm (will be removed after unification)
export const EnhancedSetEditor: React.FC<EnhancedSetEditorProps> = ({
  workoutExerciseId,
  exercise,
  setIndex,
  onLogged,
  className
}) => {
  console.warn('🚨 DEPRECATED: EnhancedSetEditor used - update to SmartSetForm directly');
  
  // Step 3: Convert and pass-through to SmartSetForm
  const smartFormExercise: Exercise = {
    id: exercise.id || workoutExerciseId,
    effort_mode: exercise.effort_mode || 'reps',
    load_mode: exercise.load_mode || 'external_added',
    equipment: {
      equipment_type: exercise.equipment?.equipment_type,
      slug: exercise.equipment?.slug || exercise.equipment_ref
    }
  };
  
  return (
    <SmartSetForm
      workoutExerciseId={workoutExerciseId}
      exercise={smartFormExercise}
      setIndex={setIndex}
      onLogged={onLogged}
      className={className}
    />
  );
};

export default EnhancedSetEditor;