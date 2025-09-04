import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

type TemplateRow = { id: string; name: string | null; is_public: boolean; };

export const TrainingCenterCard: React.FC = () => {
  const nav = useNavigate();
  const qc = useQueryClient();
  const [debug, setDebug] = useState<string | null>(null);

  // 1) Active workout (continue)
  const { data: activeWorkout } = useQuery({
    queryKey: ['active-workout'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workouts')
        .select('id, title, started_at, template_id')
        .is('ended_at', null)
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  // 2) Few recent templates for quick start
  const { data: templates } = useQuery({
    queryKey: ['my-templates'],
    queryFn: async (): Promise<TemplateRow[]> => {
      const { data, error } = await supabase
        .from('workout_templates')
        .select('id, name, is_public')
        .order('updated_at', { ascending: false })
        .limit(6);
      if (error) throw error;
      return data ?? [];
    },
  });

  // 3) Start workout mutation
  const startFromTemplate = useMutation({
    mutationFn: async (templateId: string | null) => {
      const { data, error } = await supabase.rpc('start_workout', {
        p_template_id: templateId,
      });
      if (error) {
        // show exact DB error
        setDebug(JSON.stringify(error, null, 2));
        throw error;
      }
      return data as string; // workoutId
    },
    onSuccess: async (workoutId) => {
      toast.success('Workout started');
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['active-workout'] }),
        qc.invalidateQueries({ queryKey: ['workouts'] }),
      ]);
      nav(`/app/workouts/${workoutId}`);
    },
    onError: (err: any) => {
      // loud + detailed
      toast.error(err?.message ?? 'Failed to start');
      console.error('[TrainingCenterCard] start_workout error:', err);
    },
  });

  const hasActive = !!activeWorkout?.id;
  const quickList = useMemo(() => templates ?? [], [templates]);

  return (
    <div className="rounded-xl border border-emerald-900/40 bg-[#0f1f1b] p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-semibold text-emerald-200">Training Center</h3>
        <button
          onClick={() => nav('/app/workouts')}
          className="text-xs text-emerald-300/80 hover:text-emerald-200"
        >
          View all
        </button>
      </div>

      {/* Continue */}
      {hasActive ? (
        <div className="mb-4 rounded-lg bg-[#0d1a17] p-3">
          <div className="mb-2 text-sm text-emerald-100">
            Continue workout{activeWorkout?.title ? `: ${activeWorkout.title}` : ''}
          </div>
          <button
            className="rounded-md bg-emerald-600 px-3 py-2 text-sm text-white hover:bg-emerald-500"
            onClick={() => nav(`/app/workouts/${activeWorkout!.id}`)}
          >
            Continue
          </button>
        </div>
      ) : (
        <div className="mb-4 rounded-lg bg-[#0d1a17] p-3">
          <div className="mb-2 text-sm text-emerald-100">Start a new session</div>
          <div className="flex gap-2">
            <button
              className="rounded-md bg-emerald-600 px-3 py-2 text-sm text-white hover:bg-emerald-500"
              onClick={() => startFromTemplate.mutate(null)}
              disabled={startFromTemplate.isPending}
            >
              {startFromTemplate.isPending ? 'Starting…' : 'Quick Start'}
            </button>
          </div>
        </div>
      )}

      {/* Start from template */}
      <div className="rounded-lg bg-[#0d1a17] p-3">
        <div className="mb-2 text-sm text-emerald-100">Start from template</div>
        <div className="grid grid-cols-2 gap-2">
          {quickList.map((t) => (
            <button
              key={t.id}
              onClick={() => startFromTemplate.mutate(t.id)}
              className="truncate rounded-md border border-emerald-900/40 bg-[#0f1f1b] px-3 py-2 text-left text-xs text-emerald-200 hover:border-emerald-700"
              title={t.name ?? 'Untitled'}
            >
              {t.name ?? 'Untitled'}
              {t.is_public && <span className="ml-2 rounded bg-emerald-800 px-1 text-[10px]">Public</span>}
            </button>
          ))}
          {quickList.length === 0 && (
            <div className="col-span-2 text-xs text-emerald-300/70">
              No templates yet. Create one in Templates.
            </div>
          )}
        </div>
      </div>

      {/* Debug drawer */}
      {debug && (
        <pre className="mt-3 max-h-40 overflow-auto rounded bg-black/50 p-2 text-[11px] text-emerald-300">
          {debug}
        </pre>
      )}
    </div>
  );
};

export default TrainingCenterCard;