import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SessionTiming = {
  sessionStartedAt: number | null;       // ms
  totalRestMs: number;                    // accumulated rest
  restStartedAt: number | null;           // null when not resting
};

export const useSessionTiming = create<SessionTiming & {
  startSession: () => void;
  startRest: () => void;
  stopRest: () => void;                   // adds elapsed to totalRestMs
  resetRest: () => void;                  // zero-out current rest (doesn't change totalRestMs)
  getSessionElapsedMs: () => number;
  getActiveTrainingMs: () => number;      // session - totalRest
}>()(
  persist(
    (set, get) => ({
      sessionStartedAt: null,
      totalRestMs: 0,
      restStartedAt: null,

      startSession: () => set({ sessionStartedAt: Date.now() }),

      startRest: () => {
        const { restStartedAt } = get();
        if (!restStartedAt) set({ restStartedAt: Date.now() });
      },

      stopRest: () => {
        const { restStartedAt, totalRestMs } = get();
        if (!restStartedAt) return;
        const delta = Date.now() - restStartedAt;
        set({ restStartedAt: null, totalRestMs: totalRestMs + Math.max(0, delta) });
      },

      resetRest: () => set({ restStartedAt: null }),

      getSessionElapsedMs: () => {
        const { sessionStartedAt } = get();
        return sessionStartedAt ? Date.now() - sessionStartedAt : 0;
      },

      getActiveTrainingMs: () => {
        const { getSessionElapsedMs, totalRestMs, restStartedAt } = get();
        const runningRest = restStartedAt ? Date.now() - restStartedAt : 0;
        return Math.max(0, getSessionElapsedMs() - (totalRestMs + runningRest));
      }
    }),
    {
      name: 'session-timing-storage',
      // Add version for migration compatibility
      version: 1,
    }
  )
);