import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RepRangeEditorProps {
  workoutExerciseId: string;
  exerciseId: string;
  exerciseName: string;
  currentRepMin: number | null;
  currentRepMax: number | null;
  currentTargetReps: number | null;
  templateId?: string | null;
  programId?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function RepRangeEditor({
  workoutExerciseId,
  exerciseId,
  exerciseName,
  currentRepMin,
  currentRepMax,
  currentTargetReps,
  templateId,
  programId,
  open,
  onOpenChange,
  onSuccess
}: RepRangeEditorProps) {
  const [repMin, setRepMin] = useState(currentRepMin || 6);
  const [repMax, setRepMax] = useState(currentRepMax || 10);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Update the current workout exercise
      const updateData = {
        target_reps: null,
        target_reps_min: repMin,
        target_reps_max: repMax
      };

      const { error: workoutError } = await supabase
        .from('workout_exercises')
        .update(updateData)
        .eq('id', workoutExerciseId);

      if (workoutError) throw workoutError;

      // Save to preferences table (upsert)
      const { error: prefError } = await supabase
        .from('user_exercise_preferences')
        .upsert({
          user_id: user.id,
          exercise_id: exerciseId,
          template_id: templateId || null,
          program_id: programId || null,
          preferred_rep_min: repMin,
          preferred_rep_max: repMax,
          last_updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,exercise_id,template_id,program_id',
          ignoreDuplicates: false
        });

      if (prefError) {
        console.error('Error saving preference:', prefError);
        // Don't fail the whole operation if preference save fails
      }

      toast.success('Rep target updated successfully');
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating rep target:', error);
      toast.error('Failed to update rep target');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Rep Target</DialogTitle>
          <DialogDescription>
            Update the rep target for {exerciseName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rep_min">Min Reps</Label>
                <Input
                  id="rep_min"
                  type="number"
                  value={repMin}
                  onChange={(e) => setRepMin(Number(e.target.value))}
                  min={1}
                  max={repMax - 1}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rep_max">Max Reps</Label>
                <Input
                  id="rep_max"
                  type="number"
                  value={repMax}
                  onChange={(e) => setRepMax(Number(e.target.value))}
                  min={repMin + 1}
                  max={100}
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Target range: {repMin}-{repMax} reps. Weight suggestions will adapt based on your performance within this range.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
