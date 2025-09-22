import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

type WarmupFeedback = 'not_enough' | 'excellent' | 'too_much';

interface WarmupFeedbackOptions {
  workoutExerciseId: string;
  feedback: WarmupFeedback;
  warmupSetsDone?: number;
  notes?: string;
}

export const useUnifiedWarmupFeedback = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveFeedback = useCallback(async (options: WarmupFeedbackOptions) => {
    setIsLoading(true);
    setError(null);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get exercise_id for the workout_exercise
      const { data: workoutExercise, error: fetchError } = await supabase
        .from('workout_exercises')
        .select('exercise_id')
        .eq('id', options.workoutExerciseId)
        .single();

      if (fetchError || !workoutExercise) throw new Error('Could not find workout exercise');

      // Upsert to user_exercise_warmups table (single source of truth)
      const { error: upsertError } = await supabase
        .from('user_exercise_warmups')
        .upsert({
          user_id: user.id,
          exercise_id: workoutExercise.exercise_id,
          workout_exercise_id: options.workoutExerciseId,
          plan_text: `Feedback: ${options.feedback}`,
          source: 'user_feedback',
          last_feedback: options.feedback,
          warmup_sets_done: options.warmupSetsDone || 0,
          notes: options.notes || null,
          success_streak: 0,
          updated_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,exercise_id',
          ignoreDuplicates: false
        });

      if (upsertError) throw upsertError;

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save warmup feedback';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getFeedback = useCallback(async (workoutExerciseId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_exercise_warmups')
      .select('*')
      .eq('user_id', user.id)
      .eq('workout_exercise_id', workoutExerciseId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }, []);

  return {
    saveFeedback,
    getFeedback,
    isLoading,
    error
  };
};