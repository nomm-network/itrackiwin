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
  console.warn('🚨 DEPRECATED: MobileWorkoutSession wrapper used - update to WorkoutSessionBody');
  console.log('🔍 MobileWorkoutSession props:', props);
  
  // Step 2: Pass-through to WorkoutSessionBody (unified flow) 
  const { default: WorkoutSessionBody } = require('@/features/workouts/session/WorkoutSessionBody');
  
  // Convert exercises array to workout object if needed
  const workout = props.workout || (props.exercises ? { exercises: props.exercises } : null);
  
  return <WorkoutSessionBody workout={workout} {...props} />;
};

export default MobileWorkoutSession;