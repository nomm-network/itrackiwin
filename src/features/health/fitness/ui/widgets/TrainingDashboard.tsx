import React, { useState } from 'react';
import TrainingCenterCard from '@/features/training/components/TrainingCenterCard';
import { useActiveWorkout } from '@/workouts-sot/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Clock, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDeleteWorkout } from '@/features/health/fitness/services/fitness.api';
import { useToast } from '@/hooks/use-toast';

const TrainingDashboard: React.FC = () => {
  const navigate = useNavigate();
  const deleteWorkout = useDeleteWorkout();
  const { toast } = useToast();
  
  const { data: activeWorkout, isLoading: loadingActiveWorkout } = useActiveWorkout();

  const handleContinueWorkout = () => {
    if (activeWorkout?.id) {
      navigate(`/app/workouts/${activeWorkout.id}`);
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

  // If there's an active workout, show continue dialog
  if (activeWorkout) {
    return (
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Active Workout
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Continue your active training session
          </p>
          <div className="flex gap-2">
            <Button 
              onClick={handleContinueWorkout}
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
        </CardContent>
      </Card>
    );
  }

  // Show the new favorites-based Training Center
  return <TrainingCenterCard />;
};

export default TrainingDashboard;