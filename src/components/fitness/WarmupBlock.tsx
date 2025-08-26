import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { WarmupPlan } from '@/features/health/fitness/utils/warmup';
import { generateWarmupClient } from '@/features/health/fitness/utils/warmup';
import { updateWarmupFeedback, type WarmupFeedback } from '@/features/workouts/api/warmup';

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
  const [localFeedback, setLocalFeedback] = useState<WarmupFeedback | null>(null);

  // Load from DB on mount
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('workout_exercises')
        .select('warmup_plan')
        .eq('id', workoutExerciseId)
        .maybeSingle();

      if (error) {
        console.error(error);
        return;
      }
      if (data?.warmup_plan) {
        setPlan(data.warmup_plan as WarmupPlan);
        const planObj = data.warmup_plan as any;
        setLocalFeedback(planObj?.feedback ?? null);
      } else {
        // generate default client-side if nothing saved
        const p = generateWarmupClient(suggestedTopWeight, suggestedTopReps, unit);
        setPlan(p);
      }
    })();
  }, [workoutExerciseId, unit, suggestedTopWeight, suggestedTopReps]);

  const totalWarmupTime = useMemo(() => {
    if (!plan?.steps?.length) return 0;
    const rests = plan.steps.reduce((acc, s) => acc + (s.rest ?? 60), 0);
    return rests; // seconds
  }, [plan]);


  const save = async (value: WarmupFeedback) => {
    try {
      await updateWarmupFeedback(workoutExerciseId, value);
      // Optimistic UI: toast + mark selected
      toast.success('Warm-up feedback saved');
      setLocalFeedback(value);
      onFeedbackGiven?.();
    } catch (e: any) {
      console.error('warmup feedback save failed', e);
      toast.error(`Could not save warm-up feedback: ${e.message}`);
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
                    <span>{s.weight}{unit} × {s.reps} reps</span>
                    <span className="text-muted-foreground">{s.rest ?? 60}s rest</span>
                  </li>
                )) || <li className="text-sm text-muted-foreground">No warmup steps available</li>}
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