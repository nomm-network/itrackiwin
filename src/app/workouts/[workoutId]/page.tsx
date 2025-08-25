import { useParams } from 'react-router-dom';
import { useGetWorkout } from '@/features/workouts/hooks';
import { EnhancedWorkoutSession } from '@/features/workouts/components';

export default function WorkoutPage() {
  const { workoutId } = useParams<{ workoutId: string }>();
  const { data: workout, isLoading } = useGetWorkout(workoutId!);

  if (isLoading) {
    return <div className="animate-pulse">Loading workout...</div>;
  }

  if (!workout) {
    return <div>Workout not found</div>;
  }

  return <EnhancedWorkoutSession workout={workout} />;
}