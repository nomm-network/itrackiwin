import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useStartWorkout, useEndWorkout } from '../hooks';
import { useReadinessCheckin } from '../../readiness/hooks/useReadinessCheckin';
import EnhancedReadinessCheckIn, { type EnhancedReadinessData } from '../../readiness/ui/EnhancedReadinessCheckIn';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

const TrainingLauncher: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { mutateAsync: startWorkout, isPending } = useStartWorkout();
  const { mutateAsync: endWorkout } = useEndWorkout();
  const { saveCheckin } = useReadinessCheckin();
  const [showReadiness, setShowReadiness] = useState(true);
  const [workoutId, setWorkoutId] = useState<string | null>(null);
  const [isCreatingWorkout, setIsCreatingWorkout] = useState(true);
  
  const templateId = searchParams.get('templateId');

  useEffect(() => {
    console.log('🔥 TrainingLauncher - Component mounted');
    console.log('🔥 TrainingLauncher - Template ID from URL:', templateId);
    console.log('🔥 TrainingLauncher - All search params:', Object.fromEntries(searchParams.entries()));
  }, [templateId, searchParams]);

  // Create workout immediately when component mounts
  useEffect(() => {
    const createWorkout = async () => {
      try {
        console.log('🔥 TrainingLauncher - About to call startWorkout with:', { 
          templateId: templateId || undefined 
        });
        
        const result = await startWorkout({ 
          templateId: templateId || undefined
        });
        
        console.log('🔥 TrainingLauncher - startWorkout SUCCESS, result:', result);
        setWorkoutId(result.workoutId);
      } catch (error) {
        console.error('🔥 TrainingLauncher - startWorkout FAILED:', error);
        console.error('🔥 TrainingLauncher - Error details:', {
          name: error?.name,
          message: error?.message,
          stack: error?.stack,
          cause: error?.cause
        });
        toast({
          title: "Error",
          description: "Failed to create workout. Please try again.",
          variant: "destructive",
        });
        navigate('/dashboard');
      } finally {
        setIsCreatingWorkout(false);
      }
    };

    createWorkout();
  }, [startWorkout, templateId, toast, navigate]);

  const handleReadinessSubmit = async (data: EnhancedReadinessData) => {
    try {
      console.log('🚀 TrainingLauncher: Saving readiness data:', data);
      
      if (!workoutId) {
        throw new Error('No workout ID available');
      }

      // Map the readiness data to the format expected by the RPC
      const readinessInput = {
        energy: data.readiness.energy,
        sleep_quality: data.readiness.sleep_quality,
        sleep_hours: data.readiness.sleep_hours,
        soreness: data.readiness.soreness,
        stress: data.readiness.stress,
        illness: data.readiness.illness,
        alcohol: data.readiness.alcohol,
        supplements: data.readiness.energisers_taken ? 1 : 0 // Convert boolean to number for RPC
      };

      // Save readiness data with workout ID
      await saveCheckin(readinessInput, workoutId);
      
      toast({
        title: "Workout Started!",
        description: "Your readiness data has been recorded. Let's crush this workout!",
      });

      // Navigate to the workout session
      navigate(`/fitness/workout/${workoutId}`);
    } catch (error) {
      console.error('🚀 TrainingLauncher: Failed to save readiness:', error);
      toast({
        title: "Error",
        description: "Failed to save readiness data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAbort = async () => {
    try {
      // If we created a workout, delete it
      if (workoutId) {
        await endWorkout(workoutId);
      }
    } catch (error) {
      console.error('Failed to clean up workout:', error);
    } finally {
      navigate('/dashboard');
    }
  };

  // Show loading while creating workout
  if (isCreatingWorkout) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Creating Your Workout</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Setting up your training session...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showReadiness && workoutId) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={handleAbort}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
          
          <EnhancedReadinessCheckIn
            workoutId={workoutId} // Pass the created workout ID
            onSubmit={handleReadinessSubmit}
            onAbort={handleAbort}
            isLoading={false}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Starting Your Workout</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Preparing your training session...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrainingLauncher;