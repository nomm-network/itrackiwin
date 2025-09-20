// workout-flow-v0.7.0 (SOT) – DO NOT DUPLICATE
import WorkoutSessionContainer from '@/features/workouts/session/WorkoutSessionContainer';

export default function WorkoutPage() {
  // Single source of truth - unified container handles all routing, readiness, and session logic
  return <WorkoutSessionContainer />;
}