import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Play, 
  Pause, 
  CheckCircle, 
  Timer, 
  Target,
  Settings,
  ArrowLeft,
  ArrowRight,
  Zap,
  Plus,
  ChevronDown,
  Hand
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ExerciseCard from './ExerciseCard';
import TouchOptimizedSetInput from '@/components/workout/TouchOptimizedSetInput';
import { SetFeelSelector } from '@/features/health/fitness/components/SetFeelSelector';
import { WarmupEditor } from '@/features/health/fitness/components/WarmupEditor';
import { WorkoutRecalibration } from '@/features/health/fitness/components/WorkoutRecalibration';
import { GymConstraintsFilter } from '@/features/health/fitness/components/GymConstraintsFilter';
import { DefaultSetsManager } from './DefaultSetsManager';
import { useMyGym } from '@/features/health/fitness/hooks/useMyGym.hook';
import { useLogSet } from '../hooks';
import { useAdvanceProgramState } from '@/hooks/useTrainingPrograms';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useExerciseTranslation } from '@/hooks/useExerciseTranslations';
import { useGrips, getGripIdByName } from '@/hooks/useGrips';
import { sanitizeUuid, isUuid } from '@/utils/ids';
import ImprovedWorkoutSession from '@/components/fitness/ImprovedWorkoutSession';

interface WorkoutSessionProps {
  workout: any;
}

