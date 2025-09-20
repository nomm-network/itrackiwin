import { create } from 'zustand';

export type ReadinessState = {
  date?: string;
  score?: number;
  energy?: number;
  sleepQuality?: number;
  sleepHours?: number;
  soreness?: number;
  stress?: number;
  preworkout?: boolean;
};

type ReadinessStore = ReadinessState & {
  justSubmitted: boolean;
  setReadiness: (state: ReadinessState) => void;
  setScore: (score: number) => void;
  clear: () => void;
};

export const useReadinessStore = create<ReadinessStore>((set) => ({
  justSubmitted: false,
  setReadiness: (state) => set({ ...state, justSubmitted: true }),
  setScore: (score) => set({ score, justSubmitted: true }),
  clear: () => set({ justSubmitted: false, score: undefined }),
}));