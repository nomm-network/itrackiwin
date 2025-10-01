// v108 — SmartSetForm.tsx (SOT)
// Routes to Bodyweight vs Weight/Reps vs Cardio by exercise.effort_mode + load_mode.
import React from "react";
import BodyweightSetForm from "./BodyweightSetForm";
import WeightRepsSetForm from "./WeightRepsSetForm";

type ExerciseLike = {
  id?: string;
  effort_mode?: "reps" | "time" | "distance" | "calories";
  load_mode?: "bodyweight_plus_optional" | "external_added" | "external_assist" | "machine_level" | "free_weight" | "none" | "band_level";
  allows_grips?: boolean | null;
  exercise?: {
    effort_mode?: "reps" | "time" | "distance" | "calories";
    load_mode?: "bodyweight_plus_optional" | "external_added" | "external_assist" | "machine_level" | "free_weight" | "none" | "band_level";
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
};

export default function SmartSetForm({ exercise, workoutExerciseId, setIndex = 1, onLogged, className, targetWeight, targetReps }: Props) {
  // Mount debug
  React.useEffect(() => {
    console.log('[v108] Mounted: SmartSetForm');
  }, []);

  // Try multiple paths to find effort_mode and load_mode from the nested exercise object
  const effort = exercise?.exercise?.effort_mode ?? exercise?.effort_mode ?? "reps";
  const load = exercise?.exercise?.load_mode ?? exercise?.load_mode ?? "free_weight";

  // Debug breadcrumb into console (and stays silent in UI)
  console.log("🎯 SmartSetForm v108", { 
    effort, 
    load, 
    exId: exercise?.id,
    exerciseNested: exercise?.exercise,
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
        />
      );
  }
}