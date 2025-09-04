import React from 'react';
import { useWorkout } from '../hooks/useWorkout';
import WorkoutExerciseList from './WorkoutExerciseList';
import WorkoutHeader from './WorkoutHeader';

interface Props {
  workoutId: string;
}

const WorkoutTracker: React.FC<Props> = ({ workoutId }) => {
  const { data: workout, isLoading, error } = useWorkout(workoutId);

  if (isLoading) return <div className="p-4">Loading workout...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error.message}</div>;
  if (!workout) return <div className="p-4">No workout found</div>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <WorkoutHeader workout={workout} />
      <WorkoutExerciseList workoutId={workoutId} />
    </div>
  );
};

export default WorkoutTracker;