// src/features/health/fitness/workouts/components/WarmupPanel.tsx
import React from 'react';

export default function WarmupPanel(props: {
  topKg: number | null;
  steps: { kg:number; reps:number; rest_s:number }[];
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 mb-6">
      <div className="text-lg font-semibold">Warm-up 🏋️‍♀️</div>
      <div className="text-sm text-muted-foreground mt-1">
        Strategy: ramped • Top: {props.topKg ? `${props.topKg}kg` : '—kg'} • Auto-adjusts from feedback
      </div>

      <div className="mt-3 rounded-lg bg-secondary/50 p-3">
        {props.steps.map((s, idx) => (
          <div key={idx} className="flex items-center justify-between py-1">
            <div>{s.kg}kg × {s.reps} reps</div>
            <div className="text-muted-foreground">{s.rest_s}s rest</div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex gap-2">
        <button className="rounded-lg bg-secondary px-3 py-2 text-sm hover:bg-secondary/80 transition-colors">🥶 Too little</button>
        <button className="rounded-lg bg-secondary px-3 py-2 text-sm hover:bg-secondary/80 transition-colors">🔥 Excellent</button>
        <button className="rounded-lg bg-secondary px-3 py-2 text-sm hover:bg-secondary/80 transition-colors">🥵 Too much</button>
      </div>
    </div>
  );
}