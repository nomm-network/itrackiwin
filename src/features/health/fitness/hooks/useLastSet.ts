import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface LastSetData {
  user_id: string;
  exercise_id: string;
  set_index: number;
  weight: number;
  reps: number;
  completed_at: string;
  notes: string | null;
  rpe: number | null;
  feel_extracted: string | null;
}

export function useLastSet(userId?: string, exerciseId?: string, setIndex?: number) {
  return useQuery({
    queryKey: ["lastSet", userId, exerciseId, setIndex],
    enabled: Boolean(userId && exerciseId && Number.isFinite(setIndex)),
    queryFn: async (): Promise<LastSetData | null> => {
      if (!userId || !exerciseId || !Number.isFinite(setIndex)) {
        return null;
      }

      // Query the workout_sets table directly to get last set data
      const { data, error } = await supabase
        .from("workout_sets")
        .select(`
          weight,
          reps,
          completed_at,
          notes,
          rpe,
          set_index,
          workout_exercises!inner(
            exercise_id,
            workouts!inner(user_id)
          )
        `)
        .eq("workout_exercises.workouts.user_id", userId)
        .eq("workout_exercises.exercise_id", exerciseId)
        .eq("set_index", setIndex)
        .eq("is_completed", true)
        .not("weight", "is", null)
        .not("reps", "is", null)
        .gt("reps", 0)
        .not("completed_at", "is", null)
        .order("completed_at", { ascending: false })
        .limit(1);

      if (error) throw error;
      
      if (!data || data.length === 0) return null;
      
      const set = data[0];
      return {
        user_id: userId,
        exercise_id: exerciseId,
        set_index: setIndex,
        weight: set.weight,
        reps: set.reps,
        completed_at: set.completed_at,
        notes: set.notes,
        rpe: set.rpe,
        feel_extracted: null // We'll parse this from notes if needed
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}