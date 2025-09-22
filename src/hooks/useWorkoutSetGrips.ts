import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { buildSupabaseErrorMessage } from '@/workouts-sot/utils/supabaseError';

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

      console.debug('[set_log v111.10] payload:', payload);

      const { data, error: rpcError } = await supabase.rpc('set_log', {
        p_payload: payload
      });

      if (rpcError) {
        // throw a *rich* error so the UI can show the full message
        const msg = buildSupabaseErrorMessage(rpcError, 'set_log');
        const errObj = new Error(msg);
        // attach raw error in case the UI wants to inspect
        (errObj as any).raw = rpcError;
        throw errObj;
      }

      // Also check DB-returned "error" contract if your RPC returns json
      if (data && typeof data === 'object' && (data as any).success === false) {
        const errorMessage = (data as any).error || 'Unknown database error';
        const msg = buildSupabaseErrorMessage({ message: errorMessage }, 'set_log(returned)');
        const errObj = new Error(msg);
        (errObj as any).raw = data;
        throw errObj;
      }

      console.debug('[set_log v111.10] result:', data);
      
      return data; // success — caller will toast success
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