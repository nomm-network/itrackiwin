import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useWorkoutSetGrips = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveSetWithGrips = useCallback(async (
    workoutSetData: {
      workout_exercise_id: string;
      weight?: number;
      reps?: number;
      weight_unit?: string;
      duration_seconds?: number;
      distance?: number;
      rpe?: number;
      notes?: string;
      feel?: string;
      pain?: boolean;
      set_kind?: string;
      is_completed?: boolean;
    },
    gripIds?: string[]
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      // Use the set_log RPC function which handles grips and computes set_index
      const payload = {
        ...workoutSetData,
        grip_ids: gripIds || []
        // Note: Do NOT send set_index - let the RPC compute it
      };

      const { data, error: rpcError } = await supabase.rpc('set_log', {
        p_payload: payload
      });

      if (rpcError) throw rpcError;

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save set with grips';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    saveSetWithGrips,
    isLoading,
    error
  };
};