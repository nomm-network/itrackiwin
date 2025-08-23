import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Plus, ArrowRight, Timer, Target } from 'lucide-react';

interface MobileWorkoutFooterProps {
  onAddSet: () => void;
  onNext: () => void;
  canAddSet: boolean;
  isExerciseComplete: boolean;
  isLastExercise: boolean;
  restTimeRemaining?: number;
  className?: string;
}

export const MobileWorkoutFooter: React.FC<MobileWorkoutFooterProps> = ({
  onAddSet,
  onNext,
  canAddSet,
  isExerciseComplete,
  isLastExercise,
  restTimeRemaining,
  className
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn("p-4 border-t bg-card/95 backdrop-blur-sm", className)}>
      {/* Rest timer indicator */}
      {restTimeRemaining && restTimeRemaining > 0 && (
        <div className="flex items-center justify-center gap-2 mb-3 text-sm text-muted-foreground">
          <Timer className="h-4 w-4" />
          <span>Rest: {formatTime(restTimeRemaining)}</span>
        </div>
      )}

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={onAddSet}
          disabled={!canAddSet || isExerciseComplete}
          size="lg"
          className={cn(
            "h-14 text-lg touch-target-comfortable transition-all duration-200",
            "active:scale-95"
          )}
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Set
        </Button>
        
        <Button
          onClick={onNext}
          variant={isExerciseComplete ? "default" : "outline"}
          size="lg"
          className={cn(
            "h-14 text-lg touch-target-comfortable transition-all duration-200",
            "active:scale-95",
            isExerciseComplete && "bg-green-600 hover:bg-green-700"
          )}
        >
          {isExerciseComplete ? (
            <>
              <Target className="h-5 w-5 mr-2" />
              {isLastExercise ? 'Finish' : 'Next Exercise'}
            </>
          ) : (
            <>
              <ArrowRight className="h-5 w-5 mr-2" />
              Skip to Next
            </>
          )}
        </Button>
      </div>

      {/* Progress hint */}
      {!isExerciseComplete && (
        <div className="text-center mt-2">
          <span className="text-xs text-muted-foreground">
            Complete all sets to continue
          </span>
        </div>
      )}
    </div>
  );
};