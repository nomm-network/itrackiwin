import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { computeReadinessScore } from '@/lib/readiness/calc';

export interface ReadinessData {
  energy: number;
  sleep_quality: number;
  sleep_hours: number;
  soreness: number;
  stress: number;
  mood: number;
  supplements: string[];
  estimatesByExercise?: Record<string, { weight: number; unit: string }>;
}

export function useReadinessCheckin() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [templateId, setTemplateId] = useState<string | null>(null);

  const submitReadiness = useMutation({
    mutationFn: async ({ data, workoutId }: { data: ReadinessData; workoutId: string }) => {
      if (!user?.id) throw new Error('Not authenticated');

      // Calculate readiness score using the new 0-100 model
      const score = computeReadinessScore({
        energy: data.energy,
        sleepQuality: data.sleep_quality,
        sleepHours: data.sleep_hours,
        soreness: data.soreness,
        stress: data.stress,
        preworkout: data.supplements.length > 0
      });

      // Insert readiness checkin
      const { error: checkinError } = await supabase
        .from('pre_workout_checkins')
        .insert({
          workout_id: workoutId,
          user_id: user.id,
          answers: {
            energy: data.energy,
            sleep_quality: data.sleep_quality,
            sleep_hours: data.sleep_hours,
            soreness: data.soreness,
            stress: data.stress,
            mood: data.mood,
            supplements: data.supplements
          },
          readiness_score: score
        });

      if (checkinError) throw checkinError;

      // Save exercise estimates if provided
      if (data.estimatesByExercise) {
        const estimates = Object.entries(data.estimatesByExercise).map(([exerciseId, estimate]) => ({
          user_id: user.id,
          exercise_id: exerciseId,
          type: 'rm10',
          estimated_weight: estimate.weight,
          unit: estimate.unit
        }));

        if (estimates.length > 0) {
          const { error: estimatesError } = await supabase
            .from('user_exercise_estimates')
            .upsert(estimates);

          if (estimatesError) throw estimatesError;
        }
      }

      return { score };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pre-checkin'] });
      queryClient.invalidateQueries({ queryKey: ['missingEstimates'] });
      setIsOpen(false);
      setTemplateId(null);
    }
  });

  const open = (template_id: string) => {
    setTemplateId(template_id);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setTemplateId(null);
  };

  return {
    isOpen,
    templateId,
    open,
    close,
    submit: submitReadiness.mutateAsync,
    isSubmitting: submitReadiness.isPending
  };
}