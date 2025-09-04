import React from 'react';
import { Badge } from '@/components/ui/badge';

interface WarmupStep {
  pct: number;
  reps: number;
  rest_s: number;
  weight_kg: number;
}

interface WarmupDisplayProps {
  steps: WarmupStep[];
  targetWeight: number;
  readinessScore?: number;
  sourceInfo?: {
    date: string;
    score: number;
    multiplier: number;
  };
}

export function WarmupDisplay({ steps, targetWeight, readinessScore, sourceInfo }: WarmupDisplayProps) {
  const getReadinessColor = (score?: number) => {
    if (!score) return 'secondary';
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  const getReadinessLabel = (score?: number) => {
    if (!score) return 'Unknown';
    if (score >= 80) return 'Great';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Low';
    return 'Poor';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Warm-up Plan</h3>
        {readinessScore && (
          <Badge variant={getReadinessColor(readinessScore)}>
            {getReadinessLabel(readinessScore)} ({readinessScore})
          </Badge>
        )}
      </div>

      <div className="bg-muted/50 rounded-lg p-3 space-y-2">
        <div className="text-sm font-medium">Target: {targetWeight}kg</div>
        
        {sourceInfo && (
          <div className="text-xs text-muted-foreground">
            Base from {sourceInfo.date} (score {sourceInfo.score}) × {sourceInfo.multiplier} = {targetWeight}kg
          </div>
        )}
        
        <div className="space-y-2">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <span>Set {index + 1}: {step.weight_kg}kg × {step.reps}</span>
              <span className="text-muted-foreground">{Math.floor(step.rest_s / 60)}:{(step.rest_s % 60).toString().padStart(2, '0')}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}