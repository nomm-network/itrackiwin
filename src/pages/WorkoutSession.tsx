// src/pages/WorkoutSession.tsx
import { useParams } from 'react-router-dom';

export default function WorkoutSession() {
  const { id } = useParams<{ id: string }>();
  
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      <h1 className="text-2xl font-bold mb-2">Workout</h1>
      <div className="rounded-lg border border-white/10 bg-white/5 p-4">
        <div className="text-sm text-white/80">workout-id: {id}</div>
        <div className="text-xs text-white/60 mt-2">
          Placeholder page — next step will render the actual session with warmups, set forms,
          timers, grips, etc.
        </div>
      </div>
    </div>
  );
}