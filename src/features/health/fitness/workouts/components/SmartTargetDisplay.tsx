import React from 'react';
import { WarmupStep } from '../../readiness/types';

interface SmartTargetDisplayProps {
  targetWeight: number | null;
  readinessScore: number | null;
  warmupSteps: WarmupStep[] | null;
  baseSource?: 'recent_workout' | 'template' | 'estimate' | null;
}

export function SmartTargetDisplay({ 
  targetWeight, 
  readinessScore, 
  warmupSteps,
  baseSource 
}: SmartTargetDisplayProps) {
  const getReadinessColor = (score: number | null) => {
    if (!score) return 'text-muted-foreground';
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getBaseSourceText = (source: string | null) => {
    switch (source) {
      case 'recent_workout': return 'from recent workout';
      case 'template': return 'from template';
      case 'estimate': return 'from estimate';
      default: return '';
    }
  };

  return (
    <div className="rounded-lg border p-3 bg-muted/30 space-y-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span>🎯</span>
          {targetWeight ? (
            <span>
              Target: <strong>{targetWeight}kg</strong>
              {baseSource && (
                <span className="text-muted-foreground ml-1">
                  {getBaseSourceText(baseSource)}
                </span>
              )}
            </span>
          ) : (
            <span className="text-muted-foreground">No target available</span>
          )}
        </div>
        
        {readinessScore !== null && (
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">Readiness:</span>
            <span className={`text-xs font-medium ${getReadinessColor(readinessScore)}`}>
              {Math.round(readinessScore)}%
            </span>
          </div>
        )}
      </div>

      {warmupSteps && warmupSteps.length > 0 && (
        <div className="text-xs space-y-1">
          <div className="text-muted-foreground font-medium">Warmup Steps:</div>
          {warmupSteps.map((step, index) => (
            <div key={index} className="flex justify-between items-center">
              <span>{step.weight_kg}kg × {step.reps}</span>
              <span className="text-muted-foreground">{step.rest_s}s rest</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}