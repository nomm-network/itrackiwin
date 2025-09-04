import React from 'react';
import { WorkoutExercise } from '../types';

interface Props {
  exercise: WorkoutExercise;
}

const WorkoutExerciseItem: React.FC<Props> = ({ exercise }) => {
  return (
    <div>
      <h2>{exercise.display_name}</h2>
      <p>Target sets: {exercise.target_sets}</p>
      <p>Target reps: {exercise.target_reps}</p>
      <p>Target weight: {exercise.target_weight_kg} {exercise.weight_unit}</p>
    </div>
  );
};

export default WorkoutExerciseItem;