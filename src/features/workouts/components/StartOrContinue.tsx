import { useNavigate } from 'react-router-dom';
import { useActiveWorkout } from '@/workouts-sot/api';
import { useStartWorkout } from '@/workouts-sot/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle } from 'lucide-react';
import { useState } from 'react';

export default function StartOrContinue() {
  const navigate = useNavigate();
  const { data: activeWorkout } = useActiveWorkout();
  const { mutate: startWorkout, isPending } = useStartWorkout();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);

  const handleContinueWorkout = () => {
    if (activeWorkout?.id) {
      console.log('[StartOrContinue] Continuing workout:', activeWorkout.id);
      navigate(`/app/workouts/${activeWorkout.id}`);
    }
  };

  const handleStartNew = () => {
    setError(null);
    startWorkout({}, {
      onSuccess: (result) => {
        console.log('[StartOrContinue] New workout started:', result.workoutId);
        navigate(`/app/workouts/${result.workoutId}`);
      },
      onError: (err: any) => {
        const errorMessage = err?.message || JSON.stringify(err);
        setError(errorMessage);
        toast({
          variant: "destructive",
          title: "Failed to start workout",
          description: errorMessage,
        });
        console.error('[StartOrContinue] Full error:', err);
      }
    });
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      {activeWorkout && (
        <Card>
          <CardHeader>
            <CardTitle>Continue Your Workout</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              You have an active workout in progress
            </p>
            <Button onClick={handleContinueWorkout} className="w-full">
              Continue Workout
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Start New Workout</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <div className="flex gap-2">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-destructive">Error Details:</p>
                  <pre className="text-sm mt-2 whitespace-pre-wrap break-all">{error}</pre>
                </div>
              </div>
            </div>
          )}
          <Button 
            onClick={handleStartNew} 
            disabled={isPending}
            variant={activeWorkout ? "outline" : "default"}
            className="w-full"
          >
            {isPending ? 'Starting...' : 'Start Quick Workout'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}