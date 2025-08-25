import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Clock, Target, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TemplateSelectionDialog from '@/components/fitness/TemplateSelectionDialog';
import { useRecentWorkouts } from '@/features/health/fitness/services/fitness.api';
import { useActiveWorkout } from '@/features/workouts/hooks';
import { useFitnessProfileCheck } from '@/features/health/fitness/hooks/useFitnessProfileCheck.hook';
import { useNextProgramBlock } from '@/hooks/useTrainingPrograms';
import { useStartQuickWorkout } from '@/features/workouts/hooks/useStartQuickWorkout';

const FitnessQuickStart: React.FC = () => {
  const navigate = useNavigate();
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const { data: recentWorkouts } = useRecentWorkouts(5);
  const { checkAndRedirect } = useFitnessProfileCheck();
  const { data: nextBlock, isLoading: isLoadingProgram } = useNextProgramBlock();
  const startQuickWorkout = useStartQuickWorkout();
  
  // Use direct active workout query instead of relying on recentWorkouts list
  const { data: activeWorkout } = useActiveWorkout();
  
  // Debug logging
  console.log('[FitnessQuickStart] activeWorkout:', activeWorkout);
  console.log('[FitnessQuickStart] recentWorkouts:', recentWorkouts);

  const handleStartWorkout = async () => {
    if (!checkAndRedirect('start a workout')) return;
    
    console.log('[FitnessQuickStart] handleStartWorkout called with activeWorkout:', activeWorkout);
    
    if (activeWorkout) {
      console.log('[FitnessQuickStart] Navigating to existing workout:', `/app/workouts/${activeWorkout.id}`);
      navigate(`/app/workouts/${activeWorkout.id}`);
      return;
    }

    if (nextBlock) {
      // Start from program
      try {
        const result = await startQuickWorkout.mutateAsync({ useProgram: true });
        navigate(`/app/workouts/${result.workoutId}`);
      } catch (error) {
        console.error('Failed to start program workout:', error);
        setShowTemplateDialog(true);
      }
    } else {
      setShowTemplateDialog(true);
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
            Quick Start
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {activeWorkout ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                You have an active workout in progress
              </p>
              <Button 
                onClick={handleStartWorkout}
                className="w-full bg-primary hover:bg-primary/90"
              >
                <Clock className="h-4 w-4 mr-2" />
                Continue Workout
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
                onClick={handleStartWorkout}
                className="w-full bg-primary hover:bg-primary/90"
                disabled={startQuickWorkout.isPending}
              >
                <Play className="h-4 w-4 mr-2" />
                {startQuickWorkout.isPending ? 'Starting...' : 'Start Program Workout'}
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Ready to start training?
              </p>
              <div className="flex gap-2">
                <Button 
                  onClick={handleStartWorkout}
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
                  <Target className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <TemplateSelectionDialog 
        open={showTemplateDialog}
        onOpenChange={setShowTemplateDialog}
      />
    </>
  );
};

export default FitnessQuickStart;