import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useHandleAwareWorkout = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createWorkoutExerciseWithHandle = useCallback(async (
    workoutExerciseData: {
      workout_id: string;
      exercise_id: string;
      order_index: number;
      handle_id?: string;
      grip_ids?: string[];
      grip_key?: string;
    }
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      // Compute grip_key if grip_ids provided
      let computed_grip_key = workoutExerciseData.grip_key;
      if (workoutExerciseData.grip_ids && workoutExerciseData.grip_ids.length > 0) {
        computed_grip_key = workoutExerciseData.grip_ids.slice().sort().join(',');
      }

      const { data, error: insertError } = await supabase
        .from('workout_exercises')
        .insert({
          workout_id: workoutExerciseData.workout_id,
          exercise_id: workoutExerciseData.exercise_id,
          order_index: workoutExerciseData.order_index,
          handle_id: workoutExerciseData.handle_id,
          grip_key: computed_grip_key
        })
        .select()
        .single();

      if (insertError) throw insertError;

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create workout exercise with handle';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateWorkoutExerciseHandle = useCallback(async (
    workoutExerciseId: string,
    handleId?: string,
    gripIds?: string[]
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      // Compute grip_key if grip_ids provided
      let grip_key: string | null = null;
      if (gripIds && gripIds.length > 0) {
        grip_key = gripIds.slice().sort().join(',');
      }

      const updateData: any = { handle_id: handleId };
      if (grip_key !== null) {
        updateData.grip_key = grip_key;
      }

      const { data, error: updateError } = await supabase
        .from('workout_exercises')
        .update(updateData)
        .eq('id', workoutExerciseId)
        .select()
        .single();

      if (updateError) throw updateError;

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update workout exercise handle';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    createWorkoutExerciseWithHandle,
    updateWorkoutExerciseHandle,
    isLoading,
    error
  };
};