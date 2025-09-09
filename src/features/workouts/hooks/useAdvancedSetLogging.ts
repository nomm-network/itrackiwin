import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SetData {
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
}

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

export const useAdvancedSetLogging = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logSet = useCallback(async (setData: SetData, plannedSetIndex?: number) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔍 useAdvancedSetLogging: Starting log set with data:', {
        setData,
        plannedSetIndex,
        'setData.workout_exercise_id': setData.workout_exercise_id,
        'setData.grip_ids': setData.grip_ids,
        'grip_ids_length': setData.grip_ids?.length || 0,
        'grip_ids_type': typeof setData.grip_ids,
        'grip_ids_array': Array.isArray(setData.grip_ids)
      });

      // Get workout exercise info for debugging
      const { data: workoutExerciseInfo, error: weError } = await supabase
        .from('workout_exercises')
        .select(`
          id, 
          exercise_id, 
          grip_key,
          workout_id,
          workouts!inner(user_id)
        `)
        .eq('id', setData.workout_exercise_id)
        .maybeSingle();

      if (weError) {
        console.error('❌ Failed to get workout exercise info:', weError);
        throw weError;
      }

      if (!workoutExerciseInfo) {
        console.error('❌ No workout exercise found with ID:', setData.workout_exercise_id);
        throw new Error(`Workout exercise not found: ${setData.workout_exercise_id}`);
      }

      console.log('🔍 Workout Exercise Info:', {
        workoutExerciseInfo,
        user_id: workoutExerciseInfo?.workouts?.user_id,
        exercise_id: workoutExerciseInfo?.exercise_id,
        current_grip_key: workoutExerciseInfo?.grip_key
      });

      // Check existing personal records for this user/exercise
      const { data: existingPRs, error: prError } = await supabase
        .from('personal_records')
        .select('*')
        .eq('user_id', workoutExerciseInfo?.workouts?.user_id)
        .eq('exercise_id', workoutExerciseInfo?.exercise_id);

      console.log('🔍 Existing Personal Records:', {
        count: existingPRs?.length || 0,
        records: existingPRs?.map(pr => ({
          kind: pr.kind,
          grip_key: pr.grip_key,
          value: pr.value,
          id: pr.id
        }))
      });

      // Resolve the correct set_index and whether to update or insert
      const { index, exists } = await resolveSetIndex(
        setData.workout_exercise_id, 
        plannedSetIndex
      );

      console.log('🔍 Set index resolved:', { index, exists });

      const payload = {
        ...setData,
        set_index: index,
        grip_ids: setData.grip_ids || []
      };

      console.log('🔍 Final payload:', {
        ...payload,
        'payload.grip_ids': payload.grip_ids,
        'payload.grip_ids_length': payload.grip_ids?.length,
        'payload.weight': payload.weight,
        'payload.reps': payload.reps,
        'will_trigger_pr_update': payload.weight && payload.reps
      });

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
            set_kind: (payload.set_kind as any) || 'normal'
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
            .maybeSingle();

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
        console.log('🔍 About to INSERT new workout set:', {
          workout_exercise_id: payload.workout_exercise_id,
          set_index: index,
          weight: payload.weight,
          reps: payload.reps,
          weight_unit: payload.weight_unit || 'kg',
          rpe: payload.rpe,
          notes: payload.notes,
          is_completed: payload.is_completed ?? true,
          set_kind: (payload.set_kind as any) || 'normal'
        });

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
            load_meta: {} // Required field with default empty object
          })
          .select('id')
          .maybeSingle();
        
        if (insertError) {
          console.error('❌ SET SAVE FAILED:', insertError);
          console.error('❌ Full error details:', {
            code: insertError.code,
            message: insertError.message,
            details: insertError.details,
            hint: insertError.hint
          });
          throw insertError;
        }

        console.log('✅ Workout set inserted successfully:', {
          insertedSetId: insertedSet.id,
          will_add_grips: payload.grip_ids.length > 0
        });

        // Handle grips for new set
        if (payload.grip_ids.length > 0) {
          console.log('🔍 About to insert grips for set:', {
            workout_set_id: insertedSet.id,
            grip_ids: payload.grip_ids
          });

          const gripInserts = payload.grip_ids.map(gripId => ({
            workout_set_id: insertedSet.id,
            grip_id: gripId
          }));
          
          const { error: gripError } = await supabase
            .from('workout_set_grips')
            .insert(gripInserts);

          if (gripError) {
            console.error('❌ Failed to insert workout set grips:', gripError);
            throw gripError;
          }

          console.log('✅ Workout set grips inserted successfully');
        }
      }

      console.log('✅ useAdvancedSetLogging: Set logged successfully', { set_index: index, action: exists ? 'updated' : 'inserted' });

      return { success: true, set_index: index, action: exists ? 'updated' : 'inserted' };
    } catch (err) {
      console.error('❌ useAdvancedSetLogging: Error in logSet:', err);
      console.error('❌ Full error object:', JSON.stringify(err, null, 2));
      
      // Extract and preserve all error details
      let errorMessage = 'Failed to log set';
      if (err instanceof Error) {
        errorMessage = err.message;
        
        // Add additional error details if available
        const errorObj = err as any;
        if (errorObj.details) {
          errorMessage += ` | Details: ${errorObj.details}`;
        }
        if (errorObj.hint) {
          errorMessage += ` | Hint: ${errorObj.hint}`;
        }
        if (errorObj.code) {
          errorMessage += ` | Code: ${errorObj.code}`;
        }
      } else if (typeof err === 'object' && err !== null) {
        const errorObj = err as any;
        if (errorObj.message) {
          errorMessage = errorObj.message;
        }
        if (errorObj.error_description) {
          errorMessage += ` | ${errorObj.error_description}`;
        }
        if (errorObj.code) {
          errorMessage += ` | Code: ${errorObj.code}`;
        }
        errorMessage += ` | Raw: ${JSON.stringify(err)}`;
      } else {
        errorMessage = String(err);
      }
      
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