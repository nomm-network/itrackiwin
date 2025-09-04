// src/features/health/fitness/workouts/components/SetList.tsx
import React from 'react';
import WorkoutSetsBlock from './WorkoutSetsBlock';

interface SetListProps {
  exercises?: any[];
  onUpdateSet?: (setId: string, data: any) => void;
  workoutExerciseId?: string;
  targetReps?: number;
  targetWeightKg?: number;
  unit?: "kg" | "lb";
  sets?: any[];
  onSetsChanged?: () => Promise<void>;
}

const SetList: React.FC<SetListProps> = ({ exercises, onUpdateSet, sets, workoutExerciseId, targetReps, targetWeightKg, unit, onSetsChanged }) => {
  // Handle direct sets prop
  if (sets && workoutExerciseId) {
    return (
      <div>
        <WorkoutSetsBlock
          exerciseId={workoutExerciseId}
          sets={sets}
          onUpdateSet={onUpdateSet}
        />
      </div>
    );
  }

  // Handle exercises array
  if (!exercises || exercises.length === 0) {
    return null;
  }

  return (
    <div>
      {exercises.map((exercise) => (
        <WorkoutSetsBlock
          key={exercise.id}
          exerciseId={exercise.id}
          sets={exercise.sets}
          onUpdateSet={onUpdateSet}
        />
      ))}
    </div>
  );
};

export default SetList;