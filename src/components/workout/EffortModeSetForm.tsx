import React from 'react';
import { SmartSetForm } from '@/workouts-sot/components/sets';
import { Exercise } from './set-forms/BaseSetForm';

// Re-export the Exercise interface for backward compatibility
export type { Exercise };

interface EffortModeSetFormProps {
  workoutExerciseId: string;
  exercise: Exercise;
  setIndex: number;
  onLogged: () => void;
  onCancel?: () => void;
  className?: string;
}

/**
 * Enhanced Effort Mode Set Form - now uses SmartSetForm for better UX
 * This component acts as a wrapper that routes to the appropriate specialized form
 * based on exercise type (bodyweight, cardio, weight training)
 */
const EffortModeSetForm: React.FC<EffortModeSetFormProps> = (props) => {
  // Use the new SmartSetForm which intelligently selects the best UI
  return <SmartSetForm {...props} />;
};

export default EffortModeSetForm;