import React, { useState } from 'react';

type Step = { kg:number; reps:number; rest_s:number };

export default function WarmupPanel({
  topWeightKg,
  warmupSteps,
  compact = true,
}: {
  topWeightKg: number | null;
  warmupSteps: Step[];
  compact?: boolean;
}) {
  const [open, setOpen] = useState(true);
  const steps = warmupSteps?.length ? warmupSteps : [];

  if (!steps.length && topWeightKg == null) return null;

  return (
    <div className="mb-3 rounded-lg border border-emerald-900/30 bg-[#0f1f1b]">
      <button
        className="flex w-full items-center justify-between px-3 py-2 text-sm text-emerald-300"
        onClick={() => setOpen(v => !v)}
      >
        <span>Warmup</span>
        <span className="text-emerald-400/80">{open ? '−' : '+'}</span>
      </button>

      {open && (
        <div className={`grid gap-2 px-3 pb-3 ${compact ? 'grid-cols-3' : 'grid-cols-4'}`}>
          {steps.map((s, i) => (
            <div key={i} className="rounded-md bg-[#0b1714] px-2 py-2 text-center">
              <div className="text-xs text-emerald-400/80">{Math.round((s.kg / (topWeightKg || s.kg))*100)}%</div>
              <div className="text-sm text-emerald-200">{s.kg} kg</div>
              <div className="text-[11px] text-emerald-400/70">{s.reps} reps • {s.rest_s}s</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}