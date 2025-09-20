// workout-flow-v0.8.0 (SOT) – Restored old UI + new modes
'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import SmartSetForm from '@/components/workout/set-forms/SmartSetForm';
import WorkoutDebugFooter from '@/components/workout/WorkoutDebugFooter';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type Props = {
  workoutId: string;
  workout: any | null;
  loading: boolean;
  shouldShowReadiness: boolean;
  setShouldShowReadiness: (v: boolean) => void;
};

function formatMMSS(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function WorkoutSessionBody({
  workoutId,
  workout,
  loading,
}: Props) {
  const queryClient = useQueryClient();
  const sorted = useMemo(
    () =>
      (workout?.exercises ?? []).slice().sort((a: any, b: any) => (a?.order_index ?? 0) - (b?.order_index ?? 0)),
    [workout?.exercises],
  );

  const [currentExerciseId, setCurrentExerciseId] = useState<string | null>(() => {
    const key = `wk_${workoutId}_ex`;
    try {
      const saved = localStorage.getItem(key);
      if (saved && sorted.some((e: any) => e.id === saved)) return saved;
    } catch {}
    return sorted[0]?.id ?? null;
  });

  useEffect(() => {
    const key = `wk_${workoutId}_ex`;
    if (currentExerciseId) {
      try {
        localStorage.setItem(key, currentExerciseId);
      } catch {}
    }
  }, [currentExerciseId, workoutId]);

  const current = useMemo(() => sorted.find((e: any) => e.id === currentExerciseId) ?? sorted[0], [sorted, currentExerciseId]);

  const sets = current?.sets ?? [];
  const completed = sets.filter((s: any) => s.is_completed).length;
  const currentSetNumber = completed + 1;

  // rest timer (starts from set 2)
  const [restStart, setRestStart] = useState<Date | null>(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!restStart) return;
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - restStart.getTime()) / 1000)), 1000);
    return () => clearInterval(t);
  }, [restStart]);

  // mark warmup done on demand
  const markWarmupDone = async () => {
    if (!current?.id) return;
    const merged = {
      ...(current.attribute_values_json || {}),
      warmup_done: true,
    };
    await supabase.from('workout_exercises').update({ attribute_values_json: merged }).eq('id', current.id);
    queryClient.invalidateQueries({ queryKey: ['workout-session', workoutId] });
  };

  // after any set logs, start rest for next set
  const onSetLogged = useCallback(() => {
    if (currentSetNumber >= 1) {
      setRestStart(new Date());
      setElapsed(0);
      queryClient.invalidateQueries({ queryKey: ['workout-session', workoutId] });
    }
  }, [currentSetNumber, workoutId, queryClient]);

  // name resolution – matches old build
  const exName =
    current?.display_name ||
    current?.exercise?.display_name ||
    current?.exercise?.name ||
    'Exercise';

  const hasWarmup =
    !!current?.attribute_values_json?.warmup &&
    !current?.attribute_values_json?.warmup_done;

  if (loading) return null;

  if (!sorted.length) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-slate-700/50 bg-slate-900/40 p-6 text-slate-300">
          No exercises found in this workout.
        </div>
        <WorkoutDebugFooter
          info={{
            version: 'workout-flow-v0.8.0',
            workoutId,
            exerciseId: current?.id ?? null,
            exerciseTitle: exName,
            hasWarmup,
            router: 'main',
            logger: 'unified',
            restTimer: !!restStart,
            grips: !!current?.exercise?.allows_grips,
            entryMode: 'total',
          }}
        />
      </div>
    );
  }

  const totalExercises = sorted.length;
  const targetSets = current?.target_sets ?? 3;

  const lastCompleted = sets.filter((s: any) => s.is_completed).slice(-1)[0] ?? null;

  return (
    <div className="px-4 pb-28 pt-4">
      {/* Header row (old style): title + badges */}
      <div className="mb-3 flex items-center justify-between">
        <div className="text-[22px] font-extrabold tracking-tight">{exName}</div>
        <div className="flex items-center gap-2">
          {/* mini menu icons: hand, # with badge, flame */}
          {current?.exercise?.allows_grips && (
            <div title="Grips" className="rounded-full bg-slate-800/70 px-2 py-1 text-slate-200">🖐️</div>
          )}
          <div title="Sets" className="relative rounded-full bg-slate-800/70 px-2 py-1 text-slate-200">
            #
            <span className="absolute -right-2 -top-2 rounded-full bg-slate-300 px-[6px] text-[10px] font-bold text-slate-900">
              {completed}/{targetSets}
            </span>
          </div>
          {hasWarmup && <div title="Warmup available" className="rounded-full bg-slate-800/70 px-2 py-1 text-amber-400">🔥</div>}
        </div>
      </div>

      {/* Warmup card (old look) */}
      {hasWarmup && (
        <div className="mb-4 rounded-2xl border border-amber-700/30 bg-amber-900/20 p-5">
          <div className="mb-2 text-lg font-semibold text-amber-300">🔥 Warmup</div>
          <p className="text-slate-300/80">Complete your warmup before starting the first set</p>
          <button
            onClick={markWarmupDone}
            className="mt-3 rounded-lg bg-slate-200 px-4 py-2 text-slate-900"
          >
            Start Warmup
          </button>
        </div>
      )}

      {/* Prev/Target card (old look) */}
      <div className="mb-3 rounded-2xl border border-slate-700/50 bg-slate-900/40 p-4">
        <div className="flex items-center justify-between">
          <div className="text-slate-300">
            📦 {lastCompleted ? (
              <>
                <span className="font-semibold">{lastCompleted.weight_kg ?? 0}kg</span> ×{' '}
                <span className="font-semibold">{lastCompleted.reps ?? 0}</span>
              </>
            ) : (
              <>No previous data</>
            )}
          </div>
          {currentSetNumber >= 2 && (
            <div className="rounded-xl bg-emerald-500/10 px-3 py-1 text-emerald-400">
              {formatMMSS(elapsed)}
            </div>
          )}
        </div>
      </div>

      {/* Current Set header (old look) */}
      <div
        className={cn(
          'mb-3 rounded-2xl border p-4',
          'border-emerald-700/30 bg-emerald-900/20',
        )}
      >
        <div className="mb-3 flex items-center gap-3">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-emerald-500 text-black font-bold">
            {currentSetNumber}
          </div>
          <div className="text-xl font-semibold">Current Set</div>
        </div>

        <SmartSetForm
          workoutId={workoutId}
          workoutExercise={current}
          onSetLogged={onSetLogged}
        />
      </div>

      {/* Completed sets list (old chips) */}
      {sets.filter((s: any) => s.is_completed).length > 0 && (
        <div className="mt-4 space-y-2">
          {sets
            .filter((s: any) => s.is_completed)
            .map((s: any) => (
              <div key={s.id} className="rounded-xl border border-slate-700/50 bg-slate-900/40 px-3 py-2 text-slate-200">
                Set {s.set_index}: {s.weight_kg ?? 0}kg × {s.reps ?? 0} {s.rpe ? `• RPE ${s.rpe}` : ''}
              </div>
            ))}
        </div>
      )}

      <WorkoutDebugFooter
        info={{
          version: 'workout-flow-v0.8.0',
          workoutId,
          exerciseId: current?.id ?? null,
          exerciseTitle: exName,
          effort_mode: current?.exercise?.effort_mode ?? null,
          load_mode: current?.exercise?.load_mode ?? null,
          hasWarmup,
          shouldShowReadiness: false,
          router: 'main',
          logger: 'unified',
          restTimer: currentSetNumber >= 2,
          grips: !!current?.exercise?.allows_grips,
          warmup: hasWarmup,
          warmupSteps: current?.attribute_values_json?.warmup?.steps?.length ?? 0,
          entryMode: current?.exercise?.load_mode === 'bodyweight_plus_optional' ? 'bodyweight' : 'total',
        }}
      />
    </div>
  );
}