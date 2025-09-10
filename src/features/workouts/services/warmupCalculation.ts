import { supabase } from '@/integrations/supabase/client';
import { recommendedWarmupsFor } from '@/lib/training/warmupManager';

export interface SmartWarmupSet {
  id: string;
  weight: number;
  reps: number;
  restSec: number;
  pct: number;
}

export interface SmartWarmupPlan {
  strategy: 'ramped';
  baseWeight: number;
  steps: SmartWarmupSet[];
}

export interface WarmupCalculationOptions {
  workoutExerciseId: string;
  suggestedTopWeight?: number;
  suggestedTopReps?: number;
  userId?: string;
}

/**
 * Unified smart warmup calculation service
 * This is the single source of truth for warmup calculations across the app
 */
export class SmartWarmupCalculator {
  
  /**
   * Get intelligent target weight for warmup calculation
   */
  private async getIntelligentTargetWeight(
    workoutExerciseId: string, 
    exerciseId: string,
    suggestedTopWeight: number = 60,
    userId?: string
  ): Promise<number> {
    console.log('🔍 SmartWarmupCalculator: Getting intelligent target weight for:', workoutExerciseId);

    try {
      // 1. Check for last working set from this exercise
      const { data: lastWorkingSet } = await supabase
        .from('workout_sets')
        .select('weight, set_index')
        .eq('workout_exercise_id', workoutExerciseId)
        .eq('is_completed', true)
        .neq('set_kind', 'warmup')
        .gte('weight', 1)
        .order('set_index', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (lastWorkingSet?.weight && lastWorkingSet.weight > 0) {
        console.log('🎯 SmartWarmupCalculator: Using last working set weight:', lastWorkingSet.weight, 'kg');
        return lastWorkingSet.weight;
      }

      // 2. Check for user estimates for this exercise
      if (userId && exerciseId) {
        const { data: estimate } = await supabase
          .from('user_exercise_estimates')
          .select('estimated_weight')
          .eq('user_id', userId)
          .eq('exercise_id', exerciseId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (estimate?.estimated_weight && estimate.estimated_weight > 0) {
          console.log('✅ SmartWarmupCalculator: Using estimate weight:', estimate.estimated_weight, 'kg');
          return estimate.estimated_weight;
        }
      }

      // 3. Check for stored warmup_top_weight from feedback
      const { data: feedbackData } = await supabase
        .from('workout_exercise_feedback')
        .select('warmup_top_weight')
        .eq('workout_exercise_id', workoutExerciseId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (feedbackData?.warmup_top_weight && feedbackData.warmup_top_weight > 0) {
        console.log('🎯 SmartWarmupCalculator: Using stored warmup_top_weight:', feedbackData.warmup_top_weight, 'kg');
        return feedbackData.warmup_top_weight;
      }

      // 4. Fallback to suggested weight
      console.log('⚠️ SmartWarmupCalculator: Using suggested weight fallback:', suggestedTopWeight, 'kg');
      return suggestedTopWeight;

    } catch (error) {
      console.error('❌ SmartWarmupCalculator: Error getting target weight:', error);
      return suggestedTopWeight;
    }
  }

  /**
   * Generate smart warmup plan with context-based step count
   */
  async generateWarmupPlan(options: WarmupCalculationOptions): Promise<SmartWarmupPlan> {
    const { workoutExerciseId, suggestedTopWeight = 60, userId } = options;

    // Get exercise information for muscle group context
    const { data: workoutExercise } = await supabase
      .from('workout_exercises')
      .select(`
        exercise_id,
        exercises!inner(
          body_part_id,
          secondary_muscle_group_ids
        )
      `)
      .eq('id', workoutExerciseId)
      .single();

    const exerciseId = workoutExercise?.exercise_id;
    const exercise = workoutExercise?.exercises;
    const primaryGroup = exercise?.body_part_id || '';
    const secondaryGroups = exercise?.secondary_muscle_group_ids || [];

    // Get context-based warmup count
    const desiredSteps = recommendedWarmupsFor(primaryGroup, secondaryGroups);
    
    // Get intelligent target weight
    const targetWeight = await this.getIntelligentTargetWeight(
      workoutExerciseId,
      exerciseId,
      suggestedTopWeight,
      userId
    );

    // Define all possible warmup steps
    const allSteps: SmartWarmupSet[] = [
      {
        id: 'W1',
        pct: 0.4,
        weight: Math.round(targetWeight * 0.4),
        reps: 10,
        restSec: 60
      },
      {
        id: 'W2', 
        pct: 0.6,
        weight: Math.round(targetWeight * 0.6),
        reps: 8,
        restSec: 90
      },
      {
        id: 'W3',
        pct: 0.8, 
        weight: Math.round(targetWeight * 0.8),
        reps: 5,
        restSec: 120
      }
    ];

    // Take only the desired number of steps (from the end, so higher intensities)
    const steps = allSteps.slice(-desiredSteps);

    console.log('🎯 SmartWarmupCalculator: Generated plan for target weight:', targetWeight, 'kg', {
      primaryGroup,
      secondaryGroups,
      desiredSteps,
      steps
    });

    return {
      strategy: 'ramped',
      baseWeight: targetWeight,
      steps
    };
  }

  /**
   * Get warmup sets for history display (compatible with existing interface)
   */
  async getWarmupSetsForHistory(
    workoutExerciseId: string,
    exerciseId: string,
    userId?: string
  ): Promise<Array<{ set_index: number; weight: number; reps: number; rest_seconds: number }>> {
    const plan = await this.generateWarmupPlan({
      workoutExerciseId,
      userId
    });

    return plan.steps.map((step, index) => ({
      set_index: index + 1,
      weight: step.weight,
      reps: step.reps,
      rest_seconds: step.restSec
    }));
  }
}

// Export singleton instance
export const smartWarmupCalculator = new SmartWarmupCalculator();