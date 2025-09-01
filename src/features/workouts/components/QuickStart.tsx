import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useStartWorkout } from "../hooks";
import { useNavigate } from "react-router-dom";

export default function QuickStart() {
  const { mutate: startWorkout, isPending } = useStartWorkout();
  const navigate = useNavigate();

  const handleStartWorkout = () => {
    startWorkout({}, {
      onSuccess: (result) => {
        navigate(`/app/workouts/${result.workoutId}`);
      }
    });
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Quick Start Workout</CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleStartWorkout} 
            disabled={isPending}
            className="w-full"
          >
            {isPending ? 'Starting...' : 'Start Quick Workout'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}