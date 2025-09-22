// Track muscle warmth during a workout session to optimize warmup requirements

export interface MuscleWarmthState {
  [muscleGroupId: string]: number; // 0 = cold, 1 = warm, 2 = hot
}

export class MuscleWarmthTracker {
  private warmthState: MuscleWarmthState = {};
  private listeners: Set<(state: MuscleWarmthState) => void> = new Set();

  constructor(initialState: MuscleWarmthState = {}) {
    this.warmthState = { ...initialState };
  }

  // Update warmth for a muscle group
  updateWarmth(muscleGroupId: string, increment: number) {
    const current = this.warmthState[muscleGroupId] || 0;
    this.warmthState[muscleGroupId] = Math.min(2, Math.max(0, current + increment));
    this.notifyListeners();
  }

  // Record a completed set and update warmth accordingly
  recordSet(exerciseInfo: {
    primaryMuscleId?: string;
    secondaryMuscleIds?: string[];
    isMainLift?: boolean;
  }) {
    const { primaryMuscleId, secondaryMuscleIds = [], isMainLift = false } = exerciseInfo;

    // Primary muscle gets more warmth
    if (primaryMuscleId) {
      const increment = isMainLift ? 2 : 1;
      this.updateWarmth(primaryMuscleId, increment);
    }

    // Secondary muscles get less warmth
    secondaryMuscleIds.forEach(muscleId => {
      this.updateWarmth(muscleId, 0.5);
    });
  }

  // Get warmth level for a muscle group
  getWarmth(muscleGroupId: string): number {
    return this.warmthState[muscleGroupId] || 0;
  }

  // Get the overall state
  getState(): MuscleWarmthState {
    return { ...this.warmthState };
  }

  // Calculate warmup requirements for an exercise
  calculateWarmupNeeds(exerciseInfo: {
    primaryMuscleId?: string;
    secondaryMuscleIds?: string[];
  }): {
    warmupSets: number;
    reason: string;
  } {
    const { primaryMuscleId, secondaryMuscleIds = [] } = exerciseInfo;
    
    if (!primaryMuscleId) {
      return { warmupSets: 2, reason: 'Default warmup' };
    }

    const primaryWarmth = this.getWarmth(primaryMuscleId);
    const secondaryWarmth = Math.max(
      ...secondaryMuscleIds.map(id => this.getWarmth(id)),
      0
    );

    // Use the higher warmth level to determine warmup needs
    const effectiveWarmth = Math.max(primaryWarmth, secondaryWarmth);

    if (effectiveWarmth >= 2) {
      return { 
        warmupSets: 1, 
        reason: 'Muscles already hot from previous exercises' 
      };
    } else if (effectiveWarmth >= 1) {
      return { 
        warmupSets: 2, 
        reason: 'Muscles partially warmed up' 
      };
    } else {
      return { 
        warmupSets: 3, 
        reason: 'Cold muscles need full warmup' 
      };
    }
  }

  // Subscribe to warmth state changes
  subscribe(listener: (state: MuscleWarmthState) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.getState()));
  }

  // Reset all warmth (e.g., between workouts)
  reset() {
    this.warmthState = {};
    this.notifyListeners();
  }

  // Decay warmth over time (optional - could be called periodically)
  decay(decayAmount: number = 0.1) {
    Object.keys(this.warmthState).forEach(muscleId => {
      this.warmthState[muscleId] = Math.max(0, this.warmthState[muscleId] - decayAmount);
      if (this.warmthState[muscleId] === 0) {
        delete this.warmthState[muscleId];
      }
    });
    this.notifyListeners();
  }
}

// Global instance for session-wide tracking
export const globalMuscleWarmthTracker = new MuscleWarmthTracker();