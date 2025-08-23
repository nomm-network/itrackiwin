import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface QuickStartResponse {
  workoutId: string;
  templateId: string;
  exercises: Array<{
    exercise: string;
    sets: number;
    targetWeight?: number;
    notes?: string;
  }>;
  gymId: string;
  createdAt: string;
}

export const useQuickStart = () => {
  const generateWorkout = useMutation({
    mutationFn: async (params: { templateId?: string } = {}): Promise<QuickStartResponse> => {
      const { templateId } = params;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Generate idempotency key to prevent duplicate workouts
      const idempotencyKey = `workout-${user.id}-${Date.now()}-${Math.random().toString(36).substring(7)}`;

      const { data, error } = await supabase.functions.invoke('generate-workout', {
        body: {
          userId: user.id,
          templateId,
          now: new Date().toISOString(),
          idempotencyKey,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      return data as QuickStartResponse;
    },
  });

  return {
    generateWorkout: generateWorkout.mutateAsync,
    isGenerating: generateWorkout.isPending,
  };
};