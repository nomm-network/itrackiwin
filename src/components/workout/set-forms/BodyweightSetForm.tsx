// workout-flow-v0.8.0 – Old look: reps + "Added / Assist (kg)" with quick chips (BW, +5,+10,-5)
'use client';

import { useState } from 'react';
import { useUnifiedSetLogging } from '@/hooks/useUnifiedSetLogging';
import { toast } from '@/hooks/use-toast';

type Props = { workoutId: string; ex: any; onSetLogged: () => void };

export default function BodyweightSetForm({ ex, onSetLogged }: Props) {
  const setIndex = (ex?.sets?.filter((s: any) => s.is_completed).length ?? 0) + 1;
  const [reps, setReps] = useState<number>(ex?.target_reps ?? 8);
  const [delta, setDelta] = useState<number>(0); // + added / - assist
  const [feel, setFeel] = useState<'--' | '-' | '=' | '+' | '++'>('=');
  const { logSet, isLoading } = useUnifiedSetLogging();

  const doLog = async () => {
    try {
      await logSet({
        workoutExerciseId: ex.id,
        setIndex,
        metrics: {
          effort: 'reps',
          reps,
          weight: delta, // signed; PR code will handle sign
          
          rpe: ({ '--': 1, '-': 3, '=': 5, '+': 7, '++': 9 } as const)[feel],
          settings: {},
          load_meta: {},
        },
      });
      onSetLogged();
      toast({ title: 'Set logged', description: `BW ${delta >= 0 ? `+${delta}` : `${delta}`}kg × ${reps}` });
    } catch (e: any) {
      toast({ title: 'Failed to log set', description: e?.message ?? 'Unknown error', variant: 'destructive' });
    }
  };

  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        {/* Reps */}
        <div>
          <div className="mb-1 text-slate-300">Reps</div>
          <div className="flex items-center gap-2">
            <button className="h-10 w-10 rounded-lg bg-slate-800" onClick={() => setReps(Math.max(0, reps - 1))}>−</button>
            <input className="h-10 w-full rounded-lg bg-slate-900/60 text-center" value={reps} onChange={(e) => setReps(Number(e.target.value))} />
            <button className="h-10 w-10 rounded-lg bg-slate-800" onClick={() => setReps(reps + 1)}>+</button>
          </div>
        </div>

        {/* Added/Assist */}
        <div>
          <div className="mb-1 text-slate-300">Added / Assist (kg)</div>
          <div className="flex items-center gap-2">
            <button className="h-10 w-10 rounded-lg bg-slate-800" onClick={() => setDelta(delta - 5)}>−</button>
            <input className="h-10 w-full rounded-lg bg-slate-900/60 text-center" value={delta} onChange={(e) => setDelta(Number(e.target.value))} />
            <button className="h-10 w-10 rounded-lg bg-slate-800" onClick={() => setDelta(delta + 5)}>+</button>
          </div>
          <div className="mt-2 text-xs text-slate-400">Tip: use negative for assistance</div>
        </div>
      </div>

      {/* Quick chips */}
      <div className="mt-3 flex flex-wrap gap-2">
        <button className="rounded-md bg-slate-800 px-3 py-1 text-slate-200" onClick={() => setDelta(0)}>BW</button>
        {[5, 10, 15, 20].map((v) => (
          <button key={v} className="rounded-md bg-slate-800 px-3 py-1 text-slate-200" onClick={() => setDelta(v)}>+{v}kg</button>
        ))}
        <button className="rounded-md bg-slate-800 px-3 py-1 text-slate-200" onClick={() => setDelta(-5)}>-5kg</button>
      </div>

      {/* Feel */}
      <div className="mt-4">
        <div className="mb-2 text-slate-300">How did it feel?</div>
        <div className="flex gap-2">
          {(['--', '-', '=', '+', '++'] as const).map((f) => (
            <button key={f} className={`rounded-md px-3 py-2 ${feel === f ? 'bg-emerald-500 text-black' : 'bg-slate-800 text-slate-200'}`} onClick={() => setFeel(f)}>{f}</button>
          ))}
        </div>
      </div>

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