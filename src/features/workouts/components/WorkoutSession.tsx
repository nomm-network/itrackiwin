// workout-flow-v0.7.0 (SOT) – DO NOT DUPLICATE
// DEPRECATED: This file redirects to WorkoutSessionBody - do not use directly
import WorkoutSessionBody from '@/features/workouts/session/WorkoutSessionBody';

interface WorkoutSessionProps {
  workout: any;
}

export default function WorkoutSession({ workout }: WorkoutSessionProps) {
  console.warn('🚨 DEPRECATED: WorkoutSession wrapper used - update to WorkoutSessionContainer');
  return <div>Deprecated component - use WorkoutSessionContainer instead</div>;
}