import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CycleEvent {
  id?: string;
  user_id: string;
  event_date: string;
  kind: 'period_start' | 'period_end';
}

export const useCycleTracking = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addCycleEvent = useCallback(async (event: Omit<CycleEvent, 'id' | 'user_id'>) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: createError } = await supabase
        .from('cycle_events')
        .insert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          ...event
        })
        .select()
        .single();

      if (createError) throw createError;
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add cycle event';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getCyclePhase = useCallback(async (): Promise<'low'|'neutral'|'high'> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('cycle_events')
        .select('event_date, kind')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .order('event_date', { ascending: false })
        .limit(6);

      if (fetchError) throw fetchError;

      const today = new Date();
      const recentPeriodStart = data?.find(e => 
        e.kind === 'period_start' &&
        (today.getTime() - new Date(e.event_date).getTime()) / (1000 * 3600 * 24) <= 6
      );

      return recentPeriodStart ? 'low' : 'neutral';
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch cycle phase';
      setError(errorMessage);
      return 'neutral'; // fallback
    } finally {
      setIsLoading(false);
    }
  }, []);

  const enableCycleTracking = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ cycle_tracking_enabled: true })
        .eq('id', (await supabase.auth.getUser()).data.user?.id);

      if (updateError) throw updateError;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to enable cycle tracking';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    addCycleEvent,
    getCyclePhase,
    enableCycleTracking,
    isLoading,
    error
  };
};