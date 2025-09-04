import React from 'react';
import { useWorkoutExercises } from '../hooks/useWorkoutExercises';
import WorkoutExerciseCard from './WorkoutExerciseCard';

interface Props {
  workoutId: string;
}

const WorkoutExerciseList: React.FC<Props> = ({ workoutId }) => {
  const { data: exercises, isLoading, error } = useWorkoutExercises(workoutId);

  if (isLoading) return <div className="p-4">Loading exercises...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error.message}</div>;
  if (!exercises?.length) return <div className="p-4">No exercises found</div>;

  return (
    <div className="space-y-4">
      {exercises.map((exercise) => (
        <WorkoutExerciseCard 
          key={exercise.id} 
          title={exercise.display_name ?? "—"}
          totalSets={0}
        >
          <div>Exercise: {exercise.display_name}</div>
        </WorkoutExerciseCard>
      ))}
    </div>
  );
};

export default WorkoutExerciseList;