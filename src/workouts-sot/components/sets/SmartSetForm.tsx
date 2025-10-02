// v109-UNILATERAL — SmartSetForm.tsx (SOT)
// Routes to Bodyweight vs Weight/Reps vs Cardio by exercise.effort_mode + load_mode.
import React from "react";
import BodyweightSetForm from "./BodyweightSetForm";
import WeightRepsSetForm from "./WeightRepsSetForm";

type ExerciseLike = {
  id?: string;
  effort_mode?: "reps" | "time" | "distance" | "calories";
  load_mode?: "bodyweight_plus_optional" | "external_added" | "external_assist" | "machine_level" | "free_weight" | "none" | "band_level";
  allows_grips?: boolean | null;
  is_unilateral?: boolean;
  exercise?: {
    effort_mode?: "reps" | "time" | "distance" | "calories";
    load_mode?: "bodyweight_plus_optional" | "external_added" | "external_assist" | "machine_level" | "free_weight" | "none" | "band_level";
    is_unilateral?: boolean;
  };
};

type Props = {
  exercise: ExerciseLike;
  workoutExerciseId: string;
  setIndex?: number;
  onLogged?: () => void;
  className?: string;
  targetWeight?: number;
  targetReps?: number;
  feel?: string;
};

export default function SmartSetForm({ exercise, workoutExerciseId, setIndex = 1, onLogged, className, targetWeight, targetReps, feel }: Props) {
  // Mount debug
  React.useEffect(() => {
    console.log('[v109-UNILATERAL] Mounted: SmartSetForm');
  }, []);

  // Try multiple paths to find effort_mode and load_mode from the nested exercise object
  const effort = exercise?.exercise?.effort_mode ?? exercise?.effort_mode ?? "reps";
  const load = exercise?.exercise?.load_mode ?? exercise?.load_mode ?? "free_weight";
  const isUnilateral = exercise?.exercise?.is_unilateral ?? exercise?.is_unilateral ?? false;

  // Debug breadcrumb into console (and stays silent in UI)
  console.log("🎯 SmartSetForm v109-UNILATERAL [DEBUG]", { 
    effort, 
    load,
    isUnilateral,
    exId: exercise?.id,
    exerciseNested: exercise?.exercise,
    exerciseIsUnilateral: exercise?.is_unilateral,
    nestedIsUnilateral: exercise?.exercise?.is_unilateral,
    raw: exercise 
  });

  // Cardio/time/distance (kept simple — still uses WeightRepsSetForm until cardio form is wired)
  if (effort === "time" || effort === "distance" || effort === "calories") {
    return (
      <WeightRepsSetForm
        workoutExerciseId={workoutExerciseId}
        exercise={exercise as any}
        setIndex={setIndex}
        onLogged={onLogged}
        className={className}
        targetWeight={targetWeight}
        targetReps={targetReps}
        feel={feel}
      />
    );
  }

  // Reps-based branching by load
  switch (load) {
    case "bodyweight_plus_optional":
    case "external_assist": // assisted BW uses negative values
      return (
        <BodyweightSetForm
          workoutExerciseId={workoutExerciseId}
          exercise={exercise as any}
          setIndex={setIndex}
          currentSetNumber={setIndex + 1}
          onLogged={onLogged}
          className={className}
          feel={feel}
        />
      );

    case "machine_level":
    case "external_added":
    case "free_weight":
    case "none":
    case "band_level":
    default:
      return (
        <WeightRepsSetForm
          workoutExerciseId={workoutExerciseId}
          exercise={exercise as any}
          setIndex={setIndex}
          onLogged={onLogged}
          className={className}
          targetWeight={targetWeight}
          targetReps={targetReps}
          feel={feel}
          isUnilateral={isUnilateral}
        />
      );
  }
}