export default function EnhancedWorkoutSession({ workout }: WorkoutSessionProps) {
  const navigate = useNavigate();
  const { mutate: logSet, isPending: isLoading } = useLogSet();
  const { gym } = useMyGym();
  const advanceProgramState = useAdvanceProgramState();
  const { data: grips = [] } = useGrips();
  
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [showWarmupEditor, setShowWarmupEditor] = useState(false);
  const [showRecalibration, setShowRecalibration] = useState(false);
  const [workoutStartTime] = useState(new Date());
  
  // Grip selection state - per exercise
  const [selectedGrips, setSelectedGrips] = useState<Record<string, string[]>>({});
  const [showGripSelector, setShowGripSelector] = useState<Record<string, boolean>>({});
  
  // Set input state - always show for current set
  const [currentSetData, setCurrentSetData] = useState({
    weight: 0,
    reps: 0,
    rpe: 5,
    feel: '',
    notes: '',
    pain: false
  });

  const currentExercise = workout?.exercises?.[currentExerciseIndex];
  const totalExercises = workout?.exercises?.length || 0;
  const progressPercentage = totalExercises > 0 ? (completedExercises.size / totalExercises) * 100 : 0;
  
  // Get exercise translation
  const { data: exerciseTranslation } = useExerciseTranslation(
    currentExercise?.exercise_id || currentExercise?.id || ''
  );
  
  const getExerciseName = () => {
    if (exerciseTranslation?.name) return exerciseTranslation.name;
    if (currentExercise?.exercise?.translations?.en?.name) return currentExercise.exercise.translations.en.name;
    if (currentExercise?.translations?.en?.name) return currentExercise.translations.en.name;
    if (currentExercise?.exercise?.name) return currentExercise.exercise.name;
    if (currentExercise?.name) return currentExercise.name;
    return 'Exercise';
  };
  
  const sets = currentExercise?.sets || [];
  const completedSetsCount = sets.filter((set: any) => set.is_completed).length;
  const targetSetsCount = sets.length || 3;
  const currentSetNumber = completedSetsCount + 1;
  
  // Find current set index (first non-completed set)
  const currentSetIndex = useMemo(() => {
    const index = sets.findIndex(s => !s.is_completed);
    return index === -1 ? sets.length : index;
  }, [sets]);

  // Filter exercises based on gym constraints
  const filteredExercises = useMemo(() => {
    if (!workout?.exercises || !gym) return workout?.exercises || [];
    
    // This would integrate with GymConstraintsFilter logic
    return workout.exercises.filter((exercise: any) => {
      // Basic gym equipment filtering logic would go here
      return true; // For now, show all exercises
    });
  }, [workout?.exercises, gym]);

  const resolveWorkoutExerciseId = (ex: any): string => {
    // prefer the actual WE id provided by your query
    const candidate =
      ex?.workout_exercise_id ??
      ex?.we_id ??                        // if you aliased as we_id
      ex?.id;                             // fallback (only if `ex.id` really is WE id!)

    const id = sanitizeUuid(candidate);
    if (!isUuid(id)) {
      console.error('❌ Invalid workout_exercise_id', { candidate, id, ex });
      throw new Error('Invalid workout_exercise_id (not a UUID)');
    }
    return id;
  };

  const handleSetComplete = (workoutExerciseId: string, setData: any) => {
    console.log('=== SET LOGGING DEBUG ===');
    console.log('Current Exercise Object:', currentExercise);
    console.log('Workout Exercise ID being passed:', workoutExerciseId);
    console.log('Set Data:', setData);
    console.log('Type of workoutExerciseId:', typeof workoutExerciseId);
    
    const exerciseGrips = selectedGrips[workoutExerciseId] || [];
    
    // Convert grip names to UUIDs
    const gripIds = exerciseGrips
      .map(gripName => getGripIdByName(grips, gripName))
      .filter(id => id !== null) as string[];
    
    // Build notes with feel and pain info
    let notes = setData.notes || '';
    if (setData.feel) {
      notes = notes ? `Feel: ${setData.feel}. ${notes}` : `Feel: ${setData.feel}`;
    }
    if (setData.pain) {
      notes = notes ? `${notes}. Pain reported` : 'Pain reported';
    }
    
    const payload = {
      workout_exercise_id: workoutExerciseId,
      weight: setData.weight || 0,
      reps: setData.reps || 0,
      rpe: setData.rpe || 5,
      notes: notes,
      is_completed: true,
      grip_ids: gripIds
    };
    
    console.log('Payload being sent to set_log:', payload);
    console.log('Payload JSON:', JSON.stringify(payload));
    
    logSet(payload, {
      onSuccess: (data) => {
        console.log('Set logged successfully:', data);
        // Reset form for next set
        setCurrentSetData({
          weight: setData.weight || 0, // Keep weight for next set
          reps: setData.reps || 0,     // Keep reps for next set
          rpe: 5,
          feel: '',
          notes: '',
          pain: false
        });
        toast.success('Set logged successfully!');
        
        // Force refresh the workout data to show updated sets
        window.location.reload();
      },
      onError: (error) => {
        console.error('Failed to log set:', error);
        toast.error(`Failed to log set: ${error.message}`);
      }
    });
  };

  const handleSaveSet = () => {
    if (currentExercise && (currentSetData.weight > 0 || currentSetData.reps > 0)) {
      const weId = resolveWorkoutExerciseId(currentExercise);
      handleSetComplete(weId, currentSetData);
    } else {
      toast.error('Please enter weight or reps');
    }
  };
  
  const handleAddExtraSet = () => {
    // For adding sets beyond the target
    if (currentExercise && (currentSetData.weight > 0 || currentSetData.reps > 0)) {
      const weId = resolveWorkoutExerciseId(currentExercise);
      handleSetComplete(weId, currentSetData);
    }
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
      // Mark workout as completed in the database
      const { error } = await supabase
        .from('workouts')
        .update({ 
          ended_at: new Date().toISOString(),
          perceived_exertion: null // Could be set via a form later
        })
        .eq('id', workout.id);

      if (error) throw error;

      // Advance program state if this was from a program
      if (workout.program_block_id) {
        await advanceProgramState.mutateAsync(workout.program_block_id);
      }
      
      toast.success('Workout completed! 🎉');
      
      // Navigate back to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
      
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

  const allExercisesComplete = completedExercises.size === totalExercises;

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
              ← Back
            </Button>
            <h1 className="text-lg font-semibold">{workout?.name || 'Workout Session'}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {currentExerciseIndex + 1}/{workout?.exercises?.length || 0}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowWarmupEditor(true)}
            >
              Warmup
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 pb-24 max-w-md mx-auto">
        {!workout?.exercises || workout.exercises.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No exercises found in this workout.</p>
          </div>
        ) : (
          <>
            {currentExercise && (
              <ImprovedWorkoutSession
                exercise={{
                  id: currentExercise.id,
                  workout_exercise_id: resolveWorkoutExerciseId(currentExercise),
                  name: getExerciseName(),
                  target_sets: currentExercise.target_sets || 3,
                  completed_sets: sets.filter((set: any) => set.is_completed)
                }}
                onSetComplete={(setData) => {
                  const weId = resolveWorkoutExerciseId(currentExercise);
                  handleSetComplete(weId, setData);
                }}
                onExerciseComplete={() => handleExerciseComplete(currentExercise.id)}
                onAddExtraSet={() => {
                  const weId = resolveWorkoutExerciseId(currentExercise);
                  handleSetComplete(weId, {
                    weight: 0,
                    reps: 0,
                    rpe: 5,
                    feel: '',
                    pain: false,
                    notes: '',
                    is_completed: false
                  });
                }}
                unit="kg"
              />
            )}

            {/* Exercise Navigation at Bottom */}
            <div className="mt-8 space-y-3">
              <div className="text-center text-sm text-muted-foreground mb-3">
                Exercise Navigation
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {workout.exercises.map((exercise: any, index: number) => (
                  <Button
                    key={exercise.id}
                    variant={index === currentExerciseIndex ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentExerciseIndex(index)}
                    className="flex-shrink-0"
                  >
                    {index + 1}. {getExerciseName()}
                  </Button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Floating Complete Workout Button */}
      {allExercisesComplete && (
        <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto">
          <Button
            onClick={handleWorkoutComplete}
            className="w-full"
            size="lg"
          >
            Complete Workout
          </Button>
        </div>
      )}

      {/* Warmup Editor Dialog */}
      <Dialog open={showWarmupEditor} onOpenChange={setShowWarmupEditor}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Warmup</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <WarmupEditor 
              exerciseId={currentExercise?.exercise_id || currentExercise?.id}
              exerciseName={getExerciseName()}
              onClose={() => setShowWarmupEditor(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}