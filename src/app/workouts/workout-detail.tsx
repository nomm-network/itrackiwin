import WorkoutSessionContainer from '@/features/workouts/session/WorkoutSessionContainer';

export default function WorkoutPage() {
  // Fix 1: Use the unified WorkoutSessionContainer directly - handles all routing, readiness, and session logic
  return <WorkoutSessionContainer />;
}