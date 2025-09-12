import { useState, useCallback } from 'react';

export type EntryMode = 'per_side' | 'total';

// Simple session storage hook for entry mode persistence
export function useEntryModeStore(
  exerciseId: string, 
  defaultMode: EntryMode = 'per_side'
): [EntryMode, (mode: EntryMode) => void] {
  const key = `entryMode:${exerciseId}`;
  
  const [mode, setModeState] = useState<EntryMode>(() => {
    try {
      const stored = sessionStorage.getItem(key);
      return (stored as EntryMode) || defaultMode;
    } catch {
      return defaultMode;
    }
  });

  const setMode = useCallback((newMode: EntryMode) => {
    try {
      sessionStorage.setItem(key, newMode);
      setModeState(newMode);
    } catch {
      setModeState(newMode);
    }
  }, [key]);

  return [mode, setMode];
}