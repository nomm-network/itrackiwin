// BodyweightSetForm.tsx
// Minimal, design-safe form for bodyweight exercises with Assist/Added/BW quick actions.
// Uses the unified logging hook you already have: useUnifiedSetLogging (weight_kg, reps, rpe, notes, etc.)
// Renders in the same layout system (cards, counters, chips) used in v106.

import * as React from 'react';
import { useState, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useUnifiedSetLogging } from '@/hooks/useUnifiedSetLogging';

// Props are aligned with Step 1 router
type Grip = { id: string; name: string } | string;
export type BodyweightSetFormProps = {
  workoutExerciseId: string;
  setIndex: number;
  initial?: {
    reps?: number;
    weightKg?: number; // positive=added, negative=assist, 0=BWO
    rpe?: number;
  };
  grips?: Grip[];             // list of available grips (optional)
  selectedGripIds?: string[]; // current selected grips (optional)
  onLogged?: (setId: string) => void;
  className?: string;
};

// simple feel → RPE mapping that matches your chips ( -- - = + ++ )
const FEEL_TO_RPE: Record<string, number> = {
  '--': 1,
  '-': 3,
  '=': 5,
  '+': 7,
  '++': 9,
};

export default function BodyweightSetForm({
  workoutExerciseId,
  setIndex,
  initial,
  grips,
  selectedGripIds,
  onLogged,
  className,
}: BodyweightSetFormProps) {
  // UI state
  const [reps, setReps] = useState<number>(initial?.reps ?? 8);
  const [deltaKg, setDeltaKg] = useState<number>(initial?.weightKg ?? 0); // +added, -assist, 0=BWO
  const [feel, setFeel] = useState<'--' | '-' | '=' | '+' | '++'>('=');
  const [notes, setNotes] = useState<string>('');
  const [assistMode, setAssistMode] = useState<'assist' | 'added' | 'bw'>(
    initial?.weightKg === 0 ? 'bw' : initial?.weightKg! < 0 ? 'assist' : 'added'
  );

  const { logSet, isLoading } = useUnifiedSetLogging();

  // When user toggles mode, normalize deltaKg sign
  const normalizedDelta = useMemo(() => {
    if (assistMode === 'bw') return 0;
    if (assistMode === 'assist') return -Math.abs(deltaKg);
    return Math.abs(deltaKg); // added
  }, [assistMode, deltaKg]);

  // Label helpers
  const rightUnitHint =
    assistMode === 'assist'
      ? 'negative = more assistance'
      : assistMode === 'added'
      ? 'positive = more weight'
      : 'bodyweight only';

  const canLog = reps > 0 && !isLoading;

  const handleQuick = (v: number) => {
    // v is signed (e.g., -5 assist, +10 added). Respect current mode.
    if (assistMode === 'bw') {
      setAssistMode(v < 0 ? 'assist' : v > 0 ? 'added' : 'bw');
      setDeltaKg(Math.abs(v));
    } else if (assistMode === 'assist') {
      setDeltaKg(Math.max(0, Math.abs(v))); // store magnitude, sign is applied by normalizedDelta
    } else {
      setDeltaKg(Math.max(0, Math.abs(v)));
    }
  };

  const onSubmit = useCallback(async () => {
    if (!canLog) return;
    try {
      const payloadGripIds =
        selectedGripIds && selectedGripIds.length > 0 ? selectedGripIds : undefined;

      // Map to your DB columns (the hook does the exact mapping to weight_kg, input_unit, etc.)
      const setId = await logSet({
        workoutExerciseId,
        setIndex,
        metrics: {
          reps,
          weight: normalizedDelta,        // ← IMPORTANT: negative = assist, positive = added, 0 = BW only
          weight_unit: 'kg',
          rpe: FEEL_TO_RPE[feel],
          notes: notes || undefined,
          effort: 'reps',
          // always objects for JSONB (hook ensures defaults)
          settings: {},
          load_meta: { source: 'bw-form-v1' },
        },
        gripIds: payloadGripIds,
      });

      onLogged?.(String(setId));
    } catch (e) {
      // Keep the UI minimal; your global toast/error boundary will show details
      console.error('Bodyweight log error', e);
    }
  }, [canLog, feel, gripIdsToString(selectedGripIds), logSet, normalizedDelta, notes, reps, setIndex, workoutExerciseId]);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Mode chips: Assist / BW / Added */}
      <div className="flex items-center gap-2">
        <ModeChip
          label="Assist"
          active={assistMode === 'assist'}
          onClick={() => setAssistMode('assist')}
        />
        <ModeChip
          label="BW"
          active={assistMode === 'bw'}
          onClick={() => setAssistMode('bw')}
        />
        <ModeChip
          label="Added"
          active={assistMode === 'added'}
          onClick={() => setAssistMode('added')}
        />
      </div>

      {/* Weight row */}
      <div className="rounded-xl bg-card/40 p-3">
        <div className="text-sm text-muted-foreground mb-1">
          {assistMode === 'bw' ? 'Bodyweight' : 'Added / Assist (kg)'}{' '}
          <span className="text-muted-foreground/70">· {rightUnitHint}</span>
        </div>

        {/* BW: show quick chips; Assist/Added: show counter + quicks */}
        {assistMode !== 'bw' ? (
          <div className="flex items-center gap-3">
            <Counter
              value={Math.abs(deltaKg)}
              onDec={() => setDeltaKg((v) => Math.max(0, v - 5))}
              onInc={() => setDeltaKg((v) => v + 5)}
              step={5}
              className="flex-1"
            />
            <div className="flex gap-2">
              {/* fast presets (respect current mode later on submit) */}
              <QuickChip label="-10" onClick={() => handleQuick(-10)} />
              <QuickChip label="-5" onClick={() => handleQuick(-5)} />
              <QuickChip label="BW" onClick={() => handleQuick(0)} />
              <QuickChip label="+5" onClick={() => handleQuick(+5)} />
              <QuickChip label="+10" onClick={() => handleQuick(+10)} />
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <QuickChip label="BW" active onClick={() => handleQuick(0)} />
            <QuickChip label="+5" onClick={() => handleQuick(+5)} />
            <QuickChip label="+10" onClick={() => handleQuick(+10)} />
            <QuickChip label="+15" onClick={() => handleQuick(+15)} />
            <QuickChip label="-5" onClick={() => handleQuick(-5)} />
            <QuickChip label="-10" onClick={() => handleQuick(-10)} />
          </div>
        )}
      </div>

      {/* Reps */}
      <div className="rounded-xl bg-card/40 p-3">
        <div className="text-sm text-muted-foreground mb-1">Reps</div>
        <Counter
          value={reps}
          onDec={() => setReps((v) => Math.max(0, v - 1))}
          onInc={() => setReps((v) => v + 1)}
          step={1}
        />
      </div>

      {/* Feel chips */}
      <div className="rounded-xl bg-card/40 p-3">
        <div className="text-sm text-muted-foreground mb-2">How did it feel?</div>
        <div className="flex items-center gap-2">
          {(['--', '-', '=', '+', '++'] as const).map((f) => (
            <QuickChip
              key={f}
              label={f}
              active={feel === f}
              onClick={() => setFeel(f)}
            />
          ))}
        </div>
      </div>

      {/* Notes (optional) */}
      <textarea
        className="w-full rounded-lg bg-card/40 p-3 text-sm outline-none border border-border/40"
        rows={2}
        placeholder="Notes (optional)…"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      {/* Summary + Log button */}
      <div className="rounded-xl bg-muted/20 p-3 text-sm">
        <div className="text-muted-foreground">This Set</div>
        <div className="font-medium">
          {assistMode === 'bw'
            ? `BW × ${reps}`
            : `${normalizedDelta > 0 ? '+' : normalizedDelta < 0 ? '' : ''}${normalizedDelta}kg × ${reps}`}
        </div>
      </div>

      <button
        className={cn(
          'w-full h-11 rounded-xl font-medium transition',
          canLog ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
        )}
        onClick={onSubmit}
        disabled={!canLog}
      >
        {isLoading ? 'Logging…' : `Log Set ${setIndex}`}
      </button>
    </div>
  );
}

