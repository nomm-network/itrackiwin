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
  onAddSet?: (exerciseId: string) => void;
  onCompleteSet?: (setId: string, data: any) => void;
}

const WorkoutExerciseCard: React.FC<WorkoutExerciseCardProps> = ({ exercise, onAddSet, onCompleteSet }) => {
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
      <WorkoutSetsBlock sets={exercise.sets || []} onComplete={(setId) => onCompleteSet?.(setId, {})} onEdit={(setId) => console.log('Edit set:', setId)} />
    </div>
  );
};

export default WorkoutExerciseCard;