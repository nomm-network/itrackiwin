import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { useMissingEstimates } from '@/features/workouts/hooks/useMissingEstimates';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ReadinessData } from './hooks/useReadinessCheckin';

interface ReadinessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ReadinessData) => Promise<void>;
  templateId: string | null;
  workoutId?: string;
  isSubmitting: boolean;
}

export function ReadinessDialog({ 
  isOpen, 
  onClose, 
  onSubmit, 
  templateId, 
  workoutId,
  isSubmitting 
}: ReadinessDialogProps) {
  const [formData, setFormData] = useState<ReadinessData>({
    energy: 75,
    sleep_quality: 75,
    sleep_hours: 7,
    soreness: 25,
    stress: 25,
    supplements: [],
    estimatesByExercise: {}
  });

  const [supplementInput, setSupplementInput] = useState('');
  const { user } = useAuth();

  // Get exercises from template that need estimates
  const { data: missingEstimates = [] } = useQuery({
    queryKey: ['missingEstimatesForTemplate', templateId, user?.id],
    enabled: Boolean(templateId && user?.id),
    queryFn: async () => {
      if (!templateId || !user?.id) return [];

      // Get exercises in this template
      const { data: templateExercises, error: templateError } = await supabase
        .from('template_exercises')
        .select('exercise_id, exercises!inner(id)')
        .eq('template_id', templateId);

      if (templateError || !templateExercises) return [];

      const exerciseIds = templateExercises.map(ex => ex.exercise_id);

      // Get exercise names
      const { data: exerciseTranslations } = await supabase
        .from('exercises_translations')
        .select('exercise_id, name')
        .in('exercise_id', exerciseIds)
        .eq('language_code', 'en');

      // Get existing estimates
      const { data: existingEstimates } = await supabase
        .from('user_exercise_estimates')
        .select('exercise_id')
        .eq('user_id', user.id)
        .eq('type', 'rm10')
        .in('exercise_id', exerciseIds);

      // Get exercises with history
      const { data: exercisesWithHistory } = await supabase
        .from('workout_sets')
        .select(`
          workout_exercises!inner(
            exercise_id,
            workouts!inner(user_id)
          )
        `)
        .eq('workout_exercises.workouts.user_id', user.id)
        .eq('is_completed', true)
        .in('workout_exercises.exercise_id', exerciseIds);

      const exercisesWithHistoryIds = new Set(
        exercisesWithHistory?.map(s => s.workout_exercises.exercise_id) || []
      );
      const exercisesWithEstimatesIds = new Set(
        existingEstimates?.map(e => e.exercise_id) || []
      );

      // Return exercises that need estimates
      return templateExercises
        .filter(ex => 
          !exercisesWithHistoryIds.has(ex.exercise_id) && 
          !exercisesWithEstimatesIds.has(ex.exercise_id)
        )
        .map(ex => {
          const translation = exerciseTranslations?.find(t => t.exercise_id === ex.exercise_id);
          return {
            exercise_id: ex.exercise_id,
            exercise_name: translation?.name || 'Unknown Exercise'
          };
        });
    }
  });

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        energy: 75,
        sleep_quality: 75,
        sleep_hours: 7,
        soreness: 25,
        stress: 25,
        supplements: [],
        estimatesByExercise: {}
      });
      setSupplementInput('');
    }
  }, [isOpen]);

  const addSupplement = () => {
    if (supplementInput.trim()) {
      setFormData(prev => ({
        ...prev,
        supplements: [...prev.supplements, supplementInput.trim()]
      }));
      setSupplementInput('');
    }
  };

  const removeSupplement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      supplements: prev.supplements.filter((_, i) => i !== index)
    }));
  };

  const updateEstimate = (exerciseId: string, weight: number) => {
    setFormData(prev => ({
      ...prev,
      estimatesByExercise: {
        ...prev.estimatesByExercise,
        [exerciseId]: { weight, unit: 'kg' }
      }
    }));
  };

  const canSubmit = missingEstimates.every(exercise => 
    formData.estimatesByExercise?.[exercise.exercise_id]?.weight > 0
  );

  const handleSubmit = async () => {
    if (!canSubmit) return;
    await onSubmit(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Pre-Workout Readiness Check</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Energy Level */}
          <div className="space-y-2">
            <Label>Energy Level: {formData.energy}%</Label>
            <Slider
              value={[formData.energy]}
              onValueChange={([value]) => setFormData(prev => ({ ...prev, energy: value }))}
              max={100}
              step={5}
              className="w-full"
            />
          </div>

          {/* Sleep Quality */}
          <div className="space-y-2">
            <Label>Sleep Quality: {formData.sleep_quality}%</Label>
            <Slider
              value={[formData.sleep_quality]}
              onValueChange={([value]) => setFormData(prev => ({ ...prev, sleep_quality: value }))}
              max={100}
              step={5}
              className="w-full"
            />
          </div>

          {/* Sleep Hours */}
          <div className="space-y-2">
            <Label>Sleep Hours: {formData.sleep_hours}h</Label>
            <Slider
              value={[formData.sleep_hours]}
              onValueChange={([value]) => setFormData(prev => ({ ...prev, sleep_hours: value }))}
              min={4}
              max={12}
              step={0.5}
              className="w-full"
            />
          </div>

          {/* Soreness */}
          <div className="space-y-2">
            <Label>Soreness Level: {formData.soreness}%</Label>
            <Slider
              value={[formData.soreness]}
              onValueChange={([value]) => setFormData(prev => ({ ...prev, soreness: value }))}
              max={100}
              step={5}
              className="w-full"
            />
          </div>

          {/* Stress */}
          <div className="space-y-2">
            <Label>Stress Level: {formData.stress}%</Label>
            <Slider
              value={[formData.stress]}
              onValueChange={([value]) => setFormData(prev => ({ ...prev, stress: value }))}
              max={100}
              step={5}
              className="w-full"
            />
          </div>

          {/* Supplements */}
          <div className="space-y-2">
            <Label>Supplements Taken</Label>
            <div className="flex gap-2">
              <Input
                value={supplementInput}
                onChange={(e) => setSupplementInput(e.target.value)}
                placeholder="Add supplement"
                onKeyPress={(e) => e.key === 'Enter' && addSupplement()}
              />
              <Button type="button" onClick={addSupplement} size="sm">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {formData.supplements.map((supplement, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {supplement}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeSupplement(index)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Exercise Estimates */}
          {missingEstimates.length > 0 && (
            <div className="space-y-3">
              <Label>Exercise Estimates (10RM)</Label>
              <p className="text-sm text-muted-foreground">
                Please provide weight estimates for exercises you haven't done before:
              </p>
              {missingEstimates.map((exercise) => (
                <div key={exercise.exercise_id} className="flex items-center gap-3">
                  <Label className="flex-1 text-sm">{exercise.exercise_name}</Label>
                  <Input
                    type="number"
                    placeholder="kg"
                    className="w-20"
                    value={formData.estimatesByExercise?.[exercise.exercise_id]?.weight || ''}
                    onChange={(e) => updateEstimate(exercise.exercise_id, Number(e.target.value))}
                  />
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!canSubmit || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Starting...' : 'Start Workout'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}