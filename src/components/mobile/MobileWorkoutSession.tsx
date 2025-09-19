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
  console.log('🔍 MobileWorkoutSession props:', props);
  
  // Step 2: Pass-through to EnhancedWorkoutSession (unified flow) 
  const { default: EnhancedWorkoutSession } = require('@/features/workouts/components/EnhancedWorkoutSession');
  
  // Convert exercises array to workout object if needed
  const workout = props.workout || (props.exercises ? { exercises: props.exercises } : null);
  
  return <EnhancedWorkoutSession workout={workout} source="mobile-wrapper" {...props} />;
};

export default MobileWorkoutSession;