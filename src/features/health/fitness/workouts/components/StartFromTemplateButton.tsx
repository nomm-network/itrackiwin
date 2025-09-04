import { useNavigate } from 'react-router-dom';
import { useStartWorkout } from '../hooks/workouts.api';
import { toast } from 'sonner';

export function StartFromTemplateButton({ templateId }: { templateId: string }) {
  const navigate = useNavigate();
  const startWorkout = useStartWorkout();

  const handle = async () => {
    try {
      const result = await startWorkout.mutateAsync({ templateId });
      navigate(`/app/workouts/${result.workoutId}`);
    } catch (e: any) {
      // Show real database error details for debugging
      const msg = e?.message || e?.error_description || JSON.stringify(e);
      console.error('[start_workout] error:', e);
      toast.error(`Start failed: ${msg}`);
      // stay on page; do NOT redirect
    }
  };

  return (
    <button className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90" onClick={handle}>
      Start
    </button>
  );
}