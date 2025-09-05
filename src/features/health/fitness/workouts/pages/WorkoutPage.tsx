import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useWorkout } from '../api/useWorkout';
import { supabase } from '@/integrations/supabase/client';

const Pill: React.FC<React.HTMLAttributes<HTMLSpanElement>> = ({ className, children, ...rest }) => (
  <span
    {...rest}
    className={
      'inline-flex items-center rounded-full border border-emerald-500/40 px-2 py-0.5 text-xs text-emerald-300 ' +
      (className || '')
    }
  >
    {children}
  </span>
);

export default function WorkoutPage() {
  const { workoutId } = useParams();
  const { data, isLoading, error, refetch } = useWorkout(workoutId);

  // Initialize warmups on mount
  useEffect(() => {
    if (!workoutId) return;
    (async () => {
      await supabase.rpc('initialize_warmups_for_workout', { p_workout_id: workoutId });
      await refetch();
    })();
  }, [workoutId, refetch]);

  if (isLoading) return <div className="p-4 text-emerald-200">Loading workout…</div>;
  if (error) {
    return (
      <div className="p-4 space-y-2">
        <div className="text-red-300">Failed to load workout</div>
        <pre className="text-xs bg-black/40 p-3 rounded text-red-200">{String(error)}</pre>
        <Link className="text-emerald-300 underline" to="/app">Back</Link>
      </div>
    );
  }
  if (!data) return null;

  return (
    <div className="mx-auto max-w-3xl p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-emerald-200">{data.workout_title}</h1>
          <p className="text-xs text-emerald-300/70">{new Date(data.started_at || Date.now()).toLocaleString()}</p>
        </div>
        <Link to="/app" className="text-emerald-300 text-sm underline">Exit</Link>
      </div>

      {/* Exercises */}
      <div className="space-y-3">
        {data.exercises.map((we) => {
          const doneCount = (we.workout_sets || []).filter(s => s.is_completed).length;
          return (
            <div key={we.id} className="rounded-lg border border-emerald-800/40 bg-[#0f1f1b] p-3">
              {/* Row 1: name + pill */}
              <div className="flex items-center justify-between">
                <div className="text-emerald-200 text-sm font-medium">
                  {we.exercise?.display_name || we.exercise?.slug || 'Exercise'}
                </div>
                <Pill>{doneCount} sets completed</Pill>
              </div>

              {/* Row 2: compact warmup line (just show top kg if present) */}
              <div className="mt-2 text-xs text-emerald-300/80">
                {we.target_weight_kg
                  ? <>Target: <b className="text-emerald-300">{we.target_weight_kg}</b> kg</>
                  : <>Target: <span className="text-emerald-300/60">—</span></>}
                {Array.isArray(we.attribute_values_json?.warmup) && we.attribute_values_json.warmup.length > 0 && (
                  <span className="ml-3">
                    Warmup: {we.attribute_values_json.warmup.map((s: any) => s.kg ?? s.weight ?? '?').join(' / ')} kg
                  </span>
                )}
              </div>

              {/* Row 3: minimal sets table */}
              <div className="mt-3 overflow-hidden rounded-md border border-emerald-800/40">
                <table className="w-full text-xs">
                  <thead className="bg-[#0d1a17] text-emerald-300/80">
                    <tr>
                      <th className="px-2 py-1 text-left">Set</th>
                      <th className="px-2 py-1 text-left">Reps</th>
                      <th className="px-2 py-1 text-left">Weight</th>
                      <th className="px-2 py-1 text-left">Done</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-900/40">
                    {(we.workout_sets || []).sort((a,b)=>a.set_index-b.set_index).map((s) => (
                      <tr key={s.id} className="text-emerald-200">
                        <td className="px-2 py-1">{s.set_index}</td>
                        <td className="px-2 py-1">{s.reps ?? '—'}</td>
                        <td className="px-2 py-1">{s.weight_kg ?? '—'} kg</td>
                        <td className="px-2 py-1">{s.is_completed ? '✅' : '—'}</td>
                      </tr>
                    ))}
                    {(!we.workout_sets || we.workout_sets.length === 0) && (
                      <tr><td colSpan={4} className="px-2 py-2 text-emerald-300/60">No sets yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
        {data.exercises.length === 0 && (
          <div className="text-emerald-300/70 text-sm">No exercises in this workout.</div>
        )}
      </div>

      {/* Tiny debug panel */}
      <details className="mt-2">
        <summary className="cursor-pointer text-xs text-emerald-400">Debug</summary>
        <pre className="mt-2 max-h-72 overflow-auto rounded bg-black/40 p-3 text-[11px] text-emerald-200">
{JSON.stringify({ workoutId: data.id, title: data.workout_title, exercises: data.exercises.map(e=>({id:e.id,name:e.exercise?.display_name, target:e.target_weight_kg, sets:e.workout_sets?.length})) }, null, 2)}
        </pre>
      </details>
    </div>
  );
}