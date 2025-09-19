import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Flame, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WarmupStep {
  weight: number;
  reps: number;
  percentage: number;
  isCompleted: boolean;
}

interface WarmupBuilderProps {
  targetWeight: number;
  exerciseId: string;
  onStepComplete: (step: WarmupStep, stepIndex: number) => void;
  className?: string;
}

export const WarmupBuilder: React.FC<WarmupBuilderProps> = ({
  targetWeight,
  exerciseId,
  onStepComplete,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

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
    return null;
  }

  const completedCount = completedSteps.size;
  const totalSteps = warmupSteps.length;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={className}>
      <CollapsibleTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4" />
            <span>Warm-up ({completedCount}/{totalSteps})</span>
            {completedCount === totalSteps && (
              <CheckCircle className="w-4 h-4 text-green-500" />
            )}
          </div>
          <ChevronDown className={cn(
            "w-4 h-4 transition-transform", 
            isOpen && "rotate-180"
          )} />
        </Button>
      </CollapsibleTrigger>
      
      <CollapsibleContent className="space-y-2 mt-2">
        <div className="text-sm text-muted-foreground mb-3">
          Progressive warmup to {targetWeight}kg working weight
        </div>
        
        {warmupSteps.map((step, index) => (
          <div
            key={index}
            className={cn(
              "flex items-center justify-between p-3 rounded-lg border",
              step.isCompleted ? "bg-green-50 border-green-200" : "bg-muted"
            )}
          >
            <div className="flex items-center gap-3">
              <Badge variant={step.isCompleted ? "default" : "secondary"}>
                {step.percentage}%
              </Badge>
              <div className="text-sm">
                <span className="font-medium">{step.weight}kg</span>
                <span className="text-muted-foreground"> × {step.reps} reps</span>
              </div>
            </div>
            
            <Button
              variant={step.isCompleted ? "outline" : "default"}
              size="sm"
              disabled={step.isCompleted}
              onClick={() => handleStepComplete(step, index)}
            >
              {step.isCompleted ? (
                <>
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Done
                </>
              ) : (
                'Log Set'
              )}
            </Button>
          </div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
};

export default WarmupBuilder;