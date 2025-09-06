// Main Workouts Feature Export
// Public API for the workouts feature

export * from './hooks';
export * from './components';
export * from './logic/targets';
export * from './logic/readiness';
export * from './state/workoutState';

// API exports (for direct use if needed)
export { workoutKeys } from './api/workouts.api';

// Legacy support
export { default as WorkoutsLayout } from './WorkoutsLayout';