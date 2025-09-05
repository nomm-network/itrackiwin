import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useWorkout } from './api/useWorkout';
import WorkoutExerciseCard from './components/WorkoutExerciseCard';
import { Button } from '@/components/ui/button';

const Box: React.FC<{title?:string, children:React.ReactNode}> = ({title, children}) => (
  <div className="rounded-xl border border-emerald-900/30 bg-[#0f1f1b] p-4">
    {title && <div className="mb-2 text-sm text-emerald-300/80">{title}</div>}
    {children}
  </div>
);

export default function WorkoutPage() {
  const { workoutId = '' } = useParams();
  const { data, isLoading, error } = useWorkout(workoutId);
  const [showDebug, setShowDebug] = useState(false);

  if (isLoading) return <div className="p-4 text-emerald-200">Loading…</div>;
  if (error) return <div className="p-4 text-red-400">Error: {(error as any)?.message}</div>;
  if (!data) return <div className="p-4 text-emerald-200">No data</div>;

  const title = data.workout_title || 'Workout Session';

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 pb-nav-safe text-emerald-100">
      <h1 className="text-xl font-semibold text-emerald-200">{title}</h1>

      <div className="space-y-3">
        {data.exercises.map((we) => (
          <WorkoutExerciseCard key={we.id} we={we} />
        ))}
      </div>

      {/* Debug utility at bottom */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDebug(!showDebug)}
          className="bg-black/80 text-emerald-400 border-emerald-900/40 hover:bg-emerald-900/20"
        >
          Debug
        </Button>
      </div>

      {/* Debug panel */}
      {showDebug && (
        <div className="fixed bottom-16 right-4 max-w-sm rounded-lg border border-emerald-900/40 bg-black/90 p-3 text-xs text-emerald-300 z-50">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-medium text-emerald-200">Debug Info</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDebug(false)}
              className="h-6 w-6 p-0 text-emerald-400 hover:bg-emerald-900/20"
            >
              ×
            </Button>
          </div>
          <pre className="whitespace-pre-wrap text-xs">
{JSON.stringify({
  workoutId,
  name: data.workout_title,
  exercises: data.exercises.length
}, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}