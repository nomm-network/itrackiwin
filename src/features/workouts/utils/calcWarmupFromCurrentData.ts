import { supabase } from '@/integrations/supabase/client';
import type { WarmupPlan } from './calcWarmupFromEstimate';

// Update warmup plan based on current workout data (actual logged sets)
export async function updateWarmupForWorkoutData(
  workoutExerciseId: string,
  exerciseId: string
): Promise<void> {
  try {
    // Get the current workout data for this exercise
    const { data: workoutSets } = await supabase
      .from('workout_sets')
      .select('weight, reps')
      .eq('workout_exercise_id', workoutExerciseId)
      .eq('set_kind', 'normal')
      .order('set_index', { ascending: false })
      .limit(3); // Get last 3 sets to find the working weight

    if (!workoutSets || workoutSets.length === 0) {
      console.log('No workout sets found, keeping original warmup plan');
      return;
    }

    // Find the heaviest weight from recent sets
    const workingWeight = Math.max(...workoutSets.map(set => set.weight || 0));
    
    if (workingWeight <= 0) {
      console.log('No valid working weight found');
      return;
    }

    // Calculate new warmup plan based on actual working weight
    const updatedWarmupPlan = calcWarmupFromCurrentData(workingWeight);

    // Update the warmup plan in the database
    const { error } = await supabase
      .from('workout_exercises')
      .update({
        warmup_plan: {
          ...updatedWarmupPlan,
          updated_from_workout_data: true,
          updated_at: new Date().toISOString()
        }
      })
      .eq('id', workoutExerciseId);

    if (error) {
      console.error('Failed to update warmup plan:', error);
    } else {
      console.log('Updated warmup plan based on working weight:', workingWeight);
    }
  } catch (error) {
    console.error('Error updating warmup plan:', error);
  }
}

// Calculate warmup based on current working weight (from logged sets)
function calcWarmupFromCurrentData(workingWeight: number): WarmupPlan {
  // Round to nearest 2.5kg for gym plate compatibility
  const round = (n: number) => Math.round(n / 2.5) * 2.5;
  
  return {
    strategy: 'ramped',
    estMinutes: 3,
    steps: [
      { label: 'W1', weight: round(workingWeight * 0.4), reps: 10, restSec: 60 },
      { label: 'W2', weight: round(workingWeight * 0.6), reps: 8, restSec: 60 },
      { label: 'W3', weight: round(workingWeight * 0.8), reps: 5, restSec: 60 },
    ],
  };
}