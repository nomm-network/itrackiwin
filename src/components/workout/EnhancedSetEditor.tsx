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

/**
 * Enhanced Set Editor that replaces the old SetEditor with smart form routing
 * Automatically detects exercise type and shows appropriate UI
 */
export const EnhancedSetEditor: React.FC<EnhancedSetEditorProps> = ({
  workoutExerciseId,
  exercise,
  setIndex,
  onLogged,
  className = ""
}) => {
  // Function to detect load mode from equipment
  function detectLoadMode(exercise: any): 'none' | 'bodyweight_plus_optional' | 'external_added' | 'external_assist' | 'machine_level' | 'band_level' {
    const equipmentSlug = exercise.equipment?.slug || exercise.equipment_ref;
    
    // Detect bodyweight exercises
    if (equipmentSlug === 'dip-bars' || 
        equipmentSlug === 'pull-up-bar' || 
        equipmentSlug === 'bodyweight' ||
        exercise.equipment?.equipment_type === 'bodyweight') {
      return 'bodyweight_plus_optional';
    }
    
    // Default to external added for weight training
    return 'external_added';
  }

  // Convert exercise data to match our SmartSetForm interface
  const smartFormExercise: Exercise = {
    id: exercise.id || workoutExerciseId,
    effort_mode: exercise.effort_mode || 'reps', // Default to reps for most exercises
    load_mode: exercise.load_mode || detectLoadMode(exercise), // Detect load mode from equipment
    equipment: {
      equipment_type: exercise.equipment?.equipment_type,
      slug: exercise.equipment?.slug || exercise.equipment_ref
    }
  };

  // Determine exercise type for badge display
  const getExerciseTypeInfo = () => {
    const { load_mode, equipment } = smartFormExercise;
    const equipmentSlug = equipment?.slug;

    if (load_mode === 'bodyweight_plus_optional' || 
        equipmentSlug === 'bodyweight' || 
        equipmentSlug === 'dip-bars' || 
        equipmentSlug === 'pull-up-bar') {
      return {
        icon: <User className="h-4 w-4" />,
        label: 'Bodyweight',
        variant: 'secondary' as const,
        description: 'Bodyweight + optional weight'
      };
    }

    if (smartFormExercise.effort_mode === 'time' || 
        smartFormExercise.effort_mode === 'distance' || 
        smartFormExercise.effort_mode === 'calories') {
      return {
        icon: <Activity className="h-4 w-4" />,
        label: 'Cardio',
        variant: 'outline' as const,
        description: 'Time, distance or calorie based'
      };
    }

    return {
      icon: <Dumbbell className="h-4 w-4" />,
      label: 'Weight Training',
      variant: 'default' as const,
      description: 'Weight × reps'
    };
  };

  console.log('🎯 EnhancedSetEditor Debug:', {
    exerciseId: exercise.id,
    equipmentSlug: exercise.equipment?.slug || exercise.equipment_ref,
    detectedLoadMode: smartFormExercise.load_mode,
    exerciseType: getExerciseTypeInfo().label
  });


  const typeInfo = getExerciseTypeInfo();

  return (
    <div className={`space-y-4 ${className}`}>

      {/* Smart Set Form */}
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