import { MobileWorkoutSession } from '@/components/mobile/MobileWorkoutSession';

export default function WorkoutDetailPage() {
  return <MobileWorkoutSession 
    exercises={[]} 
    onSetComplete={() => {}} 
    onWorkoutComplete={() => {}} 
  />;
}