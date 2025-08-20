import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";

export interface SupersetExercise {
  id: string;
  name: string;
  order_index: number;
  completedSets: number;
  totalSets: number;
}

export interface SupersetGroup {
  id: string;
  name: string;
  exercises: SupersetExercise[];
  currentExerciseIndex: number;
  currentRound: number;
  totalRounds: number;
  isCompleted: boolean;
}

interface SupersetNavigatorProps {
  superset: SupersetGroup;
  onExerciseChange: (exerciseIndex: number) => void;
  onRoundComplete: () => void;
  onSupersetComplete: () => void;
  className?: string;
}

const SupersetNavigator: React.FC<SupersetNavigatorProps> = ({
  superset,
  onExerciseChange,
  onRoundComplete,
  onSupersetComplete,
  className
}) => {
  const currentExercise = superset.exercises[superset.currentExerciseIndex];
  const isLastExerciseInRound = superset.currentExerciseIndex === superset.exercises.length - 1;
  const isFirstExerciseInRound = superset.currentExerciseIndex === 0;
  const isLastRound = superset.currentRound === superset.totalRounds;

  const handleNext = () => {
    if (isLastExerciseInRound) {
      if (isLastRound) {
        onSupersetComplete();
      } else {
        onRoundComplete();
        onExerciseChange(0); // Start next round with first exercise
      }
    } else {
      onExerciseChange(superset.currentExerciseIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstExerciseInRound) {
      onExerciseChange(superset.currentExerciseIndex - 1);
    }
  };

  const calculateProgress = () => {
    const totalExerciseSlots = superset.exercises.length * superset.totalRounds;
    const completedSlots = (superset.currentRound - 1) * superset.exercises.length + superset.currentExerciseIndex;
    return Math.min((completedSlots / totalExerciseSlots) * 100, 100);
  };

  if (superset.isCompleted) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="text-center p-6">
          <div className="space-y-3">
            <div className="text-2xl">🎉</div>
            <h3 className="text-lg font-semibold text-green-600">
              Superset Complete!
            </h3>
            <p className="text-sm text-muted-foreground">
              Great work on completing {superset.name}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{superset.name}</CardTitle>
          <Badge variant="outline">
            Round {superset.currentRound}/{superset.totalRounds}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Exercise */}
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-1">
            {currentExercise?.name || 'Exercise'}
          </h3>
          <p className="text-sm text-muted-foreground">
            Exercise {superset.currentExerciseIndex + 1} of {superset.exercises.length}
          </p>
        </div>

        {/* Exercise List */}
        <div className="space-y-2">
          {superset.exercises.map((exercise, index) => (
            <div
              key={exercise.id}
              className={cn(
                "flex items-center justify-between p-2 rounded-md border transition-colors",
                index === superset.currentExerciseIndex 
                  ? "bg-primary/10 border-primary" 
                  : "bg-muted/50"
              )}
            >
              <span className={cn(
                "text-sm",
                index === superset.currentExerciseIndex && "font-medium"
              )}>
                {exercise.name}
              </span>
              <Badge 
                variant={index === superset.currentExerciseIndex ? "default" : "secondary"}
                className="text-xs"
              >
                {index < superset.currentExerciseIndex ? "✓" : 
                 index === superset.currentExerciseIndex ? "Current" : "Pending"}
              </Badge>
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>{Math.round(calculateProgress())}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${calculateProgress()}%` }}
            />
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            disabled={isFirstExerciseInRound && superset.currentRound === 1}
            className="flex-1"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onExerciseChange(0)}
            disabled={superset.currentExerciseIndex === 0}
            className="px-3"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>

          <Button
            size="sm"
            onClick={handleNext}
            className="flex-1"
          >
            {isLastExerciseInRound ? (
              isLastRound ? (
                "Complete Superset"
              ) : (
                "Next Round"
              )
            ) : (
              <>
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </>
            )}
          </Button>
        </div>

        {/* Rest Instructions */}
        {isLastExerciseInRound && !isLastRound && (
          <div className="text-center p-2 bg-blue-50 rounded-md border border-blue-200">
            <p className="text-sm text-blue-700">
              Take a longer rest between rounds (2-3 minutes)
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SupersetNavigator;