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
      // Show exact payload (code, message, details, hint) if available
      const raw = e?.cause ?? e;
      const msg = typeof raw === 'object' ? JSON.stringify(raw, null, 2) : String(raw);
      console.error('[Start Workout] RPC error:', e);
      // toast (visible), and also a modal if you want
      toast.error(`Failed to start workout:\n${e.message ?? msg}`);
      // stay on page; do NOT redirect
    }
  };

  return (
    <button className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90" onClick={handle}>
      Start
    </button>
  );
}