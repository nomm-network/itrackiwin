import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function WorkoutHeader({
  workout,
  onExit,
}: {
  workout: any;
  onExit: () => void;
}) {
  const end = async () => {
    try {
      // end_workout RPC exists in your DB
      const { error } = await supabase.rpc('end_workout', {
        p_workout_id: workout.id,
      });
      if (error) throw error;
      toast.success('Workout ended');
      onExit();
    } catch (e: any) {
      toast.error(`End workout failed: ${e.message ?? e}`);
    }
  };

  return (
    <header className="space-y-2">
      <h1 className="text-2xl font-semibold">Workout Session</h1>
      <div className="text-sm text-muted-foreground">
        Started {new Date(workout.started_at).toLocaleString()}
      </div>
      <div className="flex gap-2">
        <button className="px-4 py-2 rounded-md border border-border bg-secondary text-secondary-foreground hover:bg-secondary/80" onClick={onExit}>Back</button>
        <button className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90" onClick={end}>Finish</button>
      </div>
    </header>
  );
}