import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useGripAwareWorkout = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createWorkoutExerciseWithGrip = useCallback(async (
    workoutExerciseData: {
      workout_id: string;
      exercise_id: string;
      order_index: number;
      grip_id?: string;
    }
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: insertError } = await supabase
        .from('workout_exercises')
        .insert({
          workout_id: workoutExerciseData.workout_id,
          exercise_id: workoutExerciseData.exercise_id,
          order_index: workoutExerciseData.order_index,
          grip_id: workoutExerciseData.grip_id,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create workout exercise with grip';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateWorkoutExerciseGrip = useCallback(async (
    workoutExerciseId: string,
    gripId?: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: updateError } = await supabase
        .from('workout_exercises')
        .update({ grip_id: gripId })
        .eq('id', workoutExerciseId)
        .select()
        .single();

      if (updateError) throw updateError;

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update workout exercise grip';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    createWorkoutExerciseWithGrip,
    updateWorkoutExerciseGrip,
    isLoading,
    error
  };
};