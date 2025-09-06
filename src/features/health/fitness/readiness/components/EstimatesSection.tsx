import React, { useState } from 'react';
import { useTemplateEstimates, saveEstimates } from '../hooks/useTemplateEstimates';

interface EstimatesSectionProps {
  templateId?: string;
  onSaved?: () => void;
}

export function EstimatesSection({ templateId, onSaved }: EstimatesSectionProps) {
  const { rows, loading, error } = useTemplateEstimates(templateId);
  const [values, setValues] = useState<Record<string, number>>({});

  if (!templateId) return null;
  if (loading) return <div className="text-sm opacity-60">Loading exercise estimates…</div>;
  if (error) return <div className="text-sm text-red-400">Estimates error: {error}</div>;
  if (!rows.length) return null;

  return (
    <div className="mt-6 rounded-lg border border-emerald-900/40 bg-[#0d1a17] p-4">
      <div className="mb-3 text-emerald-300 font-semibold">Estimates (10 reps)</div>
      <div className="space-y-3">
        {rows.map(r => (
          <label key={r.exercise_id} className="flex items-center justify-between gap-3">
            <span className="text-sm">{r.exercise_name}</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                inputMode="decimal"
                defaultValue={r.est_10rm_kg ?? ''}
                onChange={(e) => setValues(v => ({ ...v, [r.exercise_id]: Number(e.target.value) }))}
                className="w-24 rounded-md bg-[#0f1f1b] border border-emerald-800 px-3 py-1 text-right"
                placeholder="kg"
              />
              <span className="text-xs opacity-70">kg × 10</span>
            </div>
          </label>
        ))}
      </div>

      <button
        type="button"
        className="mt-4 w-full rounded-md bg-emerald-600 py-2 text-sm font-semibold hover:bg-emerald-500"
        onClick={async () => { await saveEstimates(values); onSaved?.(); }}
      >
        Save estimates
      </button>
    </div>
  );
}