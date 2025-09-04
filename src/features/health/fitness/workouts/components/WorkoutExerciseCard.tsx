// src/features/health/fitness/workouts/components/WorkoutExerciseCard.tsx
import React from "react";
import WarmupBlock from "./WarmupBlock";
import WorkoutSetsBlock from "./WorkoutSetsBlock";

interface WorkoutExerciseCardProps {
  exercise: {
    id: string;
    display_name: string;
    attribute_values_json?: any;
    sets?: any[];
  };
}

const WorkoutExerciseCard: React.FC<WorkoutExerciseCardProps> = ({ exercise }) => {
  const warmupSteps = exercise.attribute_values_json?.warmup ?? [];

  return (
    <div className="border rounded-lg p-4 mb-4 shadow-sm bg-white">
      {/* Exercise name */}
      <h2 className="font-semibold text-lg mb-2">{exercise.display_name}</h2>

      {/* Warmup area */}
      {warmupSteps && warmupSteps.length > 0 && (
        <div className="mb-3">
          <WarmupBlock steps={warmupSteps} />
        </div>
      )}

      {/* Sets area */}
      <WorkoutSetsBlock exerciseId={exercise.id} sets={exercise.sets || []} />
    </div>
  );
};

export default WorkoutExerciseCard;