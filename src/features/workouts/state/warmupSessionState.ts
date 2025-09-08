import { create } from 'zustand';

interface WarmupSessionState {
  warmupsShown: Record<string, boolean>; // workoutExerciseId -> has warmup been shown
  setWarmupShown: (workoutExerciseId: string) => void;
  resetWarmupSession: () => void;
}

export const useWarmupSessionState = create<WarmupSessionState>((set) => ({
  warmupsShown: {},
  
  setWarmupShown: (workoutExerciseId: string) =>
    set((state) => ({
      warmupsShown: {
        ...state.warmupsShown,
        [workoutExerciseId]: true,
      },
    })),
    
  resetWarmupSession: () =>
    set(() => ({
      warmupsShown: {},
    })),
}));