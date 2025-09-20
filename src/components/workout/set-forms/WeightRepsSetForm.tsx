// workout-flow-v0.8.0 – Old look: weight +/- (2.5), reps +/- (1), feel chips, volume row
'use client';

import { useState } from 'react';
import { useUnifiedSetLogging } from '@/hooks/useUnifiedSetLogging';
import { toast } from '@/hooks/use-toast';

type Props = { workoutId: string; ex: any; onSetLogged: () => void };

const FEELS = ['--', '-', '=', '+', '++'] as const;
type Feel = typeof FEELS[number];

const rpeFromFeel = (f: Feel) => ({ '--': 1, '-': 3, '=': 5, '+': 7, '++': 9 }[f]);

export default function WeightRepsSetForm({ ex, onSetLogged }: Props) {
  const setIndex = (ex?.sets?.filter((s: any) => s.is_completed).length ?? 0) + 1;
  const [weight, setWeight] = useState<number>(ex?.target_weight_kg ?? 20);
  const [reps, setReps] = useState<number>(ex?.target_reps ?? 10);
  const [feel, setFeel] = useState<Feel>('=');
  const { logSet, isLoading } = useUnifiedSetLogging();

  const doLog = async () => {
    try {
      await logSet({
        workoutExerciseId: ex.id,
        setIndex,
        metrics: {
          effort: 'reps',
          weight: weight,
          
          reps,
          rpe: rpeFromFeel(feel),
          notes: '',
        },
        gripIds: undefined,
      });
      onSetLogged();
      toast({ title: 'Set logged', description: `${weight}kg × ${reps}` });
    } catch (e: any) {
      toast({ title: 'Failed to log set', description: e?.message ?? 'Unknown error', variant: 'destructive' });
    }
  };

  return (
    <div>
      {/* Inputs row */}
      <div className="grid grid-cols-2 gap-3">
        {/* Weight */}
        <div>
          <div className="mb-1 text-slate-300">Weight (kg)</div>
          <div className="flex items-center gap-2">
            <button className="h-10 w-10 rounded-lg bg-slate-800" onClick={() => setWeight(Math.max(0, weight - 2.5))}>−</button>
            <input className="h-10 w-full rounded-lg bg-slate-900/60 text-center" value={weight} onChange={(e) => setWeight(Number(e.target.value))} />
            <button className="h-10 w-10 rounded-lg bg-slate-800" onClick={() => setWeight(weight + 2.5)}>+</button>
          </div>
        </div>
        {/* Reps */}
        <div>
          <div className="mb-1 text-slate-300">Reps</div>
          <div className="flex items-center gap-2">
            <button className="h-10 w-10 rounded-lg bg-slate-800" onClick={() => setReps(Math.max(0, reps - 1))}>−</button>
            <input className="h-10 w-full rounded-lg bg-slate-900/60 text-center" value={reps} onChange={(e) => setReps(Number(e.target.value))} />
            <button className="h-10 w-10 rounded-lg bg-slate-800" onClick={() => setReps(reps + 1)}>+</button>
          </div>
        </div>
      </div>

      {/* Feel chips */}
      <div className="mt-4">
        <div className="mb-2 text-slate-300">How did it feel?</div>
        <div className="flex gap-2">
          {FEELS.map((f) => (
            <button
              key={f}
              onClick={() => setFeel(f)}
              className={`rounded-md px-3 py-2 ${feel === f ? 'bg-emerald-500 text-black' : 'bg-slate-800 text-slate-200'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Volume row */}
      <div className="mt-4 rounded-xl border border-slate-700/50 bg-slate-900/40 p-3 text-slate-200">
        This Set&nbsp; {weight}kg × {reps} = {(weight * reps).toFixed(1)}kg volume
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