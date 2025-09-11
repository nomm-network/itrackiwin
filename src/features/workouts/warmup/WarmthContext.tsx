import React from 'react';

type Warmth = { primary: Set<string>; secondary: Set<string>; bump: number };
type MuscleHit = { primary: string; secondary?: string[] };

const WarmthCtx = React.createContext<{
  warmth: Warmth;
  commit: (hit: MuscleHit) => void;
  reset: () => void;
} | null>(null);

export function WarmthProvider({ children }: { children: React.ReactNode }) {
  const [warmth, setWarmth] = React.useState<Warmth>({
    primary: new Set(),
    secondary: new Set(),
    bump: 0,
  });

  const commit = (hit: MuscleHit) => {
    setWarmth(prev => {
      const p = new Set(prev.primary);
      const s = new Set(prev.secondary);
      if (hit.primary) p.add(hit.primary);
      (hit.secondary || []).forEach(id => s.add(id));
      return { primary: p, secondary: s, bump: prev.bump + 1 };
    });
  };

  const reset = () => setWarmth({ primary: new Set(), secondary: new Set(), bump: 0 });

  return <WarmthCtx.Provider value={{ warmth, commit, reset }}>{children}</WarmthCtx.Provider>;
}

export function useWarmth() {
  const v = React.useContext(WarmthCtx);
  if (!v) throw new Error('useWarmth must be used inside WarmthProvider');
  return v;
}