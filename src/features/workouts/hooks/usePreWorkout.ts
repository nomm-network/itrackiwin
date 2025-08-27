import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ExerciseEstimate {
  exerciseId: string;
  type: 'rm10' | 'rm5' | 'rm1' | 'bodyweight';
  estimatedWeight: number;
  estimatedReps?: number;
  confidenceLevel: 'low' | 'medium' | 'high';
  notes?: string;
}

interface ReadinessData {
  energy: number;
  sleep_quality: number;
  sleep_hours: number;
  soreness: number;
  stress: number;
  illness: boolean;
  alcohol: boolean;
  supplements: string[];
  notes?: string;
}

interface UsePreWorkoutOptions {
  workoutId?: string;
  userId: string;
}

export const usePreWorkout = ({ workoutId, userId }: UsePreWorkoutOptions) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveReadinessData = useCallback(async (data: ReadinessData) => {
    if (!workoutId) {
      throw new Error('Workout ID is required');
    }

    setIsLoading(true);
    setError(null);

    try {
      // For now, store readiness data in the workout notes or use a simple approach
      // We'll enhance this when the workout_checkins table is properly typed
      const { error: updateError } = await supabase
        .from('workouts')
        .update({
          notes: JSON.stringify({
            readiness: data,
            updated_at: new Date().toISOString()
          })
        })
        .eq('id', workoutId)
        .eq('user_id', userId);

      if (updateError) throw updateError;

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save readiness data';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [workoutId, userId]);

  const saveExerciseEstimate = useCallback(async (estimate: ExerciseEstimate) => {
    setIsLoading(true);
    setError(null);

    try {
      const { error: insertError } = await supabase
        .from('user_exercise_estimates')
        .upsert({
          user_id: userId,
          exercise_id: estimate.exerciseId,
          type: estimate.type,
          estimated_weight: estimate.estimatedWeight,
          estimated_reps: estimate.estimatedReps,
          confidence_level: estimate.confidenceLevel,
          notes: estimate.notes
        });

      if (insertError) throw insertError;

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save exercise estimate';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const getExercisesWithoutHistory = useCallback(async (exerciseIds: string[]) => {
    setIsLoading(true);
    setError(null);

    try {
      // Get exercises that don't have any completed sets or estimates
      const { data: exercisesWithHistory, error: historyError } = await supabase
        .from('workout_sets')
        .select(`
          workout_exercises!inner(exercise_id)
        `)
        .in('workout_exercises.exercise_id', exerciseIds)
        .eq('is_completed', true)
        .not('weight', 'is', null);

      if (historyError) throw historyError;

      const exerciseIdsWithHistory = new Set(
        exercisesWithHistory?.map(s => s.workout_exercises.exercise_id) || []
      );

      // Get existing estimates
      const { data: estimates, error: estimatesError } = await supabase
        .from('user_exercise_estimates')
        .select('exercise_id')
        .eq('user_id', userId)
        .in('exercise_id', exerciseIds);

      if (estimatesError) throw estimatesError;

      const exerciseIdsWithEstimates = new Set(
        estimates?.map(e => e.exercise_id) || []
      );

      // Return exercises without history or estimates
      const exercisesNeedingEstimates = exerciseIds.filter(
        id => !exerciseIdsWithHistory.has(id) && !exerciseIdsWithEstimates.has(id)
      );

      return exercisesNeedingEstimates;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check exercise history';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const checkWorkoutReadiness = useCallback(async (workoutId: string) => {
    try {
      const { data, error } = await supabase
        .from('workouts')
        .select('notes')
        .eq('id', workoutId)
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      // Check if readiness data exists in notes
      try {
        const parsedNotes = JSON.parse(data.notes || '{}');
        return !!parsedNotes.readiness;
      } catch {
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check workout readiness';
      setError(errorMessage);
      return false;
    }
  }, [userId]);

  return {
    saveReadinessData,
    saveExerciseEstimate,
    getExercisesWithoutHistory,
    checkWorkoutReadiness,
    isLoading,
    error
  };
};