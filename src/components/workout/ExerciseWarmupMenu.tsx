import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, CheckCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WarmupStep {
  weight: number;
  reps: number;
  percentage: number;
  isCompleted: boolean;
}

interface ExerciseWarmupMenuProps {
  targetWeight: number;
  onStepComplete: (step: WarmupStep, stepIndex: number) => void;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export const ExerciseWarmupMenu: React.FC<ExerciseWarmupMenuProps> = ({
  targetWeight,
  onStepComplete,
  isOpen,
  onClose,
  className
}) => {
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  if (!isOpen) {
    return null;
  }

  // Generate warmup ladder
  const generateWarmupSteps = (target: number): WarmupStep[] => {
    if (target <= 20) return []; // No warmup needed for light weights
    
    const steps: WarmupStep[] = [];
    const percentages = [40, 60, 75];
    const repsProgression = [8, 5, 3];
    
    percentages.forEach((percentage, index) => {
      const weight = Math.round((target * percentage / 100) / 2.5) * 2.5; // Round to nearest 2.5kg
      if (weight > 0) {
        steps.push({
          weight,
          reps: repsProgression[index],
          percentage,
          isCompleted: completedSteps.has(index)
        });
      }
    });
    
    return steps;
  };

  const warmupSteps = generateWarmupSteps(targetWeight);

  const handleStepComplete = async (step: WarmupStep, stepIndex: number) => {
    setCompletedSteps(prev => new Set([...prev, stepIndex]));
    await onStepComplete(step, stepIndex);
  };

  if (warmupSteps.length === 0) {
    return (
      <Card className={cn("border-0 shadow-none bg-muted/30", className)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-muted-foreground">Warm-up</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            No warm-up needed for this weight
          </p>
        </CardContent>
      </Card>
    );
  }

  const completedCount = completedSteps.size;
  const totalSteps = warmupSteps.length;

  return (
    <Card className={cn("border-0 shadow-none bg-muted/30", className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4" />
            <h3 className="text-sm font-medium text-muted-foreground">
              Warm-up ({completedCount}/{totalSteps})
            </h3>
            {completedCount === totalSteps && (
              <CheckCircle className="w-4 h-4 text-green-500" />
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground mb-3">
          Progressive warmup to {targetWeight}kg working weight
        </div>
        
        <div className="space-y-2">
          {warmupSteps.map((step, index) => (
            <div
              key={index}
              className={cn(
                "flex items-center justify-between p-2 rounded border",
                step.isCompleted ? "bg-green-50 border-green-200" : "bg-background"
              )}
            >
              <div className="flex items-center gap-2">
                <Badge variant={step.isCompleted ? "default" : "secondary"} className="text-xs">
                  {step.percentage}%
                </Badge>
                <div className="text-sm">
                  <span className="font-medium">{step.weight}kg</span>
                  <span className="text-muted-foreground"> × {step.reps}</span>
                </div>
              </div>
              
              <Button
                variant={step.isCompleted ? "outline" : "default"}
                size="sm"
                disabled={step.isCompleted}
                onClick={() => handleStepComplete(step, index)}
                className="text-xs h-7 px-2"
              >
                {step.isCompleted ? (
                  <>
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Done
                  </>
                ) : (
                  'Log'
                )}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ExerciseWarmupMenu;