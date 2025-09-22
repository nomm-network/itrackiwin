import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UnilateralSetData } from '../types/warmup-unified';

interface UseUnilateralSetsOptions {
  workoutExerciseId: string;
  onSetCompleted?: () => void;
}

export const useUnilateralSets = ({ workoutExerciseId, onSetCompleted }: UseUnilateralSetsOptions) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logSet = useCallback(async (setIndex: number, setData: UnilateralSetData) => {
    setIsLoading(true);
    setError(null);

    try {
      const { error: insertError } = await supabase
        .from('workout_sets')
        .insert({
          workout_exercise_id: workoutExerciseId,
          set_index: setIndex,
          side: setData.side,
          weight: setData.weight,
          reps: setData.reps,
          is_completed: true,
          completed_at: new Date().toISOString()
        });

      if (insertError) throw insertError;

      onSetCompleted?.();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to log set';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [workoutExerciseId, onSetCompleted]);

  const updateSet = useCallback(async (setId: string, setData: UnilateralSetData) => {
    setIsLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('workout_sets')
        .update({
          side: setData.side,
          weight: setData.weight,
          reps: setData.reps,
          completed_at: new Date().toISOString()
        })
        .eq('id', setId);

      if (updateError) throw updateError;

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update set';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    logSet,
    updateSet,
    isLoading,
    error
  };
};