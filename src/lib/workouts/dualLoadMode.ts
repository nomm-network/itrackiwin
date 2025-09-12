export type DualLoadMode = 'per_side' | 'total';

const KEY = (exerciseId: string) => `dl_mode:${exerciseId}`;

export function getDualLoadMode(exerciseId: string): DualLoadMode {
  try {
    return (localStorage.getItem(KEY(exerciseId)) as DualLoadMode) || 'per_side';
  } catch { return 'per_side'; }
}

export function setDualLoadMode(exerciseId: string, mode: DualLoadMode) {
  try { localStorage.setItem(KEY(exerciseId), mode); } catch {}
}