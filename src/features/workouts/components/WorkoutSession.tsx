import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLogSet } from "../hooks";
import { useState } from "react";
import { MobileWorkoutSession } from "@/components/mobile/MobileWorkoutSession";
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

  // Step 2: Unified flow - always use EnhancedWorkoutSession
  const { default: EnhancedWorkoutSession } = require('@/features/workouts/components/EnhancedWorkoutSession');
  return <EnhancedWorkoutSession workout={workout} source="workout-session-wrapper" />;
}