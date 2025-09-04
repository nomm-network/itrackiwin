// src/features/health/fitness/workouts/components/SetList.tsx
import React from 'react';
import WorkoutSetsBlock from './WorkoutSetsBlock';

interface SetListProps {
  exercises: any[];
  onUpdateSet: (setId: string, data: any) => void;
}

const SetList: React.FC<SetListProps> = ({ exercises, onUpdateSet }) => {
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