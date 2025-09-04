import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ReadinessInput } from '../types';

export const useReadinessCheckin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveCheckin = async (data: ReadinessInput, workoutId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Save readiness data using RPC function with proper typing
      const { error: insertError } = await supabase.rpc('save_readiness_checkin' as any, {
        p_workout_id: workoutId,
        p_energy: data.energy,
        p_sleep_quality: data.sleep_quality,
        p_sleep_hours: data.sleep_hours,
        p_soreness: data.soreness,
        p_stress: data.stress,
        p_illness: data.illness,
        p_alcohol: data.alcohol,
        p_supplements: data.supplements || 0
      });

      if (insertError) throw insertError;

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save check-in';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    saveCheckin,
    isLoading,
    error
  };
};