import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Clock, Target, Zap, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
// import WorkoutSelectionModal from '@/components/fitness/WorkoutSelectionModal'; // TODO: Migrate this component
import { useRecentWorkouts } from '../../services/fitness.api';
import { useActiveWorkout } from '../../workouts/hooks';
import { useFitnessProfileCheck } from '../../hooks/useFitnessProfileCheck.hook';
import { useNextProgramBlock } from '@/hooks/useTrainingPrograms';
import { useStartWorkout } from '../../workouts/hooks';

const TrainingDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const { data: recentWorkouts } = useRecentWorkouts(5);
  const { checkAndRedirect } = useFitnessProfileCheck();
  const { data: nextBlock, isLoading: isLoadingProgram } = useNextProgramBlock();
  const startWorkout = useStartWorkout();
  
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
      // Start from program
      try {
        const result = await startWorkout.mutateAsync({ templateId: nextBlock.workout_template_id });
        navigate(`/app/workouts/${result.workoutId}`);
      } catch (error) {
        console.error('Failed to start program workout:', error);
        setShowWorkoutModal(true);
      }
    } else {
      setShowWorkoutModal(true);
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
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Continue your active training session
              </p>
              <Button 
                onClick={handleStartTraining}
                className="w-full bg-primary hover:bg-primary/90"
              >
                <Clock className="h-4 w-4 mr-2" />
                Continue Training
              </Button>
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
      
      {/* <WorkoutSelectionModal 
        open={showWorkoutModal}
        onOpenChange={setShowWorkoutModal}
      /> */}
    </>
  );
};

export default TrainingDashboard;