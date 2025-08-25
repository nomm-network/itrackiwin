import { useNavigate } from 'react-router-dom';
import { useActiveWorkout } from '../hooks/useActiveWorkout';
import { useStartQuickWorkout } from '../hooks/useStartQuickWorkout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function StartOrContinue() {
  const navigate = useNavigate();
  const { data: activeWorkout } = useActiveWorkout();
  const { mutate: startWorkout, isPending } = useStartQuickWorkout();

  const handleContinueWorkout = () => {
    if (activeWorkout?.id) {
      console.log('[StartOrContinue] Continuing workout:', activeWorkout.id);
      navigate(`/app/workouts/${activeWorkout.id}`);
    }
  };

  const handleStartNew = () => {
    startWorkout({}, {
      onSuccess: (result) => {
        console.log('[StartOrContinue] New workout started:', result.workoutId);
        navigate(`/app/workouts/${result.workoutId}`);
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
        <CardContent>
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