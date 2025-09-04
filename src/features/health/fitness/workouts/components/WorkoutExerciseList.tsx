import React from 'react';
import { useWorkoutExercises } from '../hooks/useWorkoutExercises';
import WorkoutExerciseItem from './WorkoutExerciseItem';

interface Props {
  workoutId: string;
}

const WorkoutExerciseList: React.FC<Props> = ({ workoutId }) => {
  const { data: exercises, isLoading, error } = useWorkoutExercises(workoutId);

  if (isLoading) return <div>Loading exercises...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!exercises?.length) return <div>No exercises found</div>;

  return (
    <div>
      {exercises.map((exercise) => (
        <WorkoutExerciseItem key={exercise.id} exercise={exercise} />
      ))}
    </div>
  );
};

export default WorkoutExerciseList;