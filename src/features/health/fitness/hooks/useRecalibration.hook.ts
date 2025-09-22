import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface RecalibrationPrescription {
  exercise_id: string;
  warmup_text: string;
  top_set: {
    weight: number;
    reps: number;
    weight_unit: string;
    set_kind: string;
  };
  backoff: {
    weight: number;
    reps: number;
    sets: number;
    weight_unit: string;
    set_kind: string;
  };
  progression_factor: number;
  muscle_priority: number;
  consistency_score: number;
  analysis: {
    recent_feels: string[];
    recent_rpes: number[];
    last_top_weight: number;
    warmup_feedback: string;
    avg_rpe: number;
  };
  notes: string[];
  generated_at: string;
}

export const useRecalibration = (exerciseId: string) => {
  return useQuery({
    queryKey: ['recalibration', exerciseId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .rpc('plan_next_prescription', {
          p_user_id: user.id,
          p_exercise_id: exerciseId,
          p_lookback_sessions: 3
        });

      if (error) throw error;
      return data as unknown as RecalibrationPrescription;
    },
    enabled: !!exerciseId,
    staleTime: 300000, // 5 minutes
  });
};

export const useWorkoutRecalibration = (exerciseIds: string[]) => {
  return useQuery({
    queryKey: ['workout-recalibration', exerciseIds],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .rpc('get_workout_recalibration', {
          p_user_id: user.id,
          p_exercise_ids: exerciseIds
        });

      if (error) throw error;
      return data as unknown as {
        user_id: string;
        recommendations: RecalibrationPrescription[];
        generated_at: string;
      };
    },
    enabled: exerciseIds.length > 0,
    staleTime: 300000,
  });
};

export const useSaveWarmupFeedback = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      exerciseId, 
      quality 
    }: { 
      exerciseId: string; 
      quality: 'not_enough' | 'excellent' | 'too_much';
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Update the workout_exercises table with warmup quality
      const { data, error } = await supabase
        .from('workout_exercises')
        .update({ warmup_quality: quality })
        .eq('exercise_id', exerciseId)
        .eq('id', (
          await supabase
            .from('workout_exercises')
            .select('id')
            .eq('exercise_id', exerciseId)
            .order('id', { ascending: false })
            .limit(1)
            .single()
        ).data?.id);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recalibration'] });
      toast({
        title: "Warmup Feedback Saved",
        description: "Your feedback will improve future warmup recommendations.",
      });
    },
    onError: (error) => {
      console.error('Error saving warmup feedback:', error);
      toast({
        title: "Error",
        description: "Failed to save warmup feedback. Please try again.",
        variant: "destructive",
      });
    }
  });
};

export const useSaveSetFeel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      setId, 
      feel 
    }: { 
      setId: string; 
      feel: '++' | '+' | '=' | '-' | '--';
    }) => {
      const { data, error } = await supabase
        .from('workout_sets')
        .update({ 
          settings: { feel } 
        })
        .eq('id', setId);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recalibration'] });
      toast({
        title: "Set Feel Saved",
        description: "Your feedback will improve future recommendations.",
      });
    },
    onError: (error) => {
      console.error('Error saving set feel:', error);
      toast({
        title: "Error",
        description: "Failed to save set feedback. Please try again.",
        variant: "destructive",
      });
    }
  });
};