// Workouts Types - SOT CORE TYPES ONLY  
export interface WorkoutPhase {
  phase: 'readiness' | 'active' | 'rest' | 'complete';
}

export interface WorkoutFlowState {
  phase: WorkoutPhase['phase'];
  workoutId?: string;
  currentExerciseIndex: number;
  currentSetIndex: number;
}