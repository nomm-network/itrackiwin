import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TargetCalculationResult {
  next_weight_kg: number;
  next_reps: number;
  bump_pct: number;
}

interface LastPerformanceData {
  weight_kg: number;
  reps: number;
  readiness_score: number;
}

export const useReadinessTargets = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getLastPerformance = useCallback(async (userId: string, exerciseId: string): Promise<LastPerformanceData | null> => {
    try {
      const { data, error: rpcError } = await supabase
        .rpc('fn_last_performance_for_exercise', {
          p_user_id: userId,
          p_exercise_id: exerciseId
        });

      if (rpcError) throw rpcError;
      
      return data?.[0] || null;
    } catch (err) {
      console.error('❌ useReadinessTargets: Error getting last performance:', err);
      return null;
    }
  }, []);

  const calculateNextTarget = useCallback(async (params: {
    exerciseId: string;
    prevWeightKg?: number;
    prevReps?: number;
    targetReps: number;
    readinessPrev?: number;
    readinessToday: number;
  }): Promise<TargetCalculationResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🎯 useReadinessTargets: Calculating next target:', params);
      
      const { data, error: rpcError } = await supabase
        .rpc('fn_next_target_for_exercise', {
          p_exercise_id: params.exerciseId,
          p_prev_weight_kg: params.prevWeightKg || 20,
          p_prev_reps: params.prevReps || params.targetReps,
          p_target_reps: params.targetReps,
          p_readiness_prev: params.readinessPrev || params.readinessToday,
          p_readiness_today: params.readinessToday
        });

      if (rpcError) {
        console.error('❌ useReadinessTargets: RPC error:', rpcError);
        throw rpcError;
      }

      const target = data?.[0];
      if (target) {
        console.log('✅ useReadinessTargets: Calculated target:', target);
        return target;
      }

      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to calculate next target';
      console.error('❌ useReadinessTargets: Error:', errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getSmartTarget = useCallback(async (params: {
    userId: string;
    exerciseId: string;
    targetReps: number;
    readinessToday: number;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      // Get last performance data (includes weight, reps, and readiness from that session)
      const lastPerformance = await getLastPerformance(params.userId, params.exerciseId);
      
      if (!lastPerformance) {
        // No history - return default target
        return {
          next_weight_kg: 20,
          next_reps: params.targetReps,
          bump_pct: 0,
          isFirstTime: true
        };
      }

      // Calculate next target using readiness adaptation
      const target = await calculateNextTarget({
        exerciseId: params.exerciseId,
        prevWeightKg: lastPerformance.weight_kg,
        prevReps: lastPerformance.reps,
        targetReps: params.targetReps,
        readinessPrev: lastPerformance.readiness_score,
        readinessToday: params.readinessToday
      });

      return target ? { ...target, isFirstTime: false } : null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get smart target';
      console.error('❌ useReadinessTargets: Error in getSmartTarget:', errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [getLastPerformance, calculateNextTarget]);

  return {
    getLastPerformance,
    calculateNextTarget,
    getSmartTarget,
    isLoading,
    error
  };
};