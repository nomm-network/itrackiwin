import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { 
  Clock, 
  TrendingUp, 
  Target, 
  Zap,
  ChevronUp,
  ChevronDown,
  Play
} from 'lucide-react';
import { QuickSetEntry } from './QuickSetEntry';
import { EnhancedRestTimer } from './EnhancedRestTimer';

interface SetData {
  id?: string;
  weight?: number;
  reps?: number;
  rpe?: number;
  notes?: string;
  set_index?: number;
  is_completed?: boolean;
}

interface ExerciseData {
  id: string;
  name: string;
  order_index: number;
  notes?: string;
}

interface SessionRunnerProps {
  exercise: ExerciseData;
  completedSets: SetData[];
  targetSet?: SetData;
  unit: string;
  onSetComplete: (setData: SetData) => void;
  onExerciseComplete: () => void;
  isLoading?: boolean;
  className?: string;
}

export const SessionRunner: React.FC<SessionRunnerProps> = ({
  exercise,
  completedSets,
  targetSet,
  unit,
  onSetComplete,
  onExerciseComplete,
  isLoading = false,
  className
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [restDuration, setRestDuration] = useState(180);
  const [lastSetId, setLastSetId] = useState<string | null>(null);

  const lastSet = completedSets[completedSets.length - 1];
  const nextSetIndex = completedSets.length + 1;
  const isCompleted = completedSets.length >= 3; // Assume 3 sets target

  const handleSetComplete = async (setData: SetData) => {
    const completeSetData = {
      ...setData,
      set_index: nextSetIndex,
      is_completed: true
    };

    await onSetComplete(completeSetData);
    setLastSetId(completeSetData.id || Date.now().toString());
    
    // Auto-start rest timer
    const suggestedRest = calculateRestTime(setData.rpe);
    setRestDuration(suggestedRest);
    setShowRestTimer(true);
  };

  const calculateRestTime = (rpe?: number): number => {
    if (!rpe) return 180; // Default 3 minutes
    
    if (rpe >= 9) return 300; // 5 minutes for RPE 9-10
    if (rpe >= 8) return 240; // 4 minutes for RPE 8-9
    if (rpe >= 7) return 180; // 3 minutes for RPE 7-8
    if (rpe >= 6) return 120; // 2 minutes for RPE 6-7
    return 90; // 1.5 minutes for RPE < 6
  };

  const handleRestComplete = () => {
    setShowRestTimer(false);
    
    if (isCompleted) {
      onExerciseComplete();
    }
  };

  const handleRestSkip = () => {
    setShowRestTimer(false);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Exercise Header */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader 
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant="outline">#{exercise.order_index}</Badge>
              <CardTitle className="text-lg">{exercise.name}</CardTitle>
              {isCompleted && (
                <Badge variant="default" className="bg-green-500">
                  Complete
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {completedSets.length}/3 sets
              </Badge>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          {/* Quick Stats when collapsed */}
          {!isExpanded && lastSet && (
            <div className="text-sm text-muted-foreground">
              Last: {lastSet.weight}{unit} × {lastSet.reps} reps
              {lastSet.rpe && ` • RPE ${lastSet.rpe}`}
            </div>
          )}
        </CardHeader>

        {isExpanded && (
          <CardContent className="space-y-4">
            {/* Progress Indicator */}
            <div className="flex gap-2">
              {[1, 2, 3].map((setNum) => {
                const setCompleted = completedSets.find(s => s.set_index === setNum);
                return (
                  <div
                    key={setNum}
                    className={cn(
                      "flex-1 h-2 rounded-full",
                      setCompleted 
                        ? "bg-green-500" 
                        : setNum === nextSetIndex 
                          ? "bg-yellow-400" 
                          : "bg-muted"
                    )}
                  />
                );
              })}
            </div>

            {/* Completed Sets Display */}
            {completedSets.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Completed Sets</h4>
                {completedSets.map((set, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-xs">
                        Set {set.set_index}
                      </Badge>
                      <span className="font-medium">
                        {set.weight}{unit} × {set.reps} reps
                      </span>
                      {set.rpe && (
                        <Badge variant="secondary" className="text-xs">
                          RPE {set.rpe}
                        </Badge>
                      )}
                    </div>
                    {set.notes && (
                      <span className="text-xs text-muted-foreground">{set.notes}</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            <Separator />

            {/* Set Entry Form */}
            {!isCompleted && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  <h4 className="font-medium">Set {nextSetIndex}</h4>
                  {targetSet && (
                    <Badge variant="outline" className="text-xs">
                      Target: {targetSet.weight}{unit} × {targetSet.reps}
                    </Badge>
                  )}
                </div>

                <QuickSetEntry
                  unit={unit}
                  lastSet={lastSet}
                  targetSet={targetSet}
                  onSetComplete={handleSetComplete}
                  onRestTimerStart={setRestDuration}
                  isLoading={isLoading}
                />
              </div>
            )}

            {/* Exercise Complete Actions */}
            {isCompleted && (
              <div className="flex items-center justify-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="text-center">
                  <p className="text-green-700 dark:text-green-300 font-medium mb-2">
                    🎉 Exercise Complete!
                  </p>
                  <Button 
                    onClick={onExerciseComplete}
                    variant="default"
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Continue to Next Exercise
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Rest Timer Modal/Overlay */}
      {showRestTimer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm">
            <EnhancedRestTimer
              suggestedSeconds={restDuration}
              workoutSetId={lastSetId || undefined}
              onComplete={handleRestComplete}
              onSkip={handleRestSkip}
              isActive={true}
              className="shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};