import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';
import { Dumbbell, Target } from 'lucide-react';
import { toast } from 'sonner';

interface ExerciseEstimate {
  exerciseId: string;
  exerciseName: string;
  type: 'rm10' | 'rm5' | 'rm1' | 'bodyweight';
  estimatedWeight: number;
  estimatedReps?: number;
  confidenceLevel: 'low' | 'medium' | 'high';
  notes?: string;
}

interface ExerciseEstimateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  exercise: {
    id: string;
    name: string;
  };
  onEstimateSaved: (estimate: ExerciseEstimate) => void;
  userId: string;
}

const estimateTypes = [
  { value: 'rm10', label: '10 Rep Max', description: 'Weight you can lift for exactly 10 reps' },
  { value: 'rm5', label: '5 Rep Max', description: 'Weight you can lift for exactly 5 reps' },
  { value: 'rm1', label: '1 Rep Max', description: 'Maximum weight you can lift once' },
  { value: 'bodyweight', label: 'Bodyweight', description: 'For bodyweight exercises (reps only)' }
];

export function ExerciseEstimateDialog({
  isOpen,
  onClose,
  exercise,
  onEstimateSaved,
  userId
}: ExerciseEstimateDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [estimate, setEstimate] = useState<Partial<ExerciseEstimate>>({
    exerciseId: exercise.id,
    exerciseName: exercise.name,
    type: 'rm10',
    estimatedWeight: 0,
    estimatedReps: 10,
    confidenceLevel: 'medium',
    notes: ''
  });

  const handleTypeChange = (type: string) => {
    const newType = type as ExerciseEstimate['type'];
    setEstimate(prev => ({
      ...prev,
      type: newType,
      estimatedReps: newType === 'rm10' ? 10 : newType === 'rm5' ? 5 : newType === 'rm1' ? 1 : undefined
    }));
  };

  const handleSave = async () => {
    if (!estimate.estimatedWeight || estimate.estimatedWeight <= 0) {
      toast.error('Please enter a valid weight estimate');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('user_exercise_estimates')
        .upsert({
          user_id: userId,
          exercise_id: exercise.id,
          type: estimate.type!,
          estimated_weight: estimate.estimatedWeight,
          estimated_reps: estimate.estimatedReps,
          confidence_level: estimate.confidenceLevel!,
          notes: estimate.notes || null
        });

      if (error) throw error;

      onEstimateSaved(estimate as ExerciseEstimate);
      toast.success('Exercise estimate saved');
      onClose();
    } catch (error) {
      console.error('Failed to save estimate:', error);
      toast.error('Failed to save estimate');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedTypeInfo = estimateTypes.find(t => t.value === estimate.type);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Estimate for {exercise.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-muted/50 p-3 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Since this is your first time with this exercise, provide a rough estimate so we can 
              generate appropriate warmup and working sets.
            </p>
          </div>

          {/* Estimate Type */}
          <div className="space-y-3">
            <Label>What kind of estimate can you provide?</Label>
            <RadioGroup
              value={estimate.type}
              onValueChange={handleTypeChange}
              className="space-y-2"
            >
              {estimateTypes.map(type => (
                <div key={type.value} className="flex items-start space-x-2">
                  <RadioGroupItem value={type.value} id={type.value} className="mt-1" />
                  <div className="space-y-1">
                    <Label htmlFor={type.value} className="font-medium">
                      {type.label}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {type.description}
                    </p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Weight Input */}
          {estimate.type !== 'bodyweight' && (
            <div className="space-y-2">
              <Label>Estimated Weight (kg)</Label>
              <Input
                type="number"
                step="2.5"
                min="0"
                value={estimate.estimatedWeight || ''}
                onChange={(e) => setEstimate(prev => ({ 
                  ...prev, 
                  estimatedWeight: parseFloat(e.target.value) || 0 
                }))}
                placeholder="Enter weight in kg"
              />
            </div>
          )}

          {/* Reps Input for bodyweight */}
          {estimate.type === 'bodyweight' && (
            <div className="space-y-2">
              <Label>Maximum Reps</Label>
              <Input
                type="number"
                min="1"
                value={estimate.estimatedReps || ''}
                onChange={(e) => setEstimate(prev => ({ 
                  ...prev, 
                  estimatedReps: parseInt(e.target.value) || 0 
                }))}
                placeholder="Max reps you can do"
              />
            </div>
          )}

          {/* Confidence Level */}
          <div className="space-y-3">
            <Label>How confident are you in this estimate?</Label>
            <div className="flex gap-2">
              {(['low', 'medium', 'high'] as const).map(level => (
                <Button
                  key={level}
                  variant={estimate.confidenceLevel === level ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setEstimate(prev => ({ ...prev, confidenceLevel: level }))}
                  className="flex-1"
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea
              placeholder="Any context about this estimate? (e.g., 'Haven't done this in months', 'Based on similar exercise')"
              value={estimate.notes}
              onChange={(e) => setEstimate(prev => ({ ...prev, notes: e.target.value }))}
              rows={2}
            />
          </div>

          {/* Summary */}
          {selectedTypeInfo && estimate.estimatedWeight > 0 && (
            <div className="bg-primary/10 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Dumbbell className="h-4 w-4" />
                <span className="font-medium text-sm">Estimate Summary</span>
              </div>
              <div className="text-sm">
                <Badge variant="outline" className="mr-2">
                  {selectedTypeInfo.label}
                </Badge>
                {estimate.type !== 'bodyweight' ? (
                  <span>{estimate.estimatedWeight}kg for {estimate.estimatedReps} reps</span>
                ) : (
                  <span>{estimate.estimatedReps} max reps</span>
                )}
                <span className="text-muted-foreground ml-2">
                  ({estimate.confidenceLevel} confidence)
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isLoading || !estimate.estimatedWeight}
            >
              {isLoading ? 'Saving...' : 'Save Estimate'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}