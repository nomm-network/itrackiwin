import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SetLogPayload {
  workout_exercise_id: string;
  set_index?: number;
  reps?: number;
  rpe?: number;
  notes?: string;
  is_completed?: boolean;
  // For bar-loaded exercises
  bar_id?: string;
  weight_per_side?: number;
  // For regular exercises
  weight_total?: number;
  // New dual storage fields
  weight_kg?: number;
  input_weight?: number;
  input_unit?: 'kg' | 'lb';
}

export const useSetLogging = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logSet = useCallback(async (payload: SetLogPayload) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: rpcError } = await supabase.rpc('set_log', {
        p_payload: payload as any
      });

      if (rpcError) throw rpcError;

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to log set';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    logSet,
    isLoading,
    error
  };
};