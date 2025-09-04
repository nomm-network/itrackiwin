import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { WorkoutHeader } from '../ui/WorkoutHeader';
import { WarmupPanel } from '../ui/WarmupPanel';
import { WorkoutExerciseCard } from '../ui/WorkoutExerciseCard';
import { getWorkout, getWorkoutExercises } from '../api/workouts.api';
import { useStartSetLogging } from '../state/useSetLogging';
import { toast } from 'sonner';

export default function WorkoutSessionPage() {
  const { workoutId } = useParams();
  const navigate = useNavigate();
  const { isLogging } = useStartSetLogging(); // init global logging state if you have one

  const workoutQ = useQuery({
    queryKey: ['workout', workoutId],
    queryFn: () => getWorkout(workoutId!),
    enabled: !!workoutId,
  });

  const exercisesQ = useQuery({
    queryKey: ['workout-exercises', workoutId],
    queryFn: () => getWorkoutExercises(workoutId!),
    enabled: !!workoutId,
  });

  const onFatal = (err: unknown) => {
    const msg = err instanceof Error ? err.message : JSON.stringify(err);
    toast.error(`Workout failed to load: ${msg}`);
  };

  if (workoutQ.isError) return onFatal(workoutQ.error), null;
  if (exercisesQ.isError) return onFatal(exercisesQ.error), null;

  if (workoutQ.isLoading || exercisesQ.isLoading) {
    return <div className="p-4">Loading workout…</div>;
  }

  const workout = workoutQ.data!;
  const exercises = exercisesQ.data!;

  return (
    <div className="max-w-screen-md mx-auto p-4 space-y-16">
      <WorkoutHeader
        workout={workout}
        onExit={() => navigate('/app/dashboard')}
      />

      <WarmupPanel workoutId={workout.id} />

      <div className="space-y-8">
        {exercises.map((we) => (
          <WorkoutExerciseCard
            key={we.id}
            workout={workout}
            exercise={we}
          />
        ))}
      </div>
    </div>
  );
}