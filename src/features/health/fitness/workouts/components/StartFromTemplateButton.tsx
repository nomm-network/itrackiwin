import { useNavigate } from 'react-router-dom';
import { startWorkout } from '../api/workouts.api';
import { toast } from 'sonner';

export function StartFromTemplateButton({ templateId }: { templateId: string }) {
  const navigate = useNavigate();

  const handle = async () => {
    try {
      const id = await startWorkout(templateId);
      navigate(`/app/workouts/${id}`);
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
    <button className="btn btn-primary" onClick={handle}>
      Start
    </button>
  );
}