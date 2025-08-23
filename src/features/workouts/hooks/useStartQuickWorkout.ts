import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNextProgramBlock } from '@/hooks/useTrainingPrograms';
import { toast } from 'sonner';

interface QuickWorkoutOptions {
  templateId?: string;
  useProgram?: boolean;
}

export const useStartQuickWorkout = () => {
  const queryClient = useQueryClient();
  const { data: nextProgramBlock } = useNextProgramBlock();
  
  return useMutation({
    mutationFn: async (options: QuickWorkoutOptions = {}) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');
      
      let templateId = options.templateId;
      
      // If using program and no specific template, get next from program
      if (options.useProgram && !templateId && nextProgramBlock?.workout_template_id) {
        templateId = nextProgramBlock.workout_template_id;
      }
      
      // Start workout with template
      const { data, error } = await supabase.rpc('start_workout', {
        p_template_id: templateId || null
      });
      
      if (error) throw error;
      
      return {
        workoutId: data,
        templateId,
        programBlockId: options.useProgram ? nextProgramBlock?.next_block_id : null
      };
    },
    onSuccess: (result) => {
      const message = result.templateId 
        ? 'Workout started from template!'
        : 'Quick workout started!';
      
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      queryClient.invalidateQueries({ queryKey: ['active-workout'] });
    },
    onError: (error) => {
      console.error('Failed to start workout:', error);
      toast.error('Failed to start workout');
    }
  });
};