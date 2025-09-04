import { useStartWorkout } from '@/features/health/fitness/workouts/hooks';
import { TrainingLauncher } from '@/features/health/fitness/workouts/ui';
import { useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';

export default function StartQuickWorkoutPage() {
  return <TrainingLauncher />;
}