// src/features/health/fitness/workouts/components/SetList.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import WorkoutSetsBlock from './WorkoutSetsBlock';

interface SetListProps {
  exercises?: any[];
  onUpdateSet?: (setId: string, data: any) => void;
  workoutExerciseId?: string;
  targetReps?: number;
  targetWeightKg?: number;
  unit?: "kg" | "lb";
  sets?: any[];
  onSetsChanged?: () => Promise<void>;
}

const SetList: React.FC<SetListProps> = ({ exercises, onUpdateSet, sets, workoutExerciseId, targetReps, targetWeightKg, unit, onSetsChanged }) => {
  
  const handleAddFirstSet = async () => {
    if (!workoutExerciseId) return;
    
    try {
      const { error } = await supabase.rpc('log_workout_set', {
        p_workout_exercise_id: workoutExerciseId,
        p_set_index: 1,
        p_metrics: {
          weight: targetWeightKg || 60,
          reps: targetReps || 10
        }
      });
      
      if (!error && onSetsChanged) {
        await onSetsChanged();
      }
    } catch (err) {
      console.error('Failed to add first set:', err);
    }
  };

  // Handle direct sets prop
  if (sets !== undefined && workoutExerciseId) {
    // If no sets, show "Add Set 1" button
    if (!sets.length) {
      return (
        <div className="p-4">
          <Button onClick={handleAddFirstSet} className="w-full">
            + Add Set 1
          </Button>
        </div>
      );
    }
    
    return (
      <div>
        <WorkoutSetsBlock
          sets={sets}
          onComplete={(setId) => onUpdateSet?.(setId, {})}
          onEdit={(setId) => onUpdateSet?.(setId, {})}
        />
      </div>
    );
  }

  // Handle exercises array
  if (!exercises || exercises.length === 0) {
    return null;
  }

  return (
    <div>
      {exercises.map((exercise) => (
        <WorkoutSetsBlock
          key={exercise.id}
          sets={exercise.sets}
          onComplete={(setId) => onUpdateSet(setId, {})}
          onEdit={(setId) => onUpdateSet(setId, {})}
        />
      ))}
    </div>
  );
};

export default SetList;