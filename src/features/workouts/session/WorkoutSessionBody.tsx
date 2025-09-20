// workout-flow-v1.0.0 (SOT) – DO NOT DUPLICATE
'use client';

import { useMemo, useState, useEffect } from 'react';
import SmartSetForm from '@/components/workout/set-forms/SmartSetForm';
import WorkoutDebugFooter from '@/components/workout/WorkoutDebugFooter';

export default function WorkoutSessionBody({
  workout,
  onReload,
}: {
  workout: any;
  onReload: () => void;
}) {

  const exercises = useMemo(
    () => (workout.exercises ?? []).slice().sort((a: any, b: any) => a.order_index - b.order_index),
    [workout.exercises],
  );
  const [index, setIndex] = useState(0);
  const current = exercises[index];

  const hasWarmup =
    !!current?.attribute_values_json?.warmup &&
    Object.keys(current.attribute_values_json.warmup || {}).length > 0;

  // Rest timer: start showing after first completed set
  const completed = (current?.sets || []).filter((s: any) => s.is_completed);
  const showTimer = completed.length >= 1;

  const title =
    current?.display_name ||
    current?.exercise?.display_name ||
    current?.exercise?.name ||
    'Exercise';

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="px-5 pt-3">
        <div className="text-2xl font-semibold">{title}</div>
        <div className="mt-2 flex items-center gap-3 text-sm text-slate-300">
          {/* hand (grips) */}
          {current?.exercise?.allows_grips && (
            <span className="inline-flex items-center gap-1">
              <span>🤚</span>
            </span>
          )}
          {/* sets badge */}
          <span className="inline-flex items-center gap-1">
            <span>#</span>
            <span className="rounded-full bg-slate-800 px-2 py-0.5">
              {completed.length}/{current?.target_sets ?? 3}
            </span>
          </span>
          {/* warmup icon */}
          {hasWarmup && <span>🔥</span>}
        </div>
      </div>

      {/* Warmup card */}
      {hasWarmup && completed.length === 0 && (
        <div className="mx-5 mt-4 rounded-2xl border border-amber-900/40 bg-amber-950/30 p-5">
          <div className="mb-2 text-xl font-semibold">🔥 Warmup</div>
          <p className="mb-4 text-slate-300">
            Complete your warmup before starting the first set
          </p>
          <button
            className="h-11 rounded-xl bg-slate-800 px-4 text-slate-100 hover:bg-slate-700"
            onClick={() => {
              // noop for now; if you have a modal, open it here
            }}
          >
            Start Warmup
          </button>
        </div>
      )}

      {/* Current set card */}
      <div className="mx-5 mt-4 rounded-2xl border border-emerald-900/40 bg-emerald-950/30 p-5">
        <div className="mb-3 flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-black">
            {(completed.length ?? 0) + 1}
          </span>
          <span className="text-lg font-semibold">Current Set</span>
          <div className="ml-auto text-emerald-300">
            {showTimer ? /* you likely have a timer component */ '01:10' : null}
          </div>
        </div>

        {/* Route to the right set form */}
        <SmartSetForm exercise={current} onLogged={onReload} />
      </div>

      {/* Completed sets list */}
      {(current?.sets || [])
        .filter((s: any) => s.is_completed)
        .map((s: any) => (
          <div
            key={s.id}
            className="mx-5 mt-3 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm">Set {s.set_index}</div>
                <div className="text-slate-300">
                  {(s.weight_kg ?? s.weight) ?? 0}kg × {s.reps} reps
                </div>
              </div>
              <div>{/* place feel emoji if you map RPE */}</div>
            </div>
          </div>
        ))}

      <WorkoutDebugFooter
        info={{
          version: 'workout-flow-v1.0.0',
          workoutId: workout.id,
          exerciseId: current?.id,
          exerciseTitle: title,
          hasWarmup,
          router: 'main',
          logger: 'unified',
          warmup: hasWarmup,
          warmupSteps: current?.attribute_values_json?.warmup?.steps?.length || 0,
          entryMode: current?.exercise?.load_mode === 'bodyweight_plus_optional' ? 'bodyweight' : 'total',
          restTimer: showTimer,
          grips: !!current?.exercise?.allows_grips,
        }}
      />

      {/* Bottom nav between exercises */}
      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-slate-800 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto flex max-w-xl items-center justify-between px-5 py-3">
          <button
            className="rounded-xl bg-slate-800 px-4 py-2 text-slate-100 disabled:opacity-50"
            disabled={index === 0}
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
          >
            ◀︎ Prev
          </button>
          <div className="text-slate-300">
            {index + 1}/{exercises.length}
          </div>
          <button
            className="rounded-xl bg-slate-800 px-4 py-2 text-slate-100 disabled:opacity-50"
            disabled={index >= exercises.length - 1}
            onClick={() => setIndex((i) => Math.min(exercises.length - 1, i + 1))}
          >
            Next ▶︎
          </button>
        </div>
      </div>
    </div>
  );
}