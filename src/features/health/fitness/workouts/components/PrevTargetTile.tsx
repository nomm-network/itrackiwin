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
    <div className="rounded-lg bg-card border border-border p-3 mb-3">
      <div className="flex items-center justify-between text-sm">
        <div>🧻 Prev <span className="font-semibold">{prevTxt}</span></div>
        {props.prev?.date && <div className="text-muted-foreground">{props.prev.date}</div>}
      </div>
      <div className="mt-1 text-sm">🎯 Target <span className="font-semibold">{targetTxt}</span></div>
    </div>
  );
}