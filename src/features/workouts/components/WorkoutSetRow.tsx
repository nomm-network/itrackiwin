import React from 'react';
import {useDualLoadMode} from '../hooks/useDualLoadMode';
import {resolveAchievableLoad} from '@/lib/equipment/resolveAchievableLoad';

export default function WorkoutSetRow({
  setIndex,
  loadType,
  barType,
  target,
  onDebug,
}: {
  setIndex: number;
  loadType: 'single_total' | 'dual_load' | 'stack';
  barType?: 'barbell' | 'ezbar';
  target: { weight: number; reps: number };
  onDebug: (s:string) => void;
}) {
  const {
    mode,               // 'single_total' | 'dual_load'
    perSideKg,          // number
    totalKg,            // number
    setPerSideKg,
    setTotalKg,
    toggleMode,
  } = useDualLoadMode(loadType, target.weight);

  const onBlurSnap = async () => {
    try {
      const desired = mode === 'dual_load'
        ? perSideKg * 2 + (barType ? (barType === 'ezbar' ? 7.5 : 20) : 0)
        : totalKg;

      const resolved = await resolveAchievableLoad('', desired);
      onDebug(
        `Set ${setIndex}: desired=${desired.toFixed(1)}kg → resolved=${resolved.weight.toFixed(1)}kg ` +
        `(mode=${mode}${barType ? `, bar=${barType}` : ''})`
      );

      if (mode === 'dual_load') {
        const resolvedPerSide = Math.max(0, (resolved.weight - (barType ? (barType === 'ezbar' ? 7.5 : 20) : 0)) / 2);
        setPerSideKg(resolvedPerSide);
      } else {
        setTotalKg(resolved.weight);
      }
    } catch (e) {
      onDebug(`Set ${setIndex}: resolution failed (${String(e)})`);
    }
  };

  return (
    <div className="flex items-center justify-between rounded-lg border px-3 py-2">
      <div className="flex items-center gap-3">
        <div className="grid h-8 w-8 place-items-center rounded-full bg-muted font-medium">{setIndex}</div>

        {/* Weight inputs */}
        {mode === 'dual_load' ? (
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              step="0.5"
              className="w-24 rounded-md border bg-background px-2 py-1 text-right tabular-nums"
              value={perSideKg}
              onChange={e => setPerSideKg(Number(e.target.value || 0))}
              onBlur={onBlurSnap}
            />
            <span className="text-sm">kg / side</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              step="0.5"
              className="w-28 rounded-md border bg-background px-2 py-1 text-right tabular-nums"
              value={totalKg}
              onChange={e => setTotalKg(Number(e.target.value || 0))}
              onBlur={onBlurSnap}
            />
            <span className="text-sm">kg total</span>
          </div>
        )}

        <div className="text-sm text-muted-foreground">× {target.reps} reps</div>
      </div>

      <div className="flex items-center gap-2">
        {/* Mode switch */}
        {loadType !== 'stack' && (
          <button
            className="rounded-md border px-2 py-1 text-xs"
            onClick={() => {
              toggleMode();
              onDebug(`Set ${setIndex}: toggled input mode → ${mode === 'dual_load' ? 'single_total' : 'dual_load'}`);
            }}
          >
            {mode === 'dual_load' ? 'Total input' : 'Per-side input'}
          </button>
        )}
        <button className="rounded-md bg-primary px-3 py-1 text-primary-foreground">Save</button>
      </div>
    </div>
  );
}