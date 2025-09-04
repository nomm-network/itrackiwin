import React from 'react';

// Workout UI components
export { default as WorkoutsLayout } from './WorkoutsLayout';

// Temporary stub components until migration is complete
export const StartOrContinue = () => React.createElement('div', null, 'StartOrContinue - Migration in progress');

// Real workout session component
export { default as EnhancedWorkoutSession } from './EnhancedWorkoutSession';

// Training Launcher component with readiness dialogue
export { default as TrainingLauncher } from './TrainingLauncher';