import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface WarmupPlan {
  id: string;
  plan_text: string;
  source: 'auto' | 'manual' | 'coach';
  last_feedback?: 'not_enough' | 'excellent' | 'too_much';
  success_streak: number;
  updated_at: string;
}

export const useWarmupPlan = (exerciseId?: string) => {
  return useQuery({
    queryKey: ['warmup-plan', exerciseId],
    queryFn: async () => {
      if (!exerciseId) return null;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_exercise_warmups')
        .select('*')
        .eq('user_id', user.id)
        .eq('exercise_id', exerciseId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data as WarmupPlan | null;
    },
    enabled: !!exerciseId,
  });
};

export const useCreateWarmupPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      exerciseId: string;
      planText: string;
      source?: 'auto' | 'manual' | 'coach';
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase.rpc('upsert_user_exercise_warmup', {
        _user_id: user.id,
        _exercise_id: params.exerciseId,
        _plan_text: params.planText,
        _source: params.source || 'auto',
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['warmup-plan', variables.exerciseId] 
      });
    },
  });
};

export const useSaveWarmupFeedback = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      exerciseId: string;
      feedback: 'not_enough' | 'excellent' | 'too_much';
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase.rpc('upsert_user_exercise_warmup', {
        _user_id: user.id,
        _exercise_id: params.exerciseId,
        _plan_text: null,
        _source: 'auto',
        _feedback: params.feedback,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['warmup-plan', variables.exerciseId] 
      });
    },
  });
};

// Generate a basic warmup plan when none exists
export const generateBasicWarmupPlan = (targetWeight: number = 50): string => {
  const warmup1 = Math.round(targetWeight * 0.3 * 2) / 2; // 30%
  const warmup2 = Math.round(targetWeight * 0.5 * 2) / 2; // 50%
  const warmup3 = Math.round(targetWeight * 0.7 * 2) / 2; // 70%

  return `w1: ${warmup1}kg × 10
(60s rest)

w2: ${warmup2}kg × 8
(60s rest)

w3: ${warmup3}kg × 5
(60s rest)`;
};