import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WarmupPlan, WarmupFeedback } from '../types/warmup-unified';
import { useSmartWarmup } from './useSmartWarmup';
import { recommendedWarmupsFor, resetWarmupContext, noteWorkingSet } from '@/lib/training/warmupManager';

export const useWarmupManager = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getWarmupSetsCount } = useSmartWarmup();

  const recomputeWarmup = useCallback(async (opts: {
    workoutExerciseId: string;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      // Use the new database function to recalculate warmup
      const { error: rpcError } = await supabase
        .rpc('recalc_warmup_from_last_set', {
          p_workout_exercise_id: opts.workoutExerciseId
        });

      if (rpcError) throw rpcError;

      // Fetch the updated warmup plan
      const { data: workoutExercise, error: fetchError } = await supabase
        .from('workout_exercises')
        .select('warmup_plan')
        .eq('id', opts.workoutExerciseId)
        .single();

      if (fetchError) throw fetchError;

      return workoutExercise.warmup_plan as unknown as WarmupPlan;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to recompute warmup';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveFeedback = useCallback(async (opts: {
    workoutExerciseId: string;
    feedback: WarmupFeedback;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔍 useWarmupManager: Saving feedback:', opts);
      
      // Save feedback and trigger warmup recalculation
      const { error: updateError } = await supabase
        .from('workout_exercises')
        .update({
          warmup_feedback: opts.feedback,
          warmup_feedback_at: new Date().toISOString()
        })
        .eq('id', opts.workoutExerciseId);

      if (updateError) {
        console.error('❌ useWarmupManager: Update error:', updateError);
        throw updateError;
      }

      console.log('✅ useWarmupManager: Feedback saved successfully');

      // Recalculate warmup with new feedback
      await recomputeWarmup({ workoutExerciseId: opts.workoutExerciseId });

      return true;
    } catch (err) {
      console.error('❌ useWarmupManager: Error in saveFeedback:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to save warmup feedback';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [recomputeWarmup]);

  const getSmartWarmupSetsCount = useCallback(async (workoutExerciseId: string) => {
    try {
      console.log('🔥 useWarmupManager: Getting smart warmup sets count for:', workoutExerciseId);
      
      // Get exercise information for muscle group context
      const { data: workoutExercise, error: exerciseError } = await supabase
        .from('workout_exercises')
        .select(`
          exercise_id,
          exercises!inner(
            body_part_id,
            secondary_muscle_group_ids
          )
        `)
        .eq('id', workoutExerciseId)
        .single();

      if (exerciseError || !workoutExercise) {
        console.error('❌ useWarmupManager: Error getting exercise data:', exerciseError);
        return 3; // Fallback to default
      }

      const exercise = workoutExercise.exercises;
      const primaryGroup = exercise.body_part_id || '';
      const secondaryGroups = exercise.secondary_muscle_group_ids || [];

      // Use session context to determine warmup count
      const contextBasedCount = recommendedWarmupsFor(primaryGroup, secondaryGroups);
      
      console.log('✅ useWarmupManager: Context-based warmup sets count:', {
        workoutExerciseId,
        primaryGroup,
        secondaryGroups,
        contextBasedCount
      });
      
      return contextBasedCount;
    } catch (err) {
      console.error('❌ useWarmupManager: Error getting smart warmup count:', err);
      return 3; // Fallback to default
    }
  }, []);

  const resetSessionContext = useCallback(() => {
    console.log('🔄 useWarmupManager: Resetting warmup context for new session');
    resetWarmupContext();
  }, []);

  const logWorkingSet = useCallback(async (workoutExerciseId: string) => {
    try {
      console.log('📝 useWarmupManager: Logging working set for context:', workoutExerciseId);
      
      // Get exercise information for muscle group context
      const { data: workoutExercise, error: exerciseError } = await supabase
        .from('workout_exercises')
        .select(`
          exercise_id,
          exercises!inner(
            body_part_id,
            secondary_muscle_group_ids
          )
        `)
        .eq('id', workoutExerciseId)
        .single();

      if (exerciseError || !workoutExercise) {
        console.error('❌ useWarmupManager: Error getting exercise data for logging:', exerciseError);
        return;
      }

      const exercise = workoutExercise.exercises;
      const primaryGroup = exercise.body_part_id || '';
      const secondaryGroups = exercise.secondary_muscle_group_ids || [];

      // Update session context
      noteWorkingSet(primaryGroup, secondaryGroups);
      
      console.log('✅ useWarmupManager: Working set logged to context:', {
        workoutExerciseId,
        primaryGroup,
        secondaryGroups
      });
    } catch (err) {
      console.error('❌ useWarmupManager: Error logging working set:', err);
    }
  }, []);

  return {
    recomputeWarmup,
    saveFeedback,
    getSmartWarmupSetsCount,
    resetSessionContext,
    logWorkingSet,
    isLoading,
    error
  };
};