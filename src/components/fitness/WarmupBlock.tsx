import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useWarmupManager } from '@/features/workouts/hooks/useWarmupManager';
import { suggestTarget, parseFeelFromNotes, parseFeelFromRPE } from '@/features/health/fitness/lib/targetSuggestions';
import { ensureWarmupInitialized } from '@/features/workouts/utils/warmupInitializer';
import { useAuth } from '@/hooks/useAuth';

// Database warmup plan structure (actual data from DB)
interface DBWarmupStep {
  id: string;
  pct: number;
  reps: number;
  restSec: number;
  targetWeight: number;
}

interface DBWarmupPlan {
  strategy: string;
  baseWeight: number;
  steps: DBWarmupStep[];
  updated_from: string;
  updatedAt: string;
}

type DBWarmupFeedback = 'not_enough' | 'excellent' | 'too_much';

type WarmupProps = {
  workoutExerciseId: string;
  unit?: 'kg' | 'lb';
  suggestedTopWeight?: number;
  suggestedTopReps?: number;
  onFeedbackGiven?: () => void;
};

export function WarmupBlock({
  workoutExerciseId,
  unit = 'kg',
  suggestedTopWeight = 60,
  suggestedTopReps = 8,
  onFeedbackGiven,
}: WarmupProps) {
  const [plan, setPlan] = useState<DBWarmupPlan | null>(null);
  const [localFeedback, setLocalFeedback] = useState<DBWarmupFeedback | null>(null);
  const [actualTopWeight, setActualTopWeight] = useState<number>(suggestedTopWeight);
  
  const { user } = useAuth();
  const { recomputeWarmup, saveFeedback, isLoading } = useWarmupManager();

  // Helper to get intelligent target weight using progressive overload system
  const getIntelligentTargetWeight = async (workoutExerciseId: string, userId: string): Promise<number> => {
    console.log('🔍 WarmupBlock: Getting intelligent target weight for:', workoutExerciseId);
    
    // Get exercise ID first
    const { data: we } = await supabase
      .from('workout_exercises')
      .select('exercise_id')
      .eq('id', workoutExerciseId)
      .single();
      
    if (!we?.exercise_id) {
      console.log('⚠️ WarmupBlock: No exercise found, using suggested weight:', suggestedTopWeight);
      return suggestedTopWeight;
    }

    // Get the HEAVIEST completed set for this exercise from ANY set index (not just recent by time)
    const { data: heaviestSet } = await supabase
      .from('workout_sets')
      .select(`
        weight, reps, set_index, completed_at, notes, rpe,
        workout_exercises!inner(
          exercise_id,
          workouts!inner(user_id)
        )
      `)
      .eq('workout_exercises.workouts.user_id', userId)
      .eq('workout_exercises.exercise_id', we.exercise_id)
      .eq('is_completed', true)
      .not('completed_at', 'is', null)
      .not('weight', 'is', null)
      .not('reps', 'is', null)
      .order('weight', { ascending: false })  // ORDER BY WEIGHT DESC to get the HEAVIEST
      .limit(1)
      .maybeSingle();

    console.log('🏋️ WarmupBlock: Heaviest set data:', heaviestSet);

    if (!heaviestSet) {
      console.log('⚠️ WarmupBlock: No previous sets found, trying estimates...');
      
      // Fallback to estimates
      const { data: estimate } = await supabase
        .from('user_exercise_estimates')
        .select('estimated_weight, unit, created_at')
        .eq('user_id', userId)
        .eq('exercise_id', we.exercise_id)
        .eq('type', 'rm10')
        .maybeSingle();
      
      if (estimate?.estimated_weight) {
        console.log('✅ WarmupBlock: Using estimate weight:', estimate.estimated_weight, 'kg');
        return estimate.estimated_weight;
      }
      
      console.log('⚠️ WarmupBlock: No estimates found, using suggested weight:', suggestedTopWeight);
      return suggestedTopWeight;
    }

    // Use progressive overload system to calculate target from the HEAVIEST set
    const lastFeel = parseFeelFromNotes(heaviestSet.notes) || parseFeelFromRPE(heaviestSet.rpe);
    
    const target = suggestTarget({
      lastWeight: heaviestSet.weight,
      lastReps: heaviestSet.reps,
      feel: lastFeel,
      templateTargetReps: undefined,
      templateTargetWeight: undefined,
      stepKg: 2.5
    });
    
    console.log('🎯 WarmupBlock: Calculated target weight:', target.weight, 'kg (from HEAVIEST set:', heaviestSet.weight, 'kg at set_index:', heaviestSet.set_index, ')');
    return target.weight;
  };

  // Load from DB on mount and get intelligent target weight
  useEffect(() => {
    (async () => {
      if (!user?.id) return;

      // Ensure warmup is initialized first
      await ensureWarmupInitialized(workoutExerciseId);

      // Get warmup plan and feedback 
      const { data, error } = await supabase
        .from('workout_exercises')
        .select('warmup_plan, warmup_feedback')
        .eq('id', workoutExerciseId)
        .maybeSingle();

      if (error) {
        console.error(error);
        return;
      }

      // Get stored warmup_top_weight from feedback table
      const { data: feedbackData } = await supabase
        .from('workout_exercise_feedback')
        .select('warmup_top_weight')
        .eq('workout_exercise_id', workoutExerciseId)
        .maybeSingle();

      // Get target weight with proper fallbacks
      let targetWeight = suggestedTopWeight;
      
      // Priority order: stored warmup_top_weight > calculated intelligent target > suggested
      if (feedbackData?.warmup_top_weight && feedbackData.warmup_top_weight > 0) {
        targetWeight = feedbackData.warmup_top_weight;
        console.log('🎯 WarmupBlock: Using stored warmup_top_weight:', targetWeight, 'kg');
      } else {
        // Calculate intelligent target weight using progressive overload system
        const intelligentWeight = await getIntelligentTargetWeight(workoutExerciseId, user.id);
        targetWeight = intelligentWeight;
        console.log('🎯 WarmupBlock: Using calculated target weight:', targetWeight, 'kg');
      }

      setActualTopWeight(targetWeight);

      if (data?.warmup_plan) {
        setPlan(data.warmup_plan as unknown as DBWarmupPlan);
        setLocalFeedback(data.warmup_feedback as DBWarmupFeedback || null);
      } else {
        // Generate default plan if nothing saved
        try {
          const updatedPlan = await recomputeWarmup({
            workoutExerciseId
          });
          
          setPlan(updatedPlan as any);
        } catch (error) {
          console.error('Failed to generate initial warmup plan:', error);
        }
      }
    })();
  }, [workoutExerciseId, unit, suggestedTopWeight, suggestedTopReps, user?.id, recomputeWarmup]);

  const totalWarmupTime = useMemo(() => {
    if (!plan?.steps?.length) return 0;
    const rests = plan.steps.reduce((acc, s) => acc + (s.restSec ?? 60), 0);
    return rests; // seconds
  }, [plan]);

  const save = async (value: DBWarmupFeedback) => {
    try {
      await saveFeedback({
        workoutExerciseId,
        feedback: value as any // Cast to make the types work temporarily
      });
      
      setLocalFeedback(value);
      toast.success('Warm-up feedback saved');
      onFeedbackGiven?.();

      // The warmup will be automatically recalculated via the database trigger
      // Fetch the updated plan
      const { data } = await supabase
        .from('workout_exercises')
        .select('warmup_plan')
        .eq('id', workoutExerciseId)
        .single();
      
      if (data?.warmup_plan) {
        setPlan(data.warmup_plan as unknown as DBWarmupPlan);
      }
    } catch (error) {
      toast.error('Failed to save warmup feedback');
      console.error('Warmup feedback error:', error);
    }
  };

  if (!plan) return null;

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Warm‑up 🤸</CardTitle>
        </div>
        <div className="text-xs text-muted-foreground">
          Strategy: {plan.strategy} • <strong>Top: {actualTopWeight || 0}kg</strong>
          <span className="ml-2 text-blue-600">• Auto-adjusts from feedback</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Plan preview */}
        <div className="rounded-md border p-3">
          <div className="text-xs font-medium mb-2">Steps</div>
          <ol className="space-y-2">
            {plan?.steps?.map((s, index) => {
              // Calculate warmup step weights as percentage of the actual top weight
              const stepPercentage = s.pct || 0;
              const stepWeight = actualTopWeight > 0 
                ? Math.round((actualTopWeight * stepPercentage / 100) * 4) / 4 // Round to nearest 0.25kg
                : s.targetWeight || 0;
              
              return (
                <li key={index} className="flex items-center justify-between text-sm">
                  <span className="font-mono">{s.id}</span>
                  <span>
                    <strong className="text-blue-600">{stepWeight > 0 ? `${stepWeight}${unit}` : '–'} × {s.reps} reps</strong>
                  </span>
                  <span className="text-muted-foreground">{s.restSec}s rest</span>
                </li>
              );
            }) || <li className="text-sm text-muted-foreground">No warmup steps available</li>}
          </ol>
        </div>

        {/* One-tap feedback after finishing all warmups for the exercise */}
        <div>
          <div className="text-sm mb-2">How was the warm‑up? Pick 👇🏻</div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={localFeedback === 'not_enough' ? 'default' : 'outline'}
              onClick={() => save('not_enough')}
              disabled={isLoading}
            >
              🥶 Too little
            </Button>
            <Button
              size="sm"
              variant={localFeedback === 'excellent' ? 'default' : 'outline'}
              onClick={() => save('excellent')}
              disabled={isLoading}
            >
              🔥 Excellent
            </Button>
            <Button
              size="sm"
              variant={localFeedback === 'too_much' ? 'default' : 'outline'}
              onClick={() => save('too_much')}
              disabled={isLoading}
            >
              🥵 Too much
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}