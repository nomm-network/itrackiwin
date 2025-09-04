import { useParams, useSearchParams } from 'react-router-dom';
import { useWorkout } from './api/useWorkout';
import { WorkoutExerciseCard } from './components/WorkoutExerciseCard';

export default function WorkoutPage() {
  const { workoutId } = useParams<{ workoutId: string }>();
  const [searchParams] = useSearchParams();
  const showDebug = searchParams.get('debug') === '1';
  
  const { data: workout, isLoading, error, refetch } = useWorkout(workoutId!);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0d1a17] p-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error || !workout) {
    return (
      <div className="min-h-screen bg-[#0d1a17] p-4 flex items-center justify-center">
        <div className="text-red-400">Failed to load workout</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1a17]">
      {/* Header */}
      <div className="p-4 border-b border-[#133a2f]">
        <h1 className="text-2xl font-bold text-white">
          {workout.name || 'Workout Session'}
        </h1>
      </div>

      {/* Exercise Cards */}
      <div className="p-4 space-y-4">
        {workout.exercises
          .sort((a, b) => a.order_index - b.order_index)
          .map((workoutExercise) => (
            <WorkoutExerciseCard
              key={workoutExercise.id}
              workoutExercise={workoutExercise}
            />
          ))}
      </div>

      {/* Debug Panel */}
      {showDebug && (
        <div className="fixed bottom-4 right-4 bg-[#0f1f1b] border border-[#133a2f] rounded-xl p-4 max-w-xs">
          <h3 className="text-sm font-medium text-emerald-300 mb-2">Debug Info</h3>
          <div className="text-xs text-gray-400 space-y-1">
            <div>Workout ID: {workout.id}</div>
            <div>Title: {workout.name}</div>
            <div>Exercises: {workout.exercises.length}</div>
            {workout.exercises[0] && (
              <>
                <div>First Exercise: {workout.exercises[0].exercise.display_name}</div>
                <div>Target: {workout.exercises[0].target_weight_kg}kg × {workout.exercises[0].target_reps}</div>
                {workout.exercises[0].attribute_values_json?.warmup && (
                  <div>Warmup Steps: {workout.exercises[0].attribute_values_json.warmup.length}</div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}