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
  setReadiness: (state: ReadinessState) => void;
  clearReadiness: () => void;
};

export const useReadinessStore = create<ReadinessStore>((set) => ({
  setReadiness: (state) => set(state),
  clearReadiness: () => set({}),
}));