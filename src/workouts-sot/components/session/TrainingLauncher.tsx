import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Timer, AlertCircle } from "lucide-react";
import { useStartWorkout } from "../../hooks";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function TrainingLauncher() {
  const { mutate: startWorkout, isPending } = useStartWorkout();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);

  const handleStartTraining = () => {
    setError(null);
    startWorkout({}, {
      onSuccess: (result) => {
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
        console.error('[TrainingLauncher] Full error:', err);
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