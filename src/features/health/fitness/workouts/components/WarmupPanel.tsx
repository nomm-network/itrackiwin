// src/features/health/fitness/workouts/components/WarmupPanel.tsx
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export default function WarmupPanel({
  workoutExerciseId,
  steps = [],
  topWeightKg,
  compact = false,
  exerciseName,
  onFeedback
}: {
  workoutExerciseId: string;
  steps?: { kg: number; reps: number; rest_s: number }[];
  topWeightKg?: number | null;
  compact?: boolean;
  exerciseName?: string;
  onFeedback?: (v: "low" | "ok" | "high") => void;
}) {
  const [collapsed, setCollapsed] = useState(false);

  const pick = async (v: "low" | "ok" | "high") => {
    // Optional: await supabase.from("workout_exercise_feedback")
    //   .upsert({ workout_exercise_id: workoutExerciseId, warmup_feedback: v });
    setCollapsed(true);
    onFeedback?.(v);
  };

  if (collapsed) {
    return (
      <div className="mt-2 flex items-center gap-2 text-xs opacity-80">
        <button onClick={() => setCollapsed(false)} className="hover:underline">
          Show warm-up
        </button>
        <span>•</span>
        <span>Target: {topWeightKg ?? "—"} kg</span>
      </div>
    );
  }

  return (
    <div className={`rounded border p-2 ${compact ? "text-xs space-y-1" : "space-y-2"}`}>
      <div className="font-medium">Warm-up</div>
      <div className={`grid ${compact ? "gap-1" : "gap-2"}`}>
        {steps.map((s, i) => (
          <div key={i} className="flex justify-between">
            <span>{s.kg} kg × {s.reps}</span>
            <span className="opacity-70">{s.rest_s}s</span>
          </div>
        ))}
        {!steps.length && <div className="opacity-60">No warm-up steps</div>}
      </div>
      <div className="flex gap-1">
        <button className="btn btn-xs px-2 py-1 text-xs rounded bg-blue-100 hover:bg-blue-200" onClick={() => pick("low")}>
          🧊 Too little
        </button>
        <button className="btn btn-xs px-2 py-1 text-xs rounded bg-green-100 hover:bg-green-200" onClick={() => pick("ok")}>
          🔥 Excellent
        </button>
        <button className="btn btn-xs px-2 py-1 text-xs rounded bg-red-100 hover:bg-red-200" onClick={() => pick("high")}>
          🥵 Too much
        </button>
      </div>
    </div>
  );
}