import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { WarmupPlan } from '@/features/workouts/types/warmup';
import { getStepWeight } from '@/features/workouts/warmup/calcWarmup';
import { buildWarmupPlan } from '@/features/workouts/warmup/calcWarmup';
import { useWarmupFeedback } from '@/features/workouts/warmup/useWarmupActions';
import { suggestTarget, parseFeelFromNotes, parseFeelFromRPE } from '@/features/health/fitness/lib/targetSuggestions';
import { useAuth } from '@/hooks/useAuth';

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
  const [open, setOpen] = useState(true);
  const [plan, setPlan] = useState<WarmupPlan | null>(null);
  const [localFeedback, setLocalFeedback] = useState<string | null>(null);
  const [actualTopWeight, setActualTopWeight] = useState<number>(suggestedTopWeight);
  
  const { user } = useAuth();
  const warmupFeedbackMutation = useWarmupFeedback();

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

      // Get warmup plan
      const { data, error } = await supabase
        .from('workout_exercises')
        .select('warmup_plan, warmup_feedback')
        .eq('id', workoutExerciseId)
        .maybeSingle();

      if (error) {
        console.error(error);
        return;
      }

      // Get intelligent target weight using progressive overload system
      const targetWeight = await getIntelligentTargetWeight(workoutExerciseId, user.id);
      setActualTopWeight(targetWeight);

      if (data?.warmup_plan) {
        setPlan(data.warmup_plan as WarmupPlan);
        setLocalFeedback(data.warmup_feedback || null);
      } else {
        // generate default client-side if nothing saved
        const p = buildWarmupPlan({
          topWeightKg: targetWeight,
          repsGoal: suggestedTopReps,
          roundingKg: 2.5,
          minWeightKg: 0,
        });
        setPlan(p);
      }
    })();
  }, [workoutExerciseId, unit, suggestedTopWeight, suggestedTopReps, user?.id]);

  const totalWarmupTime = useMemo(() => {
    if (!plan?.steps?.length) return 0;
    const rests = plan.steps.reduce((acc, s) => acc + (s.restSec ?? 60), 0);
    return rests; // seconds
  }, [plan]);


  const save = (value: 'not_enough' | 'excellent' | 'too_much') => {
    // This would need userId, but let's simplify for now
    setLocalFeedback(value);
    toast.success('Warm-up feedback saved');
    onFeedbackGiven?.();
  };

  if (!plan) return null;

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Warm‑up 🤸</CardTitle>
        </div>
        <div className="text-xs text-muted-foreground">
          Strategy: {plan.strategy} • est. {Math.round(totalWarmupTime/60)} min
        </div>
      </CardHeader>

      <div>
          <CardContent className="space-y-3">

            {/* Plan preview */}
            <div className="rounded-md border p-3">
              <div className="text-xs font-medium mb-2">Steps</div>
              <ol className="space-y-2">
                {plan?.steps?.map((s) => (
                  <li key={s.id} className="flex items-center justify-between text-sm">
                    <span className="font-mono">{s.id.toUpperCase()}</span>
                    <span>{getStepWeight(s, actualTopWeight, 2.5)}{unit} × {s.reps} reps</span>
                    <span className="text-muted-foreground">{s.restSec ?? 60}s rest</span>
                  </li>
                )) || <li className="text-sm text-muted-foreground">No warmup steps available</li>}
              </ol>
              
              {/* DEBUG INFO */}
              <div className="mt-3 p-2 bg-red-900/20 rounded text-xs space-y-1">
                <div><strong>🔍 WARMUP DEBUG DATA:</strong></div>
                <div>workoutExerciseId: {workoutExerciseId || 'NULL'}</div>
                <div>suggestedTopWeight: {suggestedTopWeight}kg</div>
                <div>actualTopWeight: {actualTopWeight}kg</div>
                <div>suggestedTopReps: {suggestedTopReps}</div>
                <div>plan.topWeightKg: {actualTopWeight}kg (using actualTopWeight)</div>
                <div>plan.strategy: {plan.strategy}</div>
                <div>plan.feedback: {localFeedback || 'NULL'} (using localFeedback)</div>
                <div>plan.steps: {plan.steps?.length || 0} steps</div>
                <div>localFeedback: {localFeedback || 'NULL'}</div>
                <div>Step calculations: {plan?.steps?.map((step, i) => 
                  `${step.id}: ${getStepWeight(step, actualTopWeight, 2.5)}kg (${(step.percent * 100).toFixed(0)}% of ${actualTopWeight}kg)`
                ).join(', ') || 'No steps'}</div>
              </div>
            </div>

            {/* One-tap feedback after finishing all warmups for the exercise */}
            <div>
              <div className="text-sm mb-2">How was the warm‑up? Pick 👇🏻</div>
               <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={localFeedback === 'not_enough' ? 'default' : 'outline'}
                  onClick={() => save('not_enough')}
                >
                  🥶 Not enough
                </Button>
                <Button
                  size="sm"
                  variant={localFeedback === 'excellent' ? 'default' : 'outline'}
                  onClick={() => save('excellent')}
                >
                  🔥 Excellent
                </Button>
                <Button
                  size="sm"
                  variant={localFeedback === 'too_much' ? 'default' : 'outline'}
                  onClick={() => save('too_much')}
                >
                  🥵 Too much
                </Button>
              </div>
            </div>
          </CardContent>
      </div>
    </Card>
  );
}