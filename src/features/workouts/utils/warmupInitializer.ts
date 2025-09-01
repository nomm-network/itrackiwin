import { supabase } from '@/integrations/supabase/client';

/**
 * Utility to ensure warmup is initialized for workout exercises
 * This can be called when starting a workout or accessing an exercise
 * to make sure it has proper warmup data
 */
export const ensureWarmupInitialized = async (workoutExerciseId: string): Promise<void> => {
  try {
    console.log('🔍 warmupInitializer: Ensuring warmup initialized for:', workoutExerciseId);
    
    // Check if workout exercise feedback exists with warmup_top_weight
    const { data: feedback } = await supabase
      .from('workout_exercise_feedback')
      .select('warmup_top_weight')
      .eq('workout_exercise_id', workoutExerciseId)
      .maybeSingle();

    // If no feedback exists or no warmup_top_weight, initialize it
    if (!feedback || !feedback.warmup_top_weight) {
      console.log('🔧 warmupInitializer: Initializing warmup for exercise:', workoutExerciseId);
      
      const { error } = await supabase.rpc('initialize_warmup_for_exercise', {
        p_workout_exercise_id: workoutExerciseId
      });
      
      if (error) {
        console.error('❌ warmupInitializer: Error initializing warmup:', error);
      } else {
        console.log('✅ warmupInitializer: Successfully initialized warmup');
      }
    } else {
      console.log('✅ warmupInitializer: Warmup already initialized with top weight:', feedback.warmup_top_weight, 'kg');
    }
  } catch (error) {
    console.error('❌ warmupInitializer: Unexpected error:', error);
  }
};