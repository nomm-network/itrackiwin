import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AdvancedSetData {
  workout_exercise_id: string;
  set_index?: number;
  weight?: number;
  reps?: number;
  weight_unit?: string;
  duration_seconds?: number;
  distance?: number;
  rpe?: number;
  notes?: string;
  set_kind?: string;
  is_completed?: boolean;
  grip_ids?: string[];
  bar_type_id?: string;
  load_entry_mode?: 'total' | 'one_side';
  load_one_side_kg?: number;
}

export const useAdvancedSetLogging = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logSet = useCallback(async (setData: AdvancedSetData, plannedSetIndex?: number) => {
    setIsLoading(true);
    setError(null);

    try {
      // Compute total weight using the database function
      let totalWeight = setData.weight;
      
      if (setData.load_entry_mode && setData.load_one_side_kg !== undefined) {
        // Get bar weight if bar_type_id is provided
        let barWeight = 0;
        if (setData.bar_type_id) {
          const { data: barData, error: barError } = await supabase
            .from('bar_types')
            .select('default_weight')
            .eq('id', setData.bar_type_id)
            .single();
          
          if (barError) throw barError;
          barWeight = barData.default_weight;
        }

        // Use the SQL function to compute total weight
        const { data: computedWeight, error: computeError } = await supabase
          .rpc('compute_total_weight', {
            p_entry_mode: setData.load_entry_mode,
            p_value: setData.load_entry_mode === 'one_side' ? setData.load_one_side_kg : setData.weight,
            p_bar_weight: barWeight,
            p_is_symmetrical: true // Default to true, could be made configurable
          });

        if (computeError) throw computeError;
        totalWeight = computedWeight;
      }

      // Resolve the correct set_index and whether to update or insert
      const { index, exists } = await resolveSetIndex(
        setData.workout_exercise_id, 
        plannedSetIndex
      );

      const payload = {
        ...setData,
        set_index: index,
        grip_ids: setData.grip_ids || [],
        total_weight_kg: totalWeight,
        weight: totalWeight // Keep legacy field in sync
      };

      if (exists) {
        // UPDATE the existing planned set
        const { error: updateError } = await supabase
          .from('workout_sets')
          .update({
            weight: payload.weight,
            reps: payload.reps,
            weight_unit: payload.weight_unit || 'kg',
            rpe: payload.rpe,
            notes: payload.notes,
            is_completed: payload.is_completed ?? true,
            set_kind: (payload.set_kind as any) || 'normal',
            bar_type_id: payload.bar_type_id,
            load_entry_mode: payload.load_entry_mode,
            load_one_side_kg: payload.load_one_side_kg,
            total_weight_kg: payload.total_weight_kg
          })
          .eq('workout_exercise_id', payload.workout_exercise_id)
          .eq('set_index', index);
        
        if (updateError) throw updateError;

        // Handle grips for updated set
        if (payload.grip_ids.length > 0) {
          const { data: setData } = await supabase
            .from('workout_sets')
            .select('id')
            .eq('workout_exercise_id', payload.workout_exercise_id)
            .eq('set_index', index)
            .single();

          if (setData) {
            // Clear existing grips
            await supabase
              .from('workout_set_grips')
              .delete()
              .eq('workout_set_id', setData.id);

            // Insert new grips
            if (payload.grip_ids.length > 0) {
              const gripInserts = payload.grip_ids.map(gripId => ({
                workout_set_id: setData.id,
                grip_id: gripId
              }));
              
              await supabase
                .from('workout_set_grips')
                .insert(gripInserts);
            }
          }
        }
      } else {
        // INSERT new set (planned or extra)
        const { data: insertedSet, error: insertError } = await supabase
          .from('workout_sets')
          .insert({
            workout_exercise_id: payload.workout_exercise_id,
            set_index: index,
            weight: payload.weight,
            reps: payload.reps,
            weight_unit: payload.weight_unit || 'kg',
            rpe: payload.rpe,
            notes: payload.notes,
            is_completed: payload.is_completed ?? true,
            set_kind: (payload.set_kind as any) || 'normal',
            bar_type_id: payload.bar_type_id,
            load_entry_mode: payload.load_entry_mode,
            load_one_side_kg: payload.load_one_side_kg,
            total_weight_kg: payload.total_weight_kg
          })
          .select('id')
          .single();
        
        if (insertError) throw insertError;

        // Handle grips for new set
        if (payload.grip_ids.length > 0) {
          const gripInserts = payload.grip_ids.map(gripId => ({
            workout_set_id: insertedSet.id,
            grip_id: gripId
          }));
          
          await supabase
            .from('workout_set_grips')
            .insert(gripInserts);
        }
      }

      return { success: true, set_index: index, action: exists ? 'updated' : 'inserted' };
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

async function resolveSetIndex(
  workoutExerciseId: string, 
  desiredIndex?: number
): Promise<{ index: number; exists: boolean }> {
  if (Number.isInteger(desiredIndex) && desiredIndex! >= 0) {
    // Planned set → check if a row already exists
    const { data, error } = await supabase
      .from('workout_sets')
      .select('id')
      .eq('workout_exercise_id', workoutExerciseId)
      .eq('set_index', desiredIndex!)
      .limit(1);
    
    if (error) throw error;
    return { index: desiredIndex!, exists: Boolean(data?.length) };
  }

  // Extra set → append
  const { data, error } = await supabase
    .from('workout_sets')
    .select('set_index')
    .eq('workout_exercise_id', workoutExerciseId)
    .order('set_index', { ascending: false })
    .limit(1);
  
  if (error) throw error;
  const next = (data?.[0]?.set_index ?? -1) + 1;
  return { index: next, exists: false };
}