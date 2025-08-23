import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { WarmupPolicyEngine, WarmupPlan, WarmupFeedback } from '../services/warmupPolicyEngine.service';
import { toast } from 'sonner';

export interface WarmupGenerationRequest {
  userId: string;
  exerciseId: string;
  workingWeight: number;
  workingReps?: number;
  experienceLevel?: string;
}

export const useGenerateWarmup = () => {
  return useMutation({
    mutationFn: async (request: WarmupGenerationRequest): Promise<WarmupPlan> => {
      const { userId, exerciseId, workingWeight, workingReps, experienceLevel } = request;
      
      return await WarmupPolicyEngine.generateWarmupPlan(
        userId,
        exerciseId,
        workingWeight,
        workingReps,
        experienceLevel
      );
    },
    onError: (error) => {
      console.error('Failed to generate warmup:', error);
      toast.error('Failed to generate warmup plan');
    }
  });
};

export const useWarmupFeedback = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      userId,
      exerciseId,
      feedback,
      warmupPlan
    }: {
      userId: string;
      exerciseId: string;
      feedback: WarmupFeedback;
      warmupPlan: WarmupPlan;
    }) => {
      await WarmupPolicyEngine.updateWarmupFeedback(userId, exerciseId, feedback, warmupPlan);
    },
    onSuccess: (_, variables) => {
      const { feedback } = variables;
      
      // Invalidate related queries
      queryClient.invalidateQueries({ 
        queryKey: ['warmup-preferences', variables.userId, variables.exerciseId] 
      });
      
      // Show feedback confirmation
      const feedbackMessages = {
        not_enough: 'We\'ll add more volume to your next warmup',
        excellent: 'Great! We\'ll keep this warmup approach',
        too_much: 'We\'ll reduce the warmup volume next time'
      };
      
      toast.success(feedbackMessages[feedback.quality]);
    },
    onError: (error) => {
      console.error('Failed to save warmup feedback:', error);
      toast.error('Failed to save warmup feedback');
    }
  });
};

export const useWarmupPreferences = (userId: string, exerciseId: string) => {
  return useQuery({
    queryKey: ['warmup-preferences', userId, exerciseId],
    queryFn: async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data, error } = await supabase
        .from('user_exercise_warmups')
        .select('*')
        .eq('user_id', userId)
        .eq('exercise_id', exerciseId)
        .single();
      
      if (error && error.code !== 'PGRST116') { // Not found is OK
        throw error;
      }
      
      return data;
    },
    enabled: !!userId && !!exerciseId,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
};

export const useWarmupHistory = (userId: string, exerciseId: string) => {
  return useQuery({
    queryKey: ['warmup-history', userId, exerciseId],
    queryFn: async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data, error } = await supabase
        .from('user_exercise_warmups')
        .select('*')
        .eq('user_id', userId)
        .eq('exercise_id', exerciseId)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      return (data as any)?.adaptation_history || [];
    },
    enabled: !!userId && !!exerciseId,
    staleTime: 10 * 60 * 1000 // 10 minutes
  });
};