import React, { useState, useEffect } from 'react';
import { useTemplateEstimates } from '../hooks/useTemplateEstimates';
import { getMissingEstimateExerciseIds } from '../hooks/useMissingEstimates';

interface EstimatesSectionProps {
  templateId?: string;
  onEstimatesChange?: (estimates: Record<string, number>) => void;
  estimates: Record<string, number>;
}

export function EstimatesSection({ templateId, onEstimatesChange, estimates }: EstimatesSectionProps) {
  const { rows, loading, error } = useTemplateEstimates(templateId);
  const [missingIds, setMissingIds] = useState<string[]>([]);

  useEffect(() => {
    if (!rows.length) return;
    
    getMissingEstimateExerciseIds(rows.map(r => r.exercise_id)).then(setMissingIds);
  }, [rows]);

  if (!templateId) return null;
  if (loading) return <div className="text-sm opacity-60">Loading exercise estimates…</div>;
  if (error) return <div className="text-sm text-red-400">Estimates error: {error}</div>;
  
  const missingRows = rows.filter(r => missingIds.includes(r.exercise_id));
  if (!missingRows.length) return null;

  return (
    <div className="mt-6 rounded-lg border border-emerald-900/40 bg-[#0d1a17] p-4">
      <div className="mb-3 text-emerald-300 font-semibold">Estimated 10-rep weight (kg)</div>
      <div className="mb-2 text-xs text-emerald-500/70">Required for exercises without history</div>
      <div className="space-y-3">
        {missingRows.map(r => (
          <label key={r.exercise_id} className="flex items-center justify-between gap-3">
            <span className="text-sm">{r.exercise_name}</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                inputMode="decimal"
                value={estimates[r.exercise_id] || ''}
                onChange={(e) => onEstimatesChange?.({ ...estimates, [r.exercise_id]: Number(e.target.value) })}
                className="w-24 rounded-md bg-[#0f1f1b] border border-emerald-800 px-3 py-1 text-right"
                placeholder="kg"
                required
              />
              <span className="text-xs opacity-70">kg × 10</span>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}