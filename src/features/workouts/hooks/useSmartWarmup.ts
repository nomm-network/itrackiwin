import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useSmartWarmup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getWarmupSetsCount = useCallback(async (workoutExerciseId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔥 useSmartWarmup: Getting warmup sets for:', workoutExerciseId);
      
      const { data, error: rpcError } = await supabase
        .rpc('fn_warmup_sets_for_exercise', {
          p_workout_exercise_id: workoutExerciseId
        });

      if (rpcError) {
        console.error('❌ useSmartWarmup: RPC error:', rpcError);
        throw rpcError;
      }

      const warmupSets = Math.max(0, Math.min(3, data ?? 3));
      console.log('✅ useSmartWarmup: Warmup sets count:', warmupSets);
      
      return warmupSets;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get warmup sets count';
      console.error('❌ useSmartWarmup: Error:', errorMessage);
      setError(errorMessage);
      return 3; // Default fallback
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    getWarmupSetsCount,
    isLoading,
    error
  };
};