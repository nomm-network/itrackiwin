// src/features/training/pages/TrainingCenterPage.tsx
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTemplates } from '../hooks/useTemplates';
import { useStartWorkout } from '../hooks/useStartWorkout';
import { TrainingTemplateCard } from '../components/TrainingTemplateCard';

export default function TrainingCenterPage() {
  const navigate = useNavigate();
  const { data: templates, isLoading, error, refetch } = useTemplates();
  const start = useStartWorkout();

  const handleStart = async (templateId: string) => {
    try {
      const workoutId = await start.mutateAsync({ templateId });
      // TEMP direct navigation to workout page (we'll insert readiness step in Step 2)
      navigate(`/workouts/${workoutId}`);
    } catch (e: any) {
      console.error('Start workout failed:', e);
      alert(`Failed to start workout: ${e?.message || e}`);
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Training Center</h1>

      {/* Debug header (visible for now) */}
      <div className="mb-4 rounded-lg border border-white/10 bg-white/5 p-3 text-xs text-white/70">
        <div>training-center v1</div>
        <div>templates: {isLoading ? 'loading...' : templates?.length ?? 0}</div>
        {error ? <div className="text-rose-400">error: {(error as any)?.message}</div> : null}
        {start.isPending ? <div>status: starting workout…</div> : null}
        <button className="mt-2 underline text-white/80" onClick={() => refetch()}>
          Refetch
        </button>
      </div>

      {isLoading ? (
        <div className="text-white/70">Loading templates…</div>
      ) : !templates || templates.length === 0 ? (
        <div className="text-white/60">No templates found.</div>
      ) : (
        <div className="grid gap-3">
          {templates.map((t) => (
            <TrainingTemplateCard key={t.id} template={t} onStart={handleStart} />
          ))}
        </div>
      )}
    </div>
  );
}