// wf-step1: Bodyweight form (assist / added). No DB calls here.
// UI intentionally mirrors your current "Weight (kg) + Reps" design.
import React, { useMemo, useState } from 'react';

interface BodyweightSetFormProps {
  exercise: any;
  setIndex: number;
  onSubmit?: (payload: {
    reps?: number;
    weight?: number;            // positive = added, negative = assist, 0 = BW only
    weight_unit?: 'kg' | 'lb';
    effort?: 'reps';
    rpe?: number;
    notes?: string;
    load_meta?: Record<string, any>; // e.g. { assist_type: 'band' }
  }) => Promise<void>;
  // Keep any other props your current form expects (rpe picker, notes, etc.)
  [key: string]: any;
}

const BodyweightSetForm: React.FC<BodyweightSetFormProps> = ({
  exercise,
  setIndex,
  onSubmit,
  ...rest
}) => {
  // Defaults to BW only: reps required, weight optional (added or assist)
  const [reps, setReps] = useState<number>(10);
  const [delta, setDelta] = useState<number>(0); // +added / -assist / 0 = BW
  const [mode, setMode] = useState<'added' | 'assist' | 'bw'>(() =>
    delta > 0 ? 'added' : delta < 0 ? 'assist' : 'bw'
  );
  const [rpe, setRpe] = useState<number | undefined>(undefined);

  // Keep the toggle in sync
  const effectiveDelta = useMemo(() => {
    if (mode === 'bw') return 0;
    if (mode === 'added') return Math.abs(delta);
    return -Math.abs(delta); // assist → negative
  }, [mode, delta]);

  const handleSubmit = async () => {
    if (!onSubmit) return;
    await onSubmit({
      reps,
      weight: effectiveDelta,        // ← IMPORTANT: negative = assist
      weight_unit: 'kg',
      effort: 'reps',
      rpe,
      load_meta: { kind: 'bodyweight' },
    });
  };

  return (
    <div data-wf="wf-step1-bodyweight" className="space-y-3">
      {/* header row (matches your current spacing) */}
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-muted-foreground">Set {setIndex}</div>
        <div className="text-sm px-2 py-0.5 rounded-md bg-secondary">Bodyweight</div>
      </div>

      {/* BW mode switch (BW / Added / Assist) */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setMode('bw')}
          className={`px-3 py-1 rounded-md border ${mode === 'bw' ? 'bg-primary text-primary-foreground' : 'bg-transparent'}`}
        >
          BW
        </button>
        <button
          type="button"
          onClick={() => setMode('added')}
          className={`px-3 py-1 rounded-md border ${mode === 'added' ? 'bg-primary text-primary-foreground' : 'bg-transparent'}`}
        >
          Added
        </button>
        <button
          type="button"
          onClick={() => setMode('assist')}
          className={`px-3 py-1 rounded-md border ${mode === 'assist' ? 'bg-primary text-primary-foreground' : 'bg-transparent'}`}
        >
          Assist
        </button>
      </div>

      {/* Weight delta (kg) — label matches your style */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-sm text-muted-foreground mb-1">
            {mode === 'assist' ? 'Assist (kg)' : mode === 'added' ? 'Added (kg)' : 'Added / Assist (kg)'}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="h-10 w-10 rounded-md border"
              onClick={() => setDelta(d => Math.max(0, Math.round((d - 2.5) * 10) / 10))}
              disabled={mode === 'bw'}
              title="-2.5"
            >
              –
            </button>
            <input
              type="number"
              inputMode="decimal"
              className="h-10 w-24 rounded-md border bg-background text-center"
              value={Math.abs(effectiveDelta)}
              onChange={e => {
                const n = Number(e.target.value || 0);
                setDelta(n);
              }}
              disabled={mode === 'bw'}
              step={2.5}
              min={0}
            />
            <button
              type="button"
              className="h-10 w-10 rounded-md border"
              onClick={() => setDelta(d => Math.round((d + 2.5) * 10) / 10)}
              disabled={mode === 'bw'}
              title="+2.5"
            >
              +
            </button>
          </div>
        </div>

        {/* Reps (required) */}
        <div>
          <div className="text-sm text-muted-foreground mb-1">Reps *</div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="h-10 w-10 rounded-md border"
              onClick={() => setReps(r => Math.max(0, r - 1))}
            >
              –
            </button>
            <input
              type="number"
              inputMode="numeric"
              className="h-10 w-24 rounded-md border bg-background text-center"
              value={reps}
              onChange={e => setReps(Number(e.target.value || 0))}
              min={0}
            />
            <button
              type="button"
              className="h-10 w-10 rounded-md border"
              onClick={() => setReps(r => r + 1)}
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Optional feel / RPE mapping — keep it simple (you can wire to your chips) */}
      <div className="flex items-center gap-2">
        <div className="text-sm text-muted-foreground">RPE</div>
        {[6, 7, 8, 9, 10].map(v => (
          <button
            key={v}
            type="button"
            onClick={() => setRpe(v)}
            className={`h-8 px-2 rounded-md border ${rpe === v ? 'bg-primary text-primary-foreground' : 'bg-transparent'}`}
          >
            {v}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setRpe(undefined)}
          className="h-8 px-2 rounded-md border"
        >
          clear
        </button>
      </div>

      {/* Submit matches your current button semantics */}
      <div className="pt-2">
        <button type="button" onClick={handleSubmit} className="h-10 w-full rounded-md bg-primary text-primary-foreground">
          Log Set {setIndex}
        </button>
      </div>
    </div>
  );
};

export default BodyweightSetForm;
