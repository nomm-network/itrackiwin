import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Circle } from 'lucide-react';

interface WarmupStep {
  percent: number;
  reps: number;
  weight_kg: number;
  rest_s: number;
  completed?: boolean;
}

interface Exercise {
  id: string;
  target_weight_kg?: number;
  exercises?: {
    display_name: string;
  };
}

interface Props {
  exercise: Exercise;
  warmupSteps?: WarmupStep[];
  onStepComplete?: (stepIndex: number) => void;
}

const WarmupCard: React.FC<Props> = ({ exercise, warmupSteps, onStepComplete }) => {
  const targetWeight = exercise.target_weight_kg || 0;
  const exerciseName = exercise.exercises?.display_name || 'Exercise';

  // Default warmup progression if not provided
  const defaultSteps: WarmupStep[] = [
    { percent: 40, reps: 12, weight_kg: Math.round(targetWeight * 0.4 * 2) / 2, rest_s: 60 },
    { percent: 60, reps: 8, weight_kg: Math.round(targetWeight * 0.6 * 2) / 2, rest_s: 90 },
    { percent: 80, reps: 5, weight_kg: Math.round(targetWeight * 0.8 * 2) / 2, rest_s: 120 },
  ];

  const steps = warmupSteps || defaultSteps;

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          🔥 Warmup - {exerciseName}
          <Badge variant="outline">
            {targetWeight}kg working weight
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div 
              key={index}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                step.completed ? 'bg-green-50 border-green-200' : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onStepComplete?.(index)}
                  className="p-0 h-6 w-6"
                >
                  {step.completed ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400" />
                  )}
                </Button>
                <div>
                  <div className="font-medium">
                    {step.weight_kg}kg × {step.reps} reps
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {step.percent}% of working weight
                  </div>
                </div>
              </div>
              <Badge variant="secondary">
                Rest {step.rest_s}s
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default WarmupCard;