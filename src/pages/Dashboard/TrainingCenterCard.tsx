import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useTemplates } from '@/features/health/fitness/training/hooks/useTemplates';
import { useNextProgramBlock } from '@/features/health/fitness/training/hooks/useNextProgramBlock';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const TrainingCenterCard: React.FC = () => {
  const navigate = useNavigate();
  const { data: templates = [], isLoading: tLoading } = useTemplates();
  const { data: nextBlock, isLoading: bLoading } = useNextProgramBlock();
  const [rpcError, setRpcError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const canStartProgram = useMemo(
    () => !!nextBlock?.workout_template_id,
    [nextBlock]
  );

  const startWorkout = async (templateId?: string) => {
    setPending(true);
    setRpcError(null);
    try {
      const args = { p_template_id: templateId ?? null };
      const { data, error } = await supabase.rpc('start_workout', args);

      // Full error visibility
      if (error) {
        console.error('[start_workout][RPC ERROR]', { args, error });
        setRpcError(`${error.code ?? ''} ${error.message}`);
        toast.error(error.message);
        return;
      }
      if (!data) {
        setRpcError('No workout id returned');
        console.error('[start_workout] No id returned');
        toast.error('Failed to start workout');
        return;
      }

      toast.success('Workout started!');
      navigate(`/app/workouts/${data}`);
    } catch (e: any) {
      console.error('[start_workout][JS ERROR]', e);
      setRpcError(e?.message ?? 'Unknown error');
      toast.error('Failed to start workout');
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="rounded-lg border border-emerald-900/40 bg-[#0f1f1b] p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-emerald-300">Training Center</h3>
        <span className="text-xs text-emerald-500/70">
          {bLoading || tLoading ? 'Loading…' : ''}
        </span>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {/* Program card */}
        <div className="rounded-md border border-emerald-900/40 bg-[#0d1a17] p-3">
          <div className="mb-2 text-sm text-emerald-200">Program</div>
          <div className="text-xs text-emerald-500/80">
            {nextBlock?.title ?? 'No upcoming block'}
          </div>
          <Button
            className="mt-3 w-full"
            disabled={!canStartProgram || pending}
            onClick={() => startWorkout(nextBlock?.workout_template_id)}
          >
            {pending ? 'Starting…' : 'Start Program Session'}
          </Button>
        </div>

        {/* Templates card */}
        <div className="rounded-md border border-emerald-900/40 bg-[#0d1a17] p-3">
          <div className="mb-2 text-sm text-emerald-200">Templates</div>
          <div className="max-h-48 overflow-auto rounded bg-[#0f1f1b] p-2">
            {templates.length === 0 ? (
              <div className="py-6 text-center text-xs text-emerald-500/60">
                {tLoading ? 'Loading templates…' : 'No templates found'}
              </div>
            ) : (
              <ul className="space-y-2">
                {templates.map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center justify-between rounded border border-emerald-900/40 bg-[#0d1a17] p-2"
                  >
                    <span className="truncate text-xs text-emerald-200">
                      {t.name ?? 'Untitled'}
                    </span>
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={pending}
                      onClick={() => startWorkout(t.id)}
                    >
                      Start
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Tiny debug row */}
      <div className="mt-3 text-[11px] leading-4 text-emerald-500/70">
        <span className="font-medium">Debug:</span>{' '}
        {rpcError ? (
          <span className="text-red-400">{rpcError}</span>
        ) : (
          'OK'
        )}
      </div>
    </div>
  );
};

export default TrainingCenterCard;