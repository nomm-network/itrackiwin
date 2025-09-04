// src/features/health/fitness/workouts/components/SetControls.tsx
import React from 'react';

export default function SetControls(props: {
  weight: number | null;
  reps: number | null;
  onChange: (w: number|null, r: number|null) => void;
  rpe: number | null;
  onRpe: (v: number|null) => void;
  pain: 'none'|'minor'|'hurt';
  onPain: (p: 'none'|'minor'|'hurt') => void;
  onLog: () => void;
  setIndex: number;
}) {
  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm opacity-80">Weight (kg)</label>
          <input
            className="w-full mt-1 rounded-md bg-neutral-900 px-3 py-2"
            type="number"
            value={props.weight ?? ''}
            onChange={e => props.onChange(e.target.value === '' ? null : Number(e.target.value), props.reps)}
          />
        </div>
        <div>
          <label className="text-sm opacity-80">Reps</label>
          <input
            className="w-full mt-1 rounded-md bg-neutral-900 px-3 py-2"
            type="number"
            value={props.reps ?? ''}
            onChange={e => props.onChange(props.weight, e.target.value === '' ? null : Number(e.target.value))}
          />
        </div>
      </div>

      <div className="mt-3">
        <label className="text-sm opacity-80">How did that feel?</label>
        <div className="mt-2 flex gap-2">
          {[0,1,2,3,4].map(i => (
            <button
              key={i}
              className={`rounded-md px-3 py-2 bg-neutral-900 ${props.rpe===i?'ring-2 ring-emerald-500':''}`}
              onClick={() => props.onRpe(i)}
            >{['😵‍💫','😖','🙂','😁','😎'][i]}</button>
          ))}
        </div>
      </div>

      <div className="mt-3 rounded-md bg-neutral-900 px-3 py-2">
        <button
          className={`w-full text-left ${props.pain==='none'?'text-emerald-400':''}`}
          onClick={() => props.onPain(props.pain==='none'?'minor':'none')}
        >🔁 No pain</button>
      </div>

      <button
        className="mt-4 w-full rounded-lg bg-emerald-500 text-black font-semibold py-3"
        onClick={props.onLog}
      >
        Log Set {props.setIndex}
      </button>
    </div>
  );
}