import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useTemplates } from '@/features/health/fitness/training/hooks/useTemplates';
import { useNextProgramBlock } from '@/features/health/fitness/training/hooks/useNextProgramBlock';
import { useActiveWorkout } from '@/features/health/fitness/training/hooks/useActiveWorkout';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

const TrainingCenterCard: React.FC = () => {
  const navigate = useNavigate();
  const { data: favoritesData, isLoading: tLoading } = useTemplates({ onlyFavorites: true });
  const { data: nextBlock, isLoading: bLoading } = useNextProgramBlock();
  const { active, isLoading: activeLoading, error: activeError } = useActiveWorkout();
  const [rpcError, setRpcError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');

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

  const handleEndCurrent = async () => {
    if (!active) return;
    setPending(true);
    try {
      await supabase.rpc("end_workout", { p_workout_id: active.id });
      toast.success('Workout ended');
      window.location.reload(); // simplest refetch
    } catch (e: any) {
      toast.error('Failed to end workout');
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="rounded-lg border border-emerald-900/40 bg-[#0f1f1b] p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-emerald-300">Training Center</h3>
        <span className="text-xs text-emerald-500/70">
          {bLoading || tLoading || activeLoading ? 'Loading…' : ''}
        </span>
      </div>

      {activeError && (
        <p className="mb-3 text-xs text-red-400">Active check: {activeError}</p>
      )}

      {active ? (
        <div className="space-y-3">
          <div className="text-sm text-emerald-200/80">
            Active workout{active.workout_templates?.name ? ` • ${active.workout_templates.name}` : ""}  
          </div>
          <div className="flex gap-2">
            <Button
              className="flex-1"
              onClick={() => navigate(`/app/workouts/${active.id}`)}
              disabled={pending}
            >
              Continue Workout
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pending}
                  title="End current workout"
                >
                  End
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>End Workout?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all logged sets from this session. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleEndCurrent}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    End Workout
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      ) : (
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

          {/* Start from Template card */}
          <div className="rounded-md border border-emerald-900/40 bg-[#0d1a17] p-3">
            <div className="mb-2 text-sm text-emerald-200">Start from Template</div>
            
            {tLoading ? (
              <div className="py-6 text-center text-xs text-emerald-500/60">
                Loading favorites…
              </div>
            ) : favoritesData?.favorites.length === 0 ? (
              <div className="space-y-3">
                <div className="py-4 text-center text-xs text-emerald-500/60">
                  No favorites yet
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs text-emerald-400"
                  onClick={() => navigate('/fitness/templates')}
                >
                  Pick favorites → Explore more
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                  <SelectTrigger className="w-full bg-[#0f1f1b] border-emerald-900/40">
                    <SelectValue placeholder="Choose favorite template" />
                  </SelectTrigger>
                  <SelectContent>
                    {favoritesData?.favorites.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name || 'Untitled'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    disabled={!selectedTemplateId || pending}
                    onClick={() => startWorkout(selectedTemplateId)}
                  >
                    {pending ? 'Starting…' : 'Start'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-emerald-400"
                    onClick={() => navigate('/fitness/templates')}
                  >
                    Explore more
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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