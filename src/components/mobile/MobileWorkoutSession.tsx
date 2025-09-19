import React from 'react';

interface MobileWorkoutSessionProps {
  exercises?: any[];
  onSetComplete?: (exerciseId: string, setData: any) => void;
  onWorkoutComplete?: () => void;
  className?: string;
  workout?: any;
  source?: string;
}

export const MobileWorkoutSession: React.FC<MobileWorkoutSessionProps> = (props) => {
  console.warn('🚨 DEPRECATED: MobileWorkoutSession wrapper used - update to EnhancedWorkoutSession');
  
  // Step 2: Pass-through to EnhancedWorkoutSession (unified flow)
  const { default: EnhancedWorkoutSession } = require('@/features/workouts/components/EnhancedWorkoutSession');
  return <EnhancedWorkoutSession source="mobile-wrapper" {...props} />;
};

export default MobileWorkoutSession;