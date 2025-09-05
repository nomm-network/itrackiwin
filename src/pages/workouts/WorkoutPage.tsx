import React from 'react';
import { useParams } from 'react-router-dom';
import { useWorkout } from '@/features/health/fitness/workouts/api/useWorkout';
import WorkoutExerciseCard from '@/features/health/fitness/workouts/components/WorkoutExerciseCard';

const Box: React.FC<{title?:string, children:React.ReactNode}> = ({title, children}) => (
  <div className="rounded-xl border border-emerald-900/30 bg-[#0f1f1b] p-4">
    {title && <div className="mb-2 text-sm text-emerald-300/80">{title}</div>}
    {children}
  </div>
);

export default function WorkoutPage() {
  const { workoutId = '' } = useParams();
  const { data, isLoading, error } = useWorkout(workoutId);

  if (isLoading) return <div className="p-4 text-emerald-200">Loading…</div>;
  if (error) return <div className="p-4 text-red-400">Error: {(error as any)?.message}</div>;
  if (!data) return <div className="p-4 text-emerald-200">No data</div>;

  const title = data.name || 'Workout Session';

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 text-emerald-100">
      <h1 className="text-xl font-semibold text-emerald-200">{title}</h1>

      <Box title="Debug">
        <pre className="text-xs whitespace-pre-wrap">
{JSON.stringify({
  workoutId,
  name: data.name,
  exercises: data.exercises.length
}, null, 2)}
        </pre>
      </Box>

      <div className="space-y-3">
        {data.exercises.map((we) => (
          <WorkoutExerciseCard key={we.id} we={we} />
        ))}
      </div>
    </div>
  );
}