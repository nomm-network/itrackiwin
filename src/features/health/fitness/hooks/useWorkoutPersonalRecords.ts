import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useWorkoutPersonalRecords = (workoutId: string) => {
  return useQuery({
    queryKey: ['workout-personal-records', workoutId],
    queryFn: async () => {
      // First get all workout exercise IDs for this workout
      const { data: workoutExercises, error: weError } = await supabase
        .from('workout_exercises')
        .select('id')
        .eq('workout_id', workoutId);

      if (weError) throw weError;
      if (!workoutExercises?.length) return { allRecords: [], recordsBySetId: new Map(), totalRecords: 0 };

      // Get all workout set IDs for these exercises
      const { data: workoutSets, error: wsError } = await supabase
        .from('workout_sets')
        .select('id')
        .in('workout_exercise_id', workoutExercises.map(we => we.id));

      if (wsError) throw wsError;
      if (!workoutSets?.length) return { allRecords: [], recordsBySetId: new Map(), totalRecords: 0 };

      // Get all personal records for these sets
      const { data, error } = await supabase
        .from('personal_records')
        .select(`
          id,
          kind,
          value,
          unit,
          workout_set_id,
          exercise_id,
          achieved_at
        `)
        .in('workout_set_id', workoutSets.map(ws => ws.id))
        .not('workout_set_id', 'is', null);

      if (error) throw error;

      // Group by workout_set_id for easy lookup
      const recordsBySetId = new Map<string, typeof data>();
      data?.forEach(record => {
        if (record.workout_set_id) {
          const setRecords = recordsBySetId.get(record.workout_set_id) || [];
          setRecords.push(record);
          recordsBySetId.set(record.workout_set_id, setRecords);
        }
      });

      return {
        allRecords: data || [],
        recordsBySetId,
        totalRecords: data?.length || 0,
        uniqueSetsWithRecords: recordsBySetId.size // Count unique sets that have any PR
      };
    },
    enabled: !!workoutId
  });
};