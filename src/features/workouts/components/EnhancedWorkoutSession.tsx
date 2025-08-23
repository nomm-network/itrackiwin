import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Pause, 
  CheckCircle, 
  Timer, 
  Target,
  Settings,
  ArrowLeft,
  ArrowRight,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ExerciseCard from './ExerciseCard';
import { WarmupEditor } from '@/features/health/fitness/components/WarmupEditor';
import { WorkoutRecalibration } from '@/features/health/fitness/components/WorkoutRecalibration';
import { GymConstraintsFilter } from '@/features/health/fitness/components/GymConstraintsFilter';
import { useMyGym } from '@/features/health/fitness/hooks/useMyGym.hook';
import { useLogSet } from '../hooks';
import { useAdvanceProgramState } from '@/hooks/useTrainingPrograms';
import { toast } from 'sonner';

interface WorkoutSessionProps {
  workout: any;
}

export default function EnhancedWorkoutSession({ workout }: WorkoutSessionProps) {
  const navigate = useNavigate();
  const { mutate: logSet } = useLogSet();
  const { gym } = useMyGym();
  const advanceProgramState = useAdvanceProgramState();
  
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [showWarmupEditor, setShowWarmupEditor] = useState(false);
  const [showRecalibration, setShowRecalibration] = useState(false);
  const [workoutStartTime] = useState(new Date());

  const currentExercise = workout?.exercises?.[currentExerciseIndex];
  const totalExercises = workout?.exercises?.length || 0;
  const progressPercentage = totalExercises > 0 ? (completedExercises.size / totalExercises) * 100 : 0;

  // Filter exercises based on gym constraints
  const filteredExercises = useMemo(() => {
    if (!workout?.exercises || !gym) return workout?.exercises || [];
    
    // This would integrate with GymConstraintsFilter logic
    return workout.exercises.filter((exercise: any) => {
      // Basic gym equipment filtering logic would go here
      return true; // For now, show all exercises
    });
  }, [workout?.exercises, gym]);

  const handleSetComplete = (exerciseId: string, setData: any) => {
    logSet({
      workout_exercise_id: exerciseId,
      weight: setData.weight,
      reps: setData.reps,
      rpe: setData.rpe,
      notes: setData.feel ? `Feel: ${setData.feel}` : undefined,
      is_completed: true
    });
  };

  const handleExerciseComplete = (exerciseId: string) => {
    setCompletedExercises(prev => new Set([...prev, exerciseId]));
    
    // Auto-advance to next exercise
    if (currentExerciseIndex < totalExercises - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    }
  };

  const handlePreviousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1);
    }
  };

  const handleNextExercise = () => {
    if (currentExerciseIndex < totalExercises - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    }
  };

  const handleWorkoutComplete = async () => {
    try {
      // Mark workout as completed
      // This would call the appropriate API
      
      // Advance program state if this was from a program
      if (workout.program_block_id) {
        await advanceProgramState.mutateAsync(workout.program_block_id);
      }
      
      // Show recalibration
      setShowRecalibration(true);
      
      toast.success('Workout completed! 🎉');
    } catch (error) {
      console.error('Failed to complete workout:', error);
      toast.error('Failed to complete workout');
    }
  };

  const handleFinishWorkout = () => {
    navigate('/dashboard');
  };

  if (!workout?.exercises?.length) {
    return (
      <Card className="m-6">
        <CardContent className="pt-6 text-center">
          <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-medium mb-2">No exercises found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            This workout doesn't have any exercises yet.
          </p>
          <Button onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Workout Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                {workout.title || 'Active Workout'}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Started at {workoutStartTime.toLocaleTimeString()}
                {gym && ` • ${gym.name}`}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {completedExercises.size}/{totalExercises} exercises
              </Badge>
              {workout.program_block_id && (
                <Badge variant="default" className="bg-green-500">
                  Program
                </Badge>
              )}
            </div>
          </div>
          
          <Progress value={progressPercentage} className="w-full" />
        </CardHeader>
      </Card>

      {/* Exercise Navigation */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={handlePreviousExercise}
          disabled={currentExerciseIndex === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        
        <div className="flex-1 text-center">
          <p className="text-sm text-muted-foreground">
            Exercise {currentExerciseIndex + 1} of {totalExercises}
          </p>
        </div>
        
        <Button
          variant="outline"
          onClick={handleNextExercise}
          disabled={currentExerciseIndex === totalExercises - 1}
        >
          Next
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* Current Exercise */}
      {currentExercise && (
        <div className="space-y-4">
          {/* Exercise Info Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  {currentExercise.exercise?.name || currentExercise.name || 'Exercise'}
                </h3>
                <Badge variant="outline">
                  {currentExercise.sets?.filter((set: any) => set.is_completed).length || 0}/
                  {currentExercise.sets?.length || 3} sets
                </Badge>
              </div>
              
              {/* Sets Display */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {(currentExercise.sets || []).map((set: any, index: number) => (
                  <div 
                    key={set.id || index}
                    className={`p-3 rounded border ${
                      set.is_completed ? 'bg-green-50 border-green-200' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Set {set.set_index || index + 1}</span>
                      {set.is_completed && <CheckCircle className="h-4 w-4 text-green-600" />}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {set.weight ? `${set.weight}kg × ${set.reps} reps` : 'Not completed'}
                      {set.rpe && ` • RPE ${set.rpe}`}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <ExerciseCard
            exercise={currentExercise}
            completedSets={currentExercise.sets?.filter((set: any) => set.is_completed).length || 0}
            targetSets={currentExercise.sets?.length || 3}
            isActive={true}
            currentSetId={currentExercise.id}
            selectedGripIds={currentExercise.default_grip_ids || []}
            onSelect={() => {}}
            onAddSet={() => {
              // This would trigger a set logging interface
              handleSetComplete(currentExercise.id, { weight: 0, reps: 0, rpe: 5 });
            }}
            onNextExercise={() => handleExerciseComplete(currentExercise.id)}
            onGripChange={(gripIds) => {
              // Handle grip change
              console.log('Grip changed:', gripIds);
            }}
          />
        </div>
      )}

      {/* Workout Actions */}
      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={() => setShowWarmupEditor(true)}
          className="flex-1"
        >
          <Settings className="h-4 w-4 mr-2" />
          Edit Warmup
        </Button>
        
        <Button
          onClick={handleWorkoutComplete}
          disabled={false} // Allow completion at any time
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Complete Workout
        </Button>
      </div>

      {/* Warmup Editor */}
      {showWarmupEditor && currentExercise && (
        <WarmupEditor
          exerciseId={currentExercise.exercise_id || currentExercise.id}
          exerciseName={currentExercise.exercise?.name || currentExercise.name || 'Exercise'}
          onClose={() => setShowWarmupEditor(false)}
        />
      )}

      {/* Recalibration Panel */}
      {showRecalibration && (
        <Card>
          <CardHeader>
            <CardTitle>Workout Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <WorkoutRecalibration
              workoutId={workout.id}
              exerciseIds={workout.exercises.map((ex: any) => ex.exercise_id)}
              onApplyPrescriptions={(prescriptions) => {
                console.log('Prescriptions applied:', prescriptions);
                handleFinishWorkout();
              }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}