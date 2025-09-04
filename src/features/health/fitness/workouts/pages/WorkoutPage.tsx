import React from 'react';
import { useParams } from 'react-router-dom';
import WorkoutTracker from '../components/WorkoutTracker';

const WorkoutPage: React.FC = () => {
  const { workoutId } = useParams<{ workoutId: string }>();

  return <WorkoutTracker workoutId={workoutId!} />;
};

export default WorkoutPage;