// Main Workouts Feature Export
// Public API for the workouts feature

export * from './ui';
export * from './api';
export * from '@/workouts-sot/hooks';
export * from './types';
export * from './logic/targets';
export * from './logic/readiness';
export * from './state/workoutState';

// Legacy support
export { default as WorkoutsLayout } from './WorkoutsLayout';