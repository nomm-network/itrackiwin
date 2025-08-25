import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { WarmupPlan } from '@/features/health/fitness/utils/warmup';
import { generateWarmupClient } from '@/features/health/fitness/utils/warmup';

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
  const [rating, setRating] = useState<'not_enough' | 'excellent' | 'too_much' | null>(null);

  // Load from DB on mount
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('workout_exercises')
        .select('warmup_plan, warmup_feedback')
        .eq('id', workoutExerciseId)
        .maybeSingle();

      if (error) {
        console.error(error);
        return;
      }
      if (data?.warmup_plan) {
        setPlan(data.warmup_plan as WarmupPlan);
        setRating((data.warmup_feedback as any) ?? null);
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


  const saveRating = async (value: 'not_enough' | 'excellent' | 'too_much') => {
    setRating(value);
    const { error } = await supabase
      .from('workout_exercises')
      .update({ warmup_feedback: value, warmup_updated_at: new Date().toISOString() })
      .eq('id', workoutExerciseId);
    if (error) {
      toast.error('Failed to save feedback');
    } else {
      toast.success('Warmup feedback saved');
      // Hide warmup when feedback is given
      onFeedbackGiven?.();
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
                {plan.steps.map((s) => (
                  <li key={s.id} className="flex items-center justify-between text-sm">
                    <span className="font-mono">{s.id.toUpperCase()}</span>
                    <span>{s.weight}{unit} × {s.reps} reps</span>
                    <span className="text-muted-foreground">{s.rest ?? 60}s rest</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* One-tap feedback after finishing all warmups for the exercise */}
            <div>
              <div className="text-xs mb-2">How was the warm‑up? Pick 👇🏻</div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={rating === 'not_enough' ? 'default' : 'outline'}
                  onClick={() => saveRating('not_enough')}
                >
                  🥶 Not enough
                </Button>
                <Button
                  size="sm"
                  variant={rating === 'excellent' ? 'default' : 'outline'}
                  onClick={() => saveRating('excellent')}
                >
                  🔥 Excellent
                </Button>
                <Button
                  size="sm"
                  variant={rating === 'too_much' ? 'default' : 'outline'}
                  onClick={() => saveRating('too_much')}
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