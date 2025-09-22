import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { PreWorkoutReadiness } from './PreWorkoutReadiness';
import { ExerciseEstimateDialog } from './ExerciseEstimateDialog';
import { usePreWorkout } from '../hooks/usePreWorkout';
import { Zap, Target, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Exercise {
  id: string;
  name: string;
}

interface PreWorkoutFlowProps {
  isOpen: boolean;
  onClose: () => void;
  workoutId: string;
  userId: string;
  exercises: Exercise[];
  onComplete: () => void;
}

type FlowStep = 'readiness' | 'estimates' | 'complete';

export function PreWorkoutFlow({
  isOpen,
  onClose,
  workoutId,
  userId,
  exercises,
  onComplete
}: PreWorkoutFlowProps) {
  const [currentStep, setCurrentStep] = useState<FlowStep>('readiness');
  const [exercisesNeedingEstimates, setExercisesNeedingEstimates] = useState<string[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [estimatesCompleted, setEstimatesCompleted] = useState<Set<string>>(new Set());
  
  const {
    saveReadinessData,
    getExercisesWithoutHistory,
    checkWorkoutReadiness,
    isLoading
  } = usePreWorkout({ workoutId, userId });

  // Check if readiness is already done and what exercises need estimates
  useEffect(() => {
    const initializeFlow = async () => {
      try {
        // Check if readiness already completed
        const readinessCompleted = await checkWorkoutReadiness(workoutId);
        
        // Get exercises that need estimates
        const exerciseIds = exercises.map(e => e.id);
        const needingEstimates = await getExercisesWithoutHistory(exerciseIds);
        
        setExercisesNeedingEstimates(needingEstimates);
        
        if (readinessCompleted && needingEstimates.length === 0) {
          // Both completed, can start workout
          setCurrentStep('complete');
        } else if (readinessCompleted) {
          // Skip to estimates
          setCurrentStep('estimates');
        } else {
          // Start with readiness
          setCurrentStep('readiness');
        }
      } catch (error) {
        console.error('Failed to initialize pre-workout flow:', error);
        toast.error('Failed to check workout status');
      }
    };

    if (isOpen) {
      initializeFlow();
    }
  }, [isOpen, workoutId, exercises, checkWorkoutReadiness, getExercisesWithoutHistory]);

  const handleReadinessComplete = async (data: any) => {
    try {
      await saveReadinessData(data);
      toast.success('Readiness check completed');
      
      if (exercisesNeedingEstimates.length > 0) {
        setCurrentStep('estimates');
      } else {
        setCurrentStep('complete');
      }
    } catch (error) {
      toast.error('Failed to save readiness data');
    }
  };

  const handleEstimateComplete = (estimate: any) => {
    const newCompleted = new Set(estimatesCompleted);
    newCompleted.add(estimate.exerciseId);
    setEstimatesCompleted(newCompleted);

    // Move to next exercise or complete
    if (currentExerciseIndex < exercisesNeedingEstimates.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
    } else {
      setCurrentStep('complete');
    }
  };

  const handleSkipEstimates = () => {
    setCurrentStep('complete');
  };

  const handleStartWorkout = () => {
    onComplete();
    onClose();
  };

  const currentExercise = exercisesNeedingEstimates[currentExerciseIndex];
  const currentExerciseData = exercises.find(e => e.id === currentExercise);
  
  const progress = {
    readiness: currentStep !== 'readiness',
    estimates: estimatesCompleted.size,
    total: exercisesNeedingEstimates.length
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Pre-Workout Setup
          </DialogTitle>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            {progress.readiness ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <div className="h-4 w-4 rounded-full border-2 border-primary" />
            )}
            <span className={progress.readiness ? 'text-green-600' : 'text-primary'}>
              Readiness Check
            </span>
          </div>
          
          <Separator orientation="horizontal" className="flex-1" />
          
          <div className="flex items-center gap-2">
            {progress.estimates === progress.total && progress.total > 0 ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />
            )}
            <span className={progress.estimates === progress.total ? 'text-green-600' : 'text-muted-foreground'}>
              Exercise Estimates ({progress.estimates}/{progress.total})
            </span>
          </div>
          
          <Separator orientation="horizontal" className="flex-1" />
          
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Start Workout</span>
          </div>
        </div>

        <Separator />

        {/* Content based on current step */}
        {currentStep === 'readiness' && (
          <PreWorkoutReadiness
            onSubmit={handleReadinessComplete}
            onSkip={() => setCurrentStep(exercisesNeedingEstimates.length > 0 ? 'estimates' : 'complete')}
            isLoading={isLoading}
          />
        )}

        {currentStep === 'estimates' && currentExerciseData && (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="font-medium">Exercise Estimates</h3>
              <p className="text-sm text-muted-foreground">
                Exercise {currentExerciseIndex + 1} of {exercisesNeedingEstimates.length}
              </p>
            </div>
            
            <ExerciseEstimateDialog
              isOpen={true}
              onClose={() => {}}
              exercise={currentExerciseData}
              onEstimateSaved={handleEstimateComplete}
              userId={userId}
            />
            
            <div className="flex justify-center">
              <Button variant="ghost" onClick={handleSkipEstimates}>
                Skip remaining estimates
              </Button>
            </div>
          </div>
        )}

        {currentStep === 'complete' && (
          <div className="text-center space-y-6 py-8">
            <div className="space-y-2">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              <h3 className="text-xl font-semibold">Ready to Workout!</h3>
              <p className="text-muted-foreground">
                Your workout is optimized and ready to begin
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Readiness check:</span>
                <span className="text-green-600">✓ Complete</span>
              </div>
              {exercisesNeedingEstimates.length > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Exercise estimates:</span>
                  <span className="text-green-600">
                    ✓ {estimatesCompleted.size}/{exercisesNeedingEstimates.length} Complete
                  </span>
                </div>
              )}
            </div>

            <Button onClick={handleStartWorkout} size="lg" className="w-full">
              Start Workout
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}