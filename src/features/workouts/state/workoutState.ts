import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

// ============================================================================
// WORKOUT STATE - Zustand atoms/selectors for local state
// ============================================================================

interface WorkoutState {
  // Current exercise navigation
  currentExerciseId: string | null;
  completedExercises: Set<string>;
  
  // UI state
  showGripSelector: Record<string, boolean>;
  selectedGrips: Record<string, string[]>;
  warmupCompleted: boolean;
  
  // Actions
  setCurrentExercise: (id: string | null) => void;
  markExerciseComplete: (id: string) => void;
  toggleGripSelector: (exerciseId: string) => void;
  setSelectedGrips: (exerciseId: string, grips: string[]) => void;
  setWarmupCompleted: (completed: boolean) => void;
  resetWorkoutState: () => void;
}

export const useWorkoutState = create<WorkoutState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    currentExerciseId: null,
    completedExercises: new Set(),
    showGripSelector: {},
    selectedGrips: {},
    warmupCompleted: false,
    
    // Actions
    setCurrentExercise: (id) => set({ currentExerciseId: id }),
    
    markExerciseComplete: (id) => set((state) => ({
      completedExercises: new Set([...state.completedExercises, id])
    })),
    
    toggleGripSelector: (exerciseId) => set((state) => ({
      showGripSelector: {
        ...state.showGripSelector,
        [exerciseId]: !state.showGripSelector[exerciseId]
      }
    })),
    
    setSelectedGrips: (exerciseId, grips) => set((state) => ({
      selectedGrips: {
        ...state.selectedGrips,
        [exerciseId]: grips
      }
    })),
    
    setWarmupCompleted: (completed) => set({ warmupCompleted: completed }),
    
    resetWorkoutState: () => set({
      currentExerciseId: null,
      completedExercises: new Set(),
      showGripSelector: {},
      selectedGrips: {},
      warmupCompleted: false,
    }),
  }))
);

// ============================================================================
// SELECTORS - Computed state
// ============================================================================

export const useWorkoutSelectors = () => {
  const state = useWorkoutState();
  
  return {
    // Current exercise completion status
    isCurrentExerciseComplete: (exerciseId: string | null) => {
      return exerciseId ? state.completedExercises.has(exerciseId) : false;
    },
    
    // Progress calculation
    getProgressPercentage: (totalExercises: number) => {
      return totalExercises > 0 ? (state.completedExercises.size / totalExercises) * 100 : 0;
    },
    
    // Grip selection for current exercise
    getCurrentGrips: (exerciseId: string | null) => {
      return exerciseId ? state.selectedGrips[exerciseId] || [] : [];
    },
    
    // UI state getters
    isGripSelectorOpen: (exerciseId: string | null) => {
      return exerciseId ? Boolean(state.showGripSelector[exerciseId]) : false;
    }
  };
};