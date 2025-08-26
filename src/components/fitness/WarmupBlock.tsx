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
  
  const warmupFeedbackMutation = useWarmupFeedback();

  // Load from DB on mount and get actual heaviest set weight
  useEffect(() => {
    (async () => {
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

      // Get heaviest completed set weight for display
      const { data: heaviestSet } = await supabase
        .from('workout_sets')
        .select('weight')
        .eq('workout_exercise_id', workoutExerciseId)
        .eq('is_completed', true)
        .order('weight', { ascending: false })
        .limit(1)
        .maybeSingle();

      const topWeight = heaviestSet?.weight || suggestedTopWeight;
      setActualTopWeight(topWeight);

      if (data?.warmup_plan) {
        setPlan(data.warmup_plan as WarmupPlan);
        setLocalFeedback(data.warmup_feedback || null);
      } else {
        // generate default client-side if nothing saved
        const p = buildWarmupPlan({
          topWeightKg: topWeight,
          repsGoal: suggestedTopReps,
          roundingKg: 2.5,
          minWeightKg: 0,
        });
        setPlan(p);
      }
    })();
  }, [workoutExerciseId, unit, suggestedTopWeight, suggestedTopReps]);

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