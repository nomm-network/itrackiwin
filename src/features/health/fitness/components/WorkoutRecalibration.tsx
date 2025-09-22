import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { TrendingUp, TrendingDown, Minus, Target, CheckCircle } from 'lucide-react';
import { useWorkoutRecalibration } from '../hooks/useRecalibration.hook';
import { RecalibrationPanel } from './RecalibrationPanel';

interface WorkoutRecalibrationProps {
  workoutId: string;
  exerciseIds: string[];
  onApplyPrescriptions?: (prescriptions: any[]) => void;
}

export function WorkoutRecalibration({ 
  workoutId, 
  exerciseIds, 
  onApplyPrescriptions 
}: WorkoutRecalibrationProps) {
  const { data: recalibrations, isLoading, error } = useWorkoutRecalibration(exerciseIds);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analyzing Performance...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {exerciseIds.map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <p className="text-destructive text-center">
            Failed to analyze workout performance. Please try again.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!recalibrations || !recalibrations.recommendations || recalibrations.recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Analysis Available</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center">
            Complete more workouts to get personalized prescriptions.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getProgressionIcon = (percentage: number) => {
    if (percentage > 5) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (percentage < -5) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-yellow-500" />;
  };

  const getProgressionColor = (percentage: number) => {
    if (percentage > 5) return 'text-green-600 bg-green-50 border-green-200';
    if (percentage < -5) return 'text-red-600 bg-red-50 border-red-200';
    return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  };

  const handleApplyAll = () => {
    if (onApplyPrescriptions && recalibrations?.recommendations) {
      onApplyPrescriptions(recalibrations.recommendations);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Workout Analysis & Next Session Plan
          </CardTitle>
          
          <Button onClick={handleApplyAll} size="sm">
            <CheckCircle className="h-4 w-4 mr-2" />
            Apply All Prescriptions
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="max-h-[600px]">
          <div className="space-y-4">
            {recalibrations.recommendations?.map((recal, index) => (
              <div key={recal.exercise_id || index}>
                <RecalibrationPanel
                  exerciseId={recal.exercise_id}
                  exerciseName={`Exercise ${index + 1}`}
                  onApplyPrescription={(prescription) => {
                    console.log('Applied prescription for exercise', prescription);
                  }}
                />
                
                {index < (recalibrations.recommendations?.length || 0) - 1 && (
                  <Separator className="my-4" />
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Summary */}
        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Analyzed {recalibrations.recommendations?.length || 0} exercises
            </span>
            
            <div className="flex gap-2">
              {recalibrations.recommendations?.map((recal) => (
                <Badge
                  key={recal.exercise_id}
                  variant="secondary"
                  className={`text-xs ${getProgressionColor(0)}`}
                >
                  {getProgressionIcon(0)}
                  0%
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}