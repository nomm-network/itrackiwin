import { useState } from 'react';

export function useDualLoadMode(
  exerciseLoadType: 'single_total' | 'dual_load' | 'stack',
  initialTotalKg: number
) {
  const defaultMode = exerciseLoadType === 'dual_load' ? 'dual_load' : 'single_total';
  const [mode, setMode] = useState<'single_total' | 'dual_load'>(defaultMode);

  const [totalKg, setTotalKg] = useState<number>(initialTotalKg);
  const [perSideKg, setPerSideKg] = useState<number>(Math.max(0, initialTotalKg / 2));

  const toggleMode = () => {
    setMode(m => (m === 'dual_load' ? 'single_total' : 'dual_load'));
  };

  return { mode, totalKg, perSideKg, setTotalKg, setPerSideKg, toggleMode };
}