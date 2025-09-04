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
          <label className="text-sm text-muted-foreground">Weight (kg)</label>
          <input
            className="w-full mt-1 rounded-md bg-background border border-border px-3 py-2 text-foreground"
            type="number"
            step="0.5"
            value={props.weight ?? ''}
            onChange={e => props.onChange(e.target.value === '' ? null : Number(e.target.value), props.reps)}
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Reps</label>
          <input
            className="w-full mt-1 rounded-md bg-background border border-border px-3 py-2 text-foreground"
            type="number"
            value={props.reps ?? ''}
            onChange={e => props.onChange(props.weight, e.target.value === '' ? null : Number(e.target.value))}
          />
        </div>
      </div>

      <div className="mt-3">
        <label className="text-sm text-muted-foreground">How did that feel?</label>
        <div className="mt-2 flex gap-2">
          {[0,1,2,3,4].map(i => (
            <button
              key={i}
              className={`rounded-md px-3 py-2 bg-card border transition-all ${
                props.rpe===i ? 'ring-2 ring-primary' : 'border-border hover:border-primary/50'
              }`}
              onClick={() => props.onRpe(i)}
            >{['😵‍💫','😖','🙂','😁','😎'][i]}</button>
          ))}
        </div>
      </div>

      <div className="mt-3 rounded-md bg-card border border-border px-3 py-2">
        <button
          className={`w-full text-left transition-colors ${
            props.pain==='none' ? 'text-green-400' : 'text-foreground'
          }`}
          onClick={() => props.onPain(props.pain==='none'?'minor':'none')}
        >🔁 No pain</button>
      </div>

      <button
        className="mt-4 w-full rounded-lg bg-primary text-primary-foreground font-semibold py-3 hover:bg-primary/90 transition-colors"
        onClick={props.onLog}
      >
        Log Set {props.setIndex}
      </button>
    </div>
  );
}