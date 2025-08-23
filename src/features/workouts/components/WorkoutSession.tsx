import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLogSet } from "../hooks";
import { useState } from "react";

interface WorkoutSessionProps {
  workout: any;
}

export default function WorkoutSession({ workout }: WorkoutSessionProps) {
  const { mutate: logSet } = useLogSet();
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);

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