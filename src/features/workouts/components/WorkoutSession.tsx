import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLogSet } from "../hooks";
import { useState } from "react";
// import { MobileWorkoutSession } from "@/components/mobile/MobileWorkoutSession"; // disabled
import { useIsMobile } from "@/hooks/use-mobile";

interface WorkoutSessionProps {
  workout: any;
}

export default function WorkoutSession({ workout }: WorkoutSessionProps) {
  const { mutate: logSet } = useLogSet();
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const isMobile = useIsMobile();

  if (!workout?.exercises?.length) {
    return <div>No exercises in this workout</div>;
  }

  const currentExercise = workout.exercises[currentExerciseIndex];

  const handleNextExercise = () => {
    if (currentExerciseIndex < workout.exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    }
  };

  const handleLogSet = (weight: number, reps: number) => {
    logSet({
      workout_exercise_id: currentExercise.id,
      weight,
      reps,
      is_completed: true
    });
  };

  const handleSetComplete = (exerciseId: string, setData: any) => {
    logSet({
      workout_exercise_id: exerciseId,
      weight: setData.weight,
      reps: setData.reps,
      notes: setData.notes || '',
      is_completed: true
    });
  };

  const handleWorkoutComplete = () => {
    // Handle workout completion
    console.log('Workout completed!');
  };

  // Use mobile-first component on mobile devices
  if (isMobile) {
    return (
      <div>Old WorkoutSession disabled - using WorkoutSession.page.tsx</div>
    );
  }

  // Desktop fallback
  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>
            {currentExercise.exercise_name}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Exercise {currentExerciseIndex + 1} of {workout.exercises.length}
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={() => handleLogSet(100, 10)}>
                Log Set: 100kg x 10
              </Button>
              <Button variant="outline" onClick={handleNextExercise}>
                Next Exercise
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}