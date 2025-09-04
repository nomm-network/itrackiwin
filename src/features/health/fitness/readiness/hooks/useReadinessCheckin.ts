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

      // Execute raw SQL to insert into readiness_logs since types aren't regenerated yet
      const { error: insertError } = await supabase.rpc('exec_sql', {
        sql: `
          INSERT INTO readiness_logs (user_id, energy, sleep_quality, sleep_hours, soreness, stress, illness, alcohol, supplements)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `,
        params: [
          user.id,
          data.energy,
          data.sleep_quality,
          data.sleep_hours,
          data.soreness,
          data.stress,
          data.illness,
          data.alcohol,
          JSON.stringify(data.supplements)
        ]
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