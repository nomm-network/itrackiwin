import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Play, Clock, Target, Zap, Settings, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import WorkoutSelectionModal from '@/components/fitness/WorkoutSelectionModal';
import { useRecentWorkouts } from '@/features/health/fitness/services/fitness.api';
import { useActiveWorkout } from '@/features/workouts/hooks';
import { useFitnessProfileCheck } from '@/features/health/fitness/hooks/useFitnessProfileCheck.hook';
import { useNextProgramBlock } from '@/hooks/useTrainingPrograms';
import { useStartWorkout } from '@/features/workouts';
import { useDeleteWorkout } from '@/features/health/fitness/services/fitness.api';
import { useToast } from '@/hooks/use-toast';
import { useReadinessCheckin } from '@/features/health/fitness/readiness/hooks/useReadinessCheckin';
import { ReadinessDialog } from '@/features/health/fitness/readiness/ReadinessDialog';
import FavoritesDropdown from '@/features/health/fitness/components/FavoritesDropdown';

const TrainingDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const { data: recentWorkouts } = useRecentWorkouts(5);
  const { checkAndRedirect } = useFitnessProfileCheck();
  const { data: nextBlock, isLoading: isLoadingProgram } = useNextProgramBlock();
  const startWorkout = useStartWorkout();
  const deleteWorkout = useDeleteWorkout();
  const { toast } = useToast();
  const readinessCheckin = useReadinessCheckin();
  
  const { data: activeWorkout, isLoading: loadingActiveWorkout } = useActiveWorkout();

  const handleStartTraining = async () => {
    // If there's an active workout, continue it
    if (activeWorkout?.id) {
      navigate(`/app/workouts/${activeWorkout.id}`);
      return;
    }
    
    // Check profile for new workouts
    if (!checkAndRedirect('start a workout')) return;

    if (nextBlock) {
      // Start readiness check for program workout
      readinessCheckin.open(nextBlock.workout_template_id);
    } else {
      setShowWorkoutModal(true);
    }
  };

  const handleDeleteWorkout = async () => {
    if (!activeWorkout?.id) return;
    
    try {
      await deleteWorkout.mutateAsync(activeWorkout.id);
      toast({
        title: "Workout deleted",
        description: "Your workout has been permanently removed.",
      });
    } catch (error) {
      console.error('Failed to delete workout:', error);
      toast({
        title: "Failed to delete workout",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoadingProgram) {
    return (
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-10 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Play className="h-5 w-5 text-primary" />
            Training Center
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {activeWorkout ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Continue your active training session
              </p>
              <div className="flex gap-2">
                <Button 
                  onClick={() => navigate(`/app/workouts/${activeWorkout.id}`)}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Continue Training
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-destructive border-destructive/20 hover:bg-destructive/5"
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Workout?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to permanently delete your current workout? This action cannot be undone and all progress will be lost.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteWorkout}
                        disabled={deleteWorkout.isPending}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {deleteWorkout.isPending ? 'Deleting...' : 'Delete Workout'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ) : nextBlock ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="default" className="bg-green-500">
                  <Zap className="h-3 w-3 mr-1" />
                  Program Ready
                </Badge>
              </div>
              <div>
                <p className="font-medium text-sm">{nextBlock.template_name}</p>
                <p className="text-xs text-muted-foreground">
                  Block {nextBlock.order_index + 1} of {nextBlock.total_blocks} • Cycle {nextBlock.cycles_completed + 1}
                </p>
              </div>
              <Button 
                onClick={handleStartTraining}
                className="w-full bg-primary hover:bg-primary/90"
                disabled={startWorkout.isPending}
              >
                <Play className="h-4 w-4 mr-2" />
                {startWorkout.isPending ? 'Starting...' : 'Start Program Session'}
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Ready to begin your training?
              </p>
              <div className="flex gap-2">
                <FavoritesDropdown />
                <Button 
                  onClick={handleStartTraining}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/app/programs')}
                  className="px-3"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <WorkoutSelectionModal 
        open={showWorkoutModal}
        onOpenChange={setShowWorkoutModal}
      />
      
      <ReadinessDialog
        isOpen={readinessCheckin.isOpen}
        onClose={readinessCheckin.close}
        onSubmit={async (data) => {
          // Create workout first, then submit readiness
          const result = await startWorkout.mutateAsync({ templateId: readinessCheckin.templateId! });
          await readinessCheckin.submit({ data, workoutId: result.workoutId });
          navigate(`/app/workouts/${result.workoutId}`);
        }}
        templateId={readinessCheckin.templateId}
        workoutId={null} // Will be handled in onSubmit
        isSubmitting={readinessCheckin.isSubmitting || startWorkout.isPending}
      />
    </>
  );
};

export default TrainingDashboard;