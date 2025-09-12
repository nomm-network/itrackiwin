import React from 'react';

export const WorkoutDebugPanel: React.FC<{
  enabled?: boolean;
  items: Array<{
    exerciseName: string;
    implement: string;
    loadType: string;
    entryMode: 'per_side' | 'total';
    barKg: number;
    perSideKg: number;
    totalKg: number;
    resolved?: {
      achievable: boolean;
      snappedKg: number;
      residualKg: number;
      source: 'gym' | 'user' | 'fallback';
      perSidePlates?: number[];
      unit?: 'kg' | 'lb';
    }
  }>;
}> = ({ enabled, items }) => {
  if (!enabled || !items?.length) return null;
  return (
    <div className="mt-6 rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
      <div className="text-sm font-medium mb-2">debug: dual-load</div>
      <div className="space-y-2 text-xs text-zinc-300">
        {items.map((it, i) => (
          <div key={i} className="rounded-md border border-zinc-800 p-2">
            <div className="font-semibold">{it.exerciseName}</div>
            <div>implement: {it.implement} · type: {it.loadType} · entry: {it.entryMode}</div>
            <div>bar: {it.barKg} kg · per-side: {it.perSideKg.toFixed(1)} kg · total: {it.totalKg.toFixed(1)} kg</div>
            {it.resolved && (
              <div>
                resolved: {it.resolved.snappedKg.toFixed(1)} kg
                {' '}({it.resolved.achievable ? 'ok' : 'not achievable'})
                {' '}residual: {it.resolved.residualKg.toFixed(2)} kg
                {' '}source: {it.resolved.source}
                {it.resolved.perSidePlates?.length ? (
                  <span> · plates/side: [{it.resolved.perSidePlates.join(', ')}]</span>
                ) : null}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};