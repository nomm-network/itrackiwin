import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ReadinessInput } from '../types';

export const useReadinessCheckin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveCheckin = async (data: ReadinessInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Store readiness data in the new readiness_logs table
      const { error: insertError } = await supabase
        .from('readiness_logs')
        .insert({
          user_id: user.id,
          energy: data.energy,
          sleep_quality: data.sleep_quality,
          sleep_hours: data.sleep_hours,
          soreness: data.soreness,
          stress: data.stress,
          illness: data.illness,
          alcohol: data.alcohol,
          supplements: data.supplements
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