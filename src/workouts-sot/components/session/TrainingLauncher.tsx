import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Timer } from "lucide-react";
import { useStartWorkout } from "../../hooks";
import { useNavigate } from "react-router-dom";

export default function TrainingLauncher() {
  const { mutate: startWorkout, isPending } = useStartWorkout();
  const navigate = useNavigate();

  const handleStartTraining = () => {
    startWorkout({}, {
      onSuccess: (result) => {
        navigate(`/app/workouts/${result.workoutId}`);
      }
    });
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5 text-primary" />
            Start Training Session
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleStartTraining} 
            disabled={isPending}
            className="w-full bg-primary hover:bg-primary/90"
          >
            <Play className="h-4 w-4 mr-2" />
            {isPending ? 'Launching...' : 'Begin Training'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}