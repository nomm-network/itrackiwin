import React from 'react';
import { useWorkout } from '../hooks/useWorkout';
import WorkoutExerciseList from './WorkoutExerciseList';

interface Props {
  workoutId: string;
}

const WorkoutTracker: React.FC<Props> = ({ workoutId }) => {
  const { data: workout, isLoading, error } = useWorkout(workoutId);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!workout) return <div>No workout found</div>;

  return (
    <div>
      <h1>{workout.title || 'Workout'}</h1>
      <WorkoutExerciseList workoutId={workoutId} />
    </div>
  );
};

export default WorkoutTracker;