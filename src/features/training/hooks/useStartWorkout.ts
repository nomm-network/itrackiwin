// src/features/training/hooks/useStartWorkout.ts
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface StartFromTemplateArgs {
  templateId: string;
}

export function useStartWorkout() {
  return useMutation({
    mutationFn: async ({ templateId }: StartFromTemplateArgs): Promise<string> => {
      // Calls your existing RPC: start_workout(p_template_id uuid)
      const { data, error } = await supabase.rpc('start_workout', {
        p_template_id: templateId,
      });

      if (error) {
        // Surface full error in UI for now (we'll prettify later)
        throw new Error(error.message || 'Failed to start workout');
      }

      if (!data) throw new Error('start_workout returned no id');

      // Optionally set readiness snapshot right away if you keep it elsewhere
      // (We'll wire proper readiness screen in step 2)
      return data as string; // workout id
    },
  });
}
