// src/features/health/fitness/workouts/components/PrevTargetTile.tsx
import React from 'react';

export default function PrevTargetTile(props: {
  prev?: { kg: number|null; reps: number|null; date?: string|null };
  target?: { kg: number|null; reps: number|null };
}) {
  const prevTxt = props.prev?.kg && props.prev?.reps
    ? `${props.prev.kg}kg × ${props.prev.reps}`
    : 'No previous data';
  const targetTxt = props.target?.kg && props.target?.reps
    ? `${props.target.kg}kg × ${props.target.reps}`
    : '—kg × —';

  return (
    <div className="rounded-lg bg-neutral-800/60 p-3 mb-3">
      <div className="flex items-center justify-between text-sm">
        <div>🧻 Prev <b>{prevTxt}</b></div>
        {props.prev?.date && <div className="opacity-70">{props.prev.date}</div>}
      </div>
      <div className="mt-1 text-sm">🎯 Target <b>{targetTxt}</b></div>
    </div>
  );
}