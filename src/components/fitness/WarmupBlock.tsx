import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { WarmupFeedback } from '@/features/workouts/types/warmup-unified';
import { useWarmupManager } from '@/features/workouts/hooks/useWarmupManager';
import { smartWarmupCalculator, SmartWarmupPlan } from '@/features/workouts/services/warmupCalculation';
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
  const { user } = useAuth();
  const [plan, setPlan] = useState<SmartWarmupPlan | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [localFeedback, setLocalFeedback] = useState<string | null>(null);
  const { saveFeedback, isLoading: isSaving } = useWarmupManager();

  // Generate smart warmup plan
  useEffect(() => {
    (async () => {
      if (!workoutExerciseId) return;
      
      try {
        const smartPlan = await smartWarmupCalculator.generateWarmupPlan({
          workoutExerciseId,
          suggestedTopWeight,
          suggestedTopReps,
          userId: user?.id
        });
        
        setPlan(smartPlan);
        console.log('✅ WarmupBlock: Generated smart warmup plan:', smartPlan);
      } catch (error) {
        console.error('❌ WarmupBlock: Failed to generate warmup plan:', error);
      }
    })();
  }, [workoutExerciseId, suggestedTopWeight, suggestedTopReps, user?.id]);

  // Calculate total warmup time
  const totalWarmupTime = useMemo(() => {
    if (!plan?.steps?.length) return 0;
    const rests = plan.steps.reduce((acc, s) => acc + (s.restSec ?? 60), 0);
    return rests; // seconds
  }, [plan]);

  // Save feedback and regenerate plan
  const save = async (value: string) => {
    try {
      await saveFeedback({
        workoutExerciseId,
        feedback: value as any
      });
      
      setLocalFeedback(value);
      toast.success('Warm-up feedback saved');
      onFeedbackGiven?.();
      
      // Regenerate plan after feedback
      const smartPlan = await smartWarmupCalculator.generateWarmupPlan({
        workoutExerciseId,
        suggestedTopWeight,
        suggestedTopReps,
        userId: user?.id
      });
      setPlan(smartPlan);
      
      console.log('✅ WarmupBlock: Feedback saved and plan regenerated');
    } catch (error) {
      console.error('❌ WarmupBlock: Error saving feedback:', error);
      toast.error('Failed to save warmup feedback');
    }
  };

  if (!plan) return null;

  return (
    <div>
      {/* Debug info */}
      <details style={{opacity: 0.6, fontSize: 12, marginBottom: 8}}>
        <summary>debug: warmup</summary>
        <pre>{JSON.stringify({
          weId: workoutExerciseId,
          topKg: plan.baseWeight,
          warmup: plan.steps,
          planStrategy: plan.strategy
        }, null, 2)}</pre>
      </details>
      
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Warm‑up 🤸</CardTitle>
          </div>
          <div className="text-xs text-muted-foreground">
            Strategy: <Badge variant="secondary">{plan.strategy}</Badge> • <strong>Top: {plan.baseWeight}{unit}</strong>
            <span className="ml-2 text-blue-600">• Auto-adjusts from feedback</span>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Plan preview */}
          <div className="rounded-md border p-3">
            <div className="text-xs font-medium mb-2">Steps</div>
            <ol className="space-y-2">
              {plan.steps.map((step) => (
                <li key={step.id} className="flex items-center justify-between text-sm">
                  <span className="font-mono">{step.id}</span>
                  <span>
                    <strong className="text-blue-600">{step.weight > 0 ? `${step.weight}${unit}` : '–'} × {step.reps} reps</strong>
                  </span>
                  <span className="text-muted-foreground">{step.restSec}s rest</span>
                </li>
              ))}
            </ol>
          </div>

          {/* One-tap feedback after finishing all warmups for the exercise */}
          <div>
            <div className="text-sm mb-2">How was the warm‑up? Pick 👇🏻</div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={localFeedback === 'not_enough' ? 'default' : 'outline'}
                onClick={() => save('not_enough' as any)}
                disabled={isSaving}
              >
                🥶 Too little
              </Button>
              <Button
                size="sm"
                variant={localFeedback === 'excellent' ? 'default' : 'outline'}
                onClick={() => save('excellent' as any)}
                disabled={isSaving}
              >
                🔥 Excellent
              </Button>
              <Button
                size="sm"
                variant={localFeedback === 'too_much' ? 'default' : 'outline'}
                onClick={() => save('too_much' as any)}
                disabled={isSaving}
              >
                🥵 Too much
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}