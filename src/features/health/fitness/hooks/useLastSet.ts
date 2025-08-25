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
      console.log('🔍 useLastSet DEBUG - Input params:', { 
        userId, 
        exerciseId, 
        setIndex,
        userIdType: typeof userId,
        exerciseIdType: typeof exerciseId,
        setIndexType: typeof setIndex 
      });
      
      if (!userId || !exerciseId || !Number.isFinite(setIndex)) {
        console.log('❌ useLastSet: Missing required params');
        return null;
      }

      // Query the workout_sets table directly to get last set data
      console.log('🔍 Building query with params:', {
        userId, 
        exerciseId, 
        setIndex
      });

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

      console.log('🔍 useLastSet Raw Supabase response:', { 
        data, 
        error,
        dataLength: data?.length 
      });
      
      if (error) {
        console.error('❌ useLastSet Supabase error:', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.log('📭 useLastSet: No data found for params:', { userId, exerciseId, setIndex });
        
        // Let's also try a broader query to see what data exists
        const { data: allSets, error: allError } = await supabase
          .from("workout_sets")
          .select(`
            weight,
            reps,
            set_index,
            completed_at,
            workout_exercises!inner(
              exercise_id,
              workouts!inner(user_id)
            )
          `)
          .eq("workout_exercises.workouts.user_id", userId)
          .eq("workout_exercises.exercise_id", exerciseId)
          .eq("is_completed", true)
          .order("completed_at", { ascending: false })
          .limit(5);
        
        console.log('🔍 useLastSet - All recent sets for this exercise:', { 
          allSets, 
          allError,
          allSetsLength: allSets?.length 
        });
        
        return null;
      }
      
      const set = data[0];
      console.log('✅ useLastSet: Found set:', set);
      
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