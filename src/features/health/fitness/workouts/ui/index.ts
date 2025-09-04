import React from 'react';

// Workout UI components
export { default as WorkoutsLayout } from './WorkoutsLayout';

// Temporary stub components until migration is complete
export const StartOrContinue = () => React.createElement('div', null, 'StartOrContinue - Migration in progress');
export const EnhancedWorkoutSession = ({ workout }: { workout: any }) => React.createElement('div', null, `EnhancedWorkoutSession - Migration in progress for workout: ${workout?.title || 'Unknown'}`);
export const TrainingLauncher = () => React.createElement('div', null, 'TrainingLauncher - Migration in progress');