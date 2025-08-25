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
  const [topWeight, setTopWeight] = useState<number>(suggestedTopWeight);
  const [topReps, setTopReps] = useState<number>(suggestedTopReps);
  const [saving, setSaving] = useState(false);
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

  const savePlan = async () => {
    if (!plan) return;
    setSaving(true);
    const { error } = await supabase
      .from('workout_exercises')
      .update({ warmup_plan: plan, warmup_updated_at: new Date().toISOString() })
      .eq('id', workoutExerciseId);

    setSaving(false);
    if (error) {
      console.error(error);
      toast.error('Failed to save warmup.');
    } else {
      toast.success('Warmup saved.');
    }
  };

  const regenerate = async () => {
    const p = generateWarmupClient(topWeight, topReps, unit);
    setPlan(p);
  };

  const saveRating = async (value: 'not_enough' | 'excellent' | 'too_much') => {
    setRating(value);
    const { error } = await supabase
      .from('workout_exercises')
      .update({ warmup_feedback: value, warmup_updated_at: new Date().toISOString() })
      .eq('id', workoutExerciseId);
    if (error) {
      toast.error('Failed to save feedback');
    } else {
      // Hide warmup when feedback is given
      onFeedbackGiven?.();
    }
  };

  if (!plan) return null;

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Warm‑up</CardTitle>
          <Collapsible open={open} onOpenChange={setOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">{open ? 'Hide' : 'Show'}</Button>
            </CollapsibleTrigger>
          </Collapsible>
        </div>
        <div className="text-xs text-muted-foreground">
          Strategy: {plan.strategy} • est. {Math.round(totalWarmupTime/60)} min
        </div>
      </CardHeader>

      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleContent>
          <CardContent className="space-y-3">
            {/* Controls to tweak top set */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-xs mb-1">Top set weight ({unit})</div>
                <Input
                  type="number"
                  value={topWeight}
                  onChange={(e) => setTopWeight(parseFloat(e.target.value || '0'))}
                />
              </div>
              <div>
                <div className="text-xs mb-1">Top set reps</div>
                <Input
                  type="number"
                  value={topReps}
                  onChange={(e) => setTopReps(parseInt(e.target.value || '0', 10))}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={regenerate}>Regenerate</Button>
              <Button size="sm" onClick={savePlan} disabled={saving}>{saving ? 'Saving…' : 'Save warm‑up'}</Button>
            </div>

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
              <div className="text-xs mb-2">How was the warm‑up?</div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={rating === 'not_enough' ? 'default' : 'outline'}
                  onClick={() => saveRating('not_enough')}
                >Not enough</Button>
                <Button
                  size="sm"
                  variant={rating === 'excellent' ? 'default' : 'outline'}
                  onClick={() => saveRating('excellent')}
                >Excellent</Button>
                <Button
                  size="sm"
                  variant={rating === 'too_much' ? 'default' : 'outline'}
                  onClick={() => saveRating('too_much')}
                >Too much</Button>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}