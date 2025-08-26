import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { calcWarmupFromEstimate } from '../utils/calcWarmupFromEstimate';
import { workoutKeys } from '../api/workouts.api';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

type Props = {
  open: boolean;
  onClose: () => void;
  userId: string;
  exerciseId: string;
  workoutExerciseId: string;
  exerciseName?: string;
};

export function FirstTimeEstimateModal({ 
  open, 
  onClose, 
  userId, 
  exerciseId, 
  workoutExerciseId, 
  exerciseName 
}: Props) {
  const [kg, setKg] = useState<number>(0);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const saveMutation = useMutation({
    mutationFn: async (weight: number) => {
      // 1) Save estimate (upsert)
      const { error: upErr } = await supabase
        .from('user_exercise_estimates')
        .upsert({
          user_id: userId,
          exercise_id: exerciseId,
          rep_target: 10,
          est_weight_kg: weight,
          source: 'quick_estimate'
        } as any, { onConflict: 'user_id,exercise_id,rep_target' });
      
      if (upErr) throw upErr;

      // 2) Build warm-up plan and persist into workout_exercises
      const plan = calcWarmupFromEstimate(weight);

      const { error: wuErr } = await supabase
        .from('workout_exercises')
        .update({
          warmup_plan: plan,
          warmup_updated_at: new Date().toISOString()
        })
        .eq('id', workoutExerciseId);
      
      if (wuErr) throw wuErr;

      return { plan, weight };
    },
    onSuccess: (data) => {
      // Invalidate and refetch workout data to show updated warmup
      queryClient.invalidateQueries({ queryKey: workoutKeys.all });
      queryClient.invalidateQueries({ queryKey: ['needsEstimate'] });

      toast({
        title: "Warm-up and targets prepared ✅",
        description: `Set for ${data.weight}kg × 10 reps with ${data.plan.steps.length} warm-up sets`
      });

      onClose();
    },
    onError: (error) => {
      console.error('Failed to save quick estimate:', error);
      toast({
        title: "Failed to save estimate",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSave = () => {
    if (!kg || kg <= 0) return;
    saveMutation.mutate(kg);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>
            Quick estimate{exerciseName ? ` for ${exerciseName}` : ''}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            What weight (kg) do you think you can do for ~10 reps?
          </p>
          
          <div className="space-y-2">
            <Input
              inputMode="decimal"
              type="number"
              min={0}
              step={2.5}
              value={kg || ''}
              onChange={(e) => setKg(parseFloat(e.target.value))}
              onKeyPress={handleKeyPress}
              placeholder="e.g. 60"
              autoFocus
            />
            
            {kg > 0 && (
              <p className="text-xs text-muted-foreground">
                ≈ {Math.round(kg / 2.5)} × 2.5kg plates per side + 20kg bar
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Skip for now
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={saveMutation.isPending || !kg || kg <= 0}
              className="flex-1"
            >
              {saveMutation.isPending ? 'Saving...' : 'Build warm-up'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}