/** ——— Small local UI atoms (match v106 look & spacing) ——— */

function ModeChip(props: { label: string; active?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      className={cn(
        'px-3 h-8 rounded-full text-sm border',
        props.active
          ? 'bg-primary/10 text-primary border-primary/30'
          : 'bg-card/40 text-foreground border-border/40'
      )}
    >
      {props.label}
    </button>
  );
}

function QuickChip(props: {
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      className={cn(
        'px-3 h-8 rounded-full text-sm border',
        props.active
          ? 'bg-primary/10 text-primary border-primary/30'
          : 'bg-card/40 text-foreground border-border/40'
      )}
    >
      {props.label}
    </button>
  );
}

function Counter(props: {
  value: number;
  onDec: () => void;
  onInc: () => void;
  step?: number;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center gap-2', props.className)}>
      <RoundBtn onClick={props.onDec}>–</RoundBtn>
      <div className="w-16 h-10 rounded-lg bg-background/40 border border-border/40 grid place-items-center text-lg font-medium">
        {props.value}
      </div>
      <RoundBtn onClick={props.onInc}>+</RoundBtn>
    </div>
  );
}

function RoundBtn(props: React.PropsWithChildren<{ onClick: () => void }>) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      className="w-10 h-10 rounded-lg bg-card/40 border border-border/40 grid place-items-center text-xl"
    >
      {props.children}
    </button>
  );
}

/** helpers */
function gripIdsToString(ids?: string[]) {
  if (!ids || ids.length === 0) return '';
  return ids.sort().join('|');
}
