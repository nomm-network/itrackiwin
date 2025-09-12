import React, {useState} from 'react';

export default function WarmupDrawer({
  warmupSets,
  warmupCount,
  onStart,
  onComplete,
}: {
  warmupSets: { percentage:number; weight:number; reps:number; restSeconds:number }[];
  warmupCount: number;
  onStart: () => void;
  onComplete: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        className="rounded-md bg-emerald-600 px-3 py-1 text-white"
        onClick={() => { setOpen(true); onStart(); }}
      >
        Warm-up ×{warmupCount}
      </button>

      {open && (
        <div className="fixed inset-0 z-40 bg-black/60" onClick={() => setOpen(false)}>
          <div className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-background p-4">
            <h3 className="mb-2 font-semibold">Warm-up</h3>
            <div className="space-y-2">
              {warmupSets.map((w, i) => (
                <div key={i} className="flex items-center justify-between rounded-md border px-3 py-2">
                  <div className="text-sm">{w.percentage}% • {w.reps} reps</div>
                  <div className="font-medium tabular-nums">{w.weight.toFixed(1)} kg</div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                className="rounded-md bg-emerald-600 px-4 py-2 text-white"
                onClick={() => { setOpen(false); onComplete(); }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}