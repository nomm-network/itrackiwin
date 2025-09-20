// workout-flow-v1.0.0 (SOT) – DO NOT DUPLICATE
'use client';

import { useState } from 'react';
import { useUnifiedSetLogging } from '@/hooks/useUnifiedSetLogging';
import { toast } from '@/hooks/use-toast';

type Props = { exercise: any; onLogged: () => void };

export default function CardioForm({ exercise, onLogged }: Props) {
  const effort = exercise?.exercise?.effort_mode as 'time' | 'distance' | 'calories';
  const [time, setTime] = useState<number>(60);
  const [distance, setDistance] = useState<number>(1000);
  const [calories, setCalories] = useState<number>(50);
  const { logSet, isLoading } = useUnifiedSetLogging();
  const setIndex = (exercise?.sets?.filter((s: any) => s.is_completed).length ?? 0) + 1;

  const doLog = async () => {
    try {
      const metrics: any = { effort };
      if (effort === 'time') metrics.duration_seconds = time;
      if (effort === 'distance') metrics.distance = distance;
      if (effort === 'calories') metrics.load_meta = { calories };

      await logSet({ workoutExerciseId: exercise.id, setIndex, metrics });
      onLogged();
      toast({ title: 'Set logged' });
    } catch (e: any) {
      toast({ title: 'Failed to log set', description: e?.message ?? 'Unknown error', variant: 'destructive' });
    }
  };

  return (
    <div>
      {effort === 'time' && (
        <div>
          <div className="mb-1 text-slate-300">Duration (sec)</div>
          <div className="flex items-center gap-2">
            <button className="h-10 w-10 rounded-lg bg-slate-800" onClick={() => setTime(Math.max(0, time - 10))}>−</button>
            <input className="h-10 w-full rounded-lg bg-slate-900/60 text-center" value={time} onChange={(e) => setTime(Number(e.target.value))} />
            <button className="h-10 w-10 rounded-lg bg-slate-800" onClick={() => setTime(time + 10)}>+</button>
          </div>
        </div>
      )}

      {effort === 'distance' && (
        <div>
          <div className="mb-1 text-slate-300">Distance (m)</div>
          <div className="flex items-center gap-2">
            <button className="h-10 w-10 rounded-lg bg-slate-800" onClick={() => setDistance(Math.max(0, distance - 100))}>−</button>
            <input className="h-10 w-full rounded-lg bg-slate-900/60 text-center" value={distance} onChange={(e) => setDistance(Number(e.target.value))} />
            <button className="h-10 w-10 rounded-lg bg-slate-800" onClick={() => setDistance(distance + 100)}>+</button>
          </div>
        </div>
      )}

      {effort === 'calories' && (
        <div>
          <div className="mb-1 text-slate-300">Calories</div>
          <div className="flex items-center gap-2">
            <button className="h-10 w-10 rounded-lg bg-slate-800" onClick={() => setCalories(Math.max(0, calories - 5))}>−</button>
            <input className="h-10 w-full rounded-lg bg-slate-900/60 text-center" value={calories} onChange={(e) => setCalories(Number(e.target.value))} />
            <button className="h-10 w-10 rounded-lg bg-slate-800" onClick={() => setCalories(calories + 5)}>+</button>
          </div>
        </div>
      )}

      <button
        className="mt-4 h-11 w-full rounded-lg bg-emerald-400 font-semibold text-slate-900 disabled:opacity-60"
        onClick={doLog}
        disabled={isLoading}
      >
        {isLoading ? 'Logging…' : `Log Set ${setIndex}`}
      </button>
    </div>
  );
}