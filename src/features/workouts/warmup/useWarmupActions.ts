import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { updateWarmupForWorkout } from './updateWarmupForWorkout';
import { workoutKeys } from '@/workouts-sot/api';
import { toast } from 'sonner';

type Feedback = 'not_enough' | 'excellent' | 'too_much';

export const useWarmupFeedback = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      workoutExerciseId: string;
      userId: string;
      feedback: Feedback;
    }) => {
      // Save feedback to database
      await supabase.from('workout_exercises')
        .update({ 
          warmup_feedback: params.feedback, 
          warmup_feedback_at: new Date().toISOString() 
        })
        .eq('id', params.workoutExerciseId);

      // Update warmup plan based on feedback
      await updateWarmupForWorkout({
        workoutExerciseId: params.workoutExerciseId,
        userId: params.userId,
        feedback: params.feedback,
      });
    },
    onSuccess: (_, variables) => {
      const { feedback } = variables;
      
      // Show feedback confirmation
      const feedbackMessages = {
        not_enough: 'We\'ll add more volume to your next warmup',
        excellent: 'Great! We\'ll keep this warmup approach',
        too_much: 'We\'ll reduce the warmup volume next time'
      };
      
      toast.success(feedbackMessages[feedback]);
      
      // Invalidate workout query to refresh UI
      queryClient.invalidateQueries({ 
        queryKey: workoutKeys.byId(variables.workoutExerciseId) 
      });
    },
    onError: (error) => {
      console.error('Failed to save warmup feedback:', error);
      toast.error('Failed to save warmup feedback');
    }
  });
};

export const useUpdateWarmupAfterSet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      workoutExerciseId: string;
      userId: string;
      workoutId: string;
      lastFeel?: '--' | '-' | '=' | '+' | '++';
    }) => {
      await updateWarmupForWorkout({
        workoutExerciseId: params.workoutExerciseId,
        userId: params.userId,
        lastFeel: params.lastFeel,
      });
    },
    onSuccess: (_, variables) => {
      // Invalidate workout query to refresh UI
      queryClient.invalidateQueries({ 
        queryKey: workoutKeys.byId(variables.workoutId) 
      });
    },
    onError: (error) => {
      console.error('Failed to update warmup after set:', error);
    }
  });
};