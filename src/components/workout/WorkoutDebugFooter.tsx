// workout-flow-v1.0.0 (SOT) – DO NOT DUPLICATE
'use client';

import { useState } from 'react';

export default function WorkoutDebugFooter({
  info,
}: {
  info: {
    version: string;
    templateId?: string | null;
    workoutId?: string | null;
    exerciseId?: string | null;
    exerciseTitle?: string | null;
    effort_mode?: string | null;
    load_mode?: string | null;
    hasWarmup: boolean;
    shouldShowReadiness?: boolean;
    router: string;
    logger: string;
    restTimer: boolean;
    grips: boolean;
    gripKey?: string | null;
    warmup?: boolean;
    warmupSteps?: number;
    entryMode: 'per_side' | 'total' | 'bodyweight';
    payloadPreview?: Record<string, any>;
  };
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-800 bg-slate-950/95 p-2 text-[11px] text-slate-300">
      <button className="font-mono" onClick={() => setOpen((v) => !v)}>
        🐛 {info.version} {open ? '▲' : '▼'}
      </button>
      {open && (
        <pre className="mt-2 max-h-56 overflow-auto rounded bg-slate-900 p-2">
{JSON.stringify(info, null, 2)}
        </pre>
      )}
    </div>
  );
}