import React from 'react';

type WarmupStep = { kg: number; reps: number; rest_s?: number };
type WorkoutSet = { id: string; set_index: number; is_completed?: boolean };

export interface WorkoutExerciseCardProps {
  id: string;
  name: string;
  completedSets?: WorkoutSet[];
  warmup?: WarmupStep[] | null;
  targetReps?: number | null;
  targetWeightKg?: number | null;
}

export default function WorkoutExerciseCard({
  id,
  name,
  completedSets = [],
  warmup,
  targetReps,
  targetWeightKg
}: WorkoutExerciseCardProps) {
  const doneCount = completedSets.filter(s => s.is_completed).length;

  return (
    <section
      key={id}
      className="rounded-2xl border border-white/10 bg-[#0f1f1b] p-4 mb-4"
    >
      {/* header */}
      <div className="flex items-center justify-between">
        <h3 className="text-[20px] font-semibold">{name}</h3>
        <span className="px-3 py-1 rounded-full text-sm bg-white/10">
          {doneCount}/{Math.max(doneCount, 3)} sets
        </span>
      </div>

      {/* target pill (matches old look) */}
      <div className="mt-3 rounded-xl bg-[#0d1a17] px-3 py-2 inline-flex items-center gap-2">
        <span className="text-[13px] opacity-80">🎯</span>
        <span className="text-[15px]">
          {targetWeightKg ?? '—'}kg × {targetReps ?? '—'} reps
        </span>
      </div>

      {/* compact warmup preview (steps only – full panel is step 3) */}
      {Array.isArray(warmup) && warmup.length > 0 && (
        <div className="mt-4 rounded-xl bg-[#0d1a17] px-4 py-3">
          <div className="text-[13px] opacity-80 mb-2">Warm-up (compact)</div>
          <ul className="space-y-1">
            {warmup.map((w, i) => (
              <li key={i} className="flex justify-between text-[15px]">
                <span>– {w.kg}kg × {w.reps} reps</span>
                <span className="opacity-60">{w.rest_s ? `${w.rest_s}s` : ''}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}