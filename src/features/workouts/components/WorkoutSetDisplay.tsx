import React from 'react';
import { Badge } from '@/components/ui/badge';
import { MixedUnitWeightDisplay } from './MixedUnitWeightDisplay';

interface WorkoutSetDisplayProps {
  targetWeight?: number;
  actualWeight?: number;
  targetReps?: number;
  actualReps?: number;
  setIndex: number;
  isCompleted?: boolean;
  showConversionHint?: boolean;
  className?: string;
}

export function WorkoutSetDisplay({
  targetWeight,
  actualWeight,
  targetReps,
  actualReps,
  setIndex,
  isCompleted = false,
  showConversionHint = true,
  className = ""
}: WorkoutSetDisplayProps) {
  const displayWeight = actualWeight ?? targetWeight;
  const displayReps = actualReps ?? targetReps;

  return (
    <div className={`flex items-center justify-between p-3 rounded-lg border ${
      isCompleted ? 'bg-muted' : 'bg-background'
    } ${className}`}>
      <div className="flex items-center gap-3">
        <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center text-xs">
          {setIndex}
        </Badge>
        
        <div className="flex items-center gap-2">
          {displayWeight && (
            <MixedUnitWeightDisplay
              weight={displayWeight}
              nativeUnit="kg"
              displayUnit="kg"
              showConversionHint={showConversionHint}
              className="text-sm"
            />
          )}
          
          {displayReps && (
            <span className="text-sm text-muted-foreground">
              × {displayReps} reps
            </span>
          )}
        </div>
      </div>
      
      {isCompleted && (
        <Badge variant="default" className="text-xs">
          ✓ Done
        </Badge>
      )}
    </div>
  );
}