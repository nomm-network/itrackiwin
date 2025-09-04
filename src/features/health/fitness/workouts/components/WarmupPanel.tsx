// src/features/health/fitness/workouts/components/WarmupPanel.tsx
import React from 'react';

export default function WarmupPanel(props: {
  topKg?: number | null;
  steps?: { kg:number; reps:number; rest_s:number }[];
  exerciseId?: string;
  workoutExerciseId?: string;
  exerciseName?: string;
  topWeightKg?: number | null;
  warmupSteps?: any;
  compact?: boolean;
  onWarmupRecalculated?: () => Promise<void>;
}) {
  // Handle legacy props
  const topWeight = props.topKg ?? props.topWeightKg;
  const steps = props.steps ?? props.warmupSteps ?? [];
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4 mb-6">
      <div className="text-lg font-semibold">Warm-up 🏋️‍♀️</div>
      <div className="text-sm opacity-80 mt-1">
        Strategy: ramped • Top: {topWeight ? `${topWeight}kg` : '—kg'} • Auto-adjusts from feedback
      </div>

      <div className="mt-3 rounded-lg bg-neutral-950/60 p-3">
        {steps.map((s, idx) => (
          <div key={idx} className="flex items-center justify-between py-1">
            <div>{s.kg}kg × {s.reps} reps</div>
            <div className="opacity-70">{s.rest_s}s rest</div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex gap-2">
        <button className="rounded-lg bg-neutral-900 px-3 py-2">🥶 Too little</button>
        <button className="rounded-lg bg-neutral-900 px-3 py-2">🔥 Excellent</button>
        <button className="rounded-lg bg-neutral-900 px-3 py-2">🥵 Too much</button>
      </div>
    </div>
  );
}