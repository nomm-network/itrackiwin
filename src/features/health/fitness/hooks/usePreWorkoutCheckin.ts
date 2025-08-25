import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PreWorkoutCheckin {
  id?: string;
  user_id: string;
  workout_id?: string;
  is_sick: boolean;
  slept_poorly: boolean;
  low_energy: boolean;
  notes?: string;
}

export const usePreWorkoutCheckin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCheckin = useCallback(async (checkin: Omit<PreWorkoutCheckin, 'id' | 'user_id'>) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: createError } = await supabase
        .from('preworkout_checkins')
        .insert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          ...checkin
        })
        .select()
        .single();

      if (createError) throw createError;
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create checkin';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getLastCheckin = useCallback(async (workoutId?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const query = supabase
        .from('preworkout_checkins')
        .select('*')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (workoutId) {
        query.eq('workout_id', workoutId);
      }

      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;
      
      return data?.[0] || null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch checkin';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    createCheckin,
    getLastCheckin,
    isLoading,
    error
  };
};