// src/features/health/fitness/workouts/pages/WorkoutSessionPage.tsx
import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWorkoutSession, useLogSet } from '../hooks/workouts.api';
import ExerciseCard from '../components/ExerciseCard';
import { pickFirstSetTarget } from '../hooks/useTargets';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function WorkoutSessionPage() {
  const { id } = useParams<{id:string}>();
  const nav = useNavigate();
  
  const { data, isLoading, error } = useWorkoutSession(id || '');
  const logSet = useLogSet();

  // Show loading if no ID yet (during navigation)
  if (!id || id === 'undefined') {
    return <div className="p-4">Loading workout...</div>;
  }

  if (error) {
    console.error('[WorkoutSessionPage] Error loading workout:', error);
    return (
      <div className="p-4 text-red-400">
        <div className="text-lg font-bold">Failed to load workout</div>
        <div className="text-sm mt-2">Error: {String((error as any)?.message || error)}</div>
        <div className="text-xs mt-2 opacity-70">Workout ID: {id}</div>
        <button 
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
          onClick={() => nav('/dashboard')}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }
  if (isLoading || !data) {
    console.log('[WorkoutSessionPage] Loading workout...', { id, isLoading, data: !!data });
    return <div className="p-4">Loading…</div>;
  }

  const exs = (data.workout?.workout_exercises ?? []).slice().sort((a:any,b:any)=>a.order_index-b.order_index);

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="mb-4">
        <div className="text-2xl font-bold">Workout Session</div>
        <div className="opacity-70 text-sm">Started {new Date(data.workout.started_at).toLocaleString()}</div>
        <div className="mt-3 flex gap-2">
          <button 
            className="rounded-lg bg-neutral-800 px-4 py-2" 
            onClick={() => nav(-1)}
          >
            Back
          </button>
          <button 
            className="rounded-lg bg-emerald-500 text-black px-4 py-2"
            onClick={async () => {
              try {
                const { error } = await supabase.rpc('end_workout', { p_workout_id: id });
                if (error) throw error;
                toast.success('Workout completed!');
                nav('/app/dashboard');
              } catch (err: any) {
                toast.error(`Failed to end workout: ${err.message}`);
              }
            }}
          >
            Finish
          </button>
        </div>
      </div>

      {exs.map((ex:any, idx:number) => {
        const lastRow = (data.last || []).find((r:any)=>r.exercise_id === ex.exercise_id) ?? null;
        // Determine first-set target
        const targetKg = pickFirstSetTarget({
          serverTargetKg: ex.target_weight_kg,
          lastGoodBaseKg: lastRow?.base_weight_kg ?? lastRow?.prev_weight_kg ?? null,
          readinessMultiplier: lastRow?.readiness_multiplier ?? 1,
          templateDefaultKg: ex.target_weight_kg ?? null
        });
        const target = { kg: targetKg, reps: ex.target_reps ?? 12 };

        // Sync target back to server if we computed a new one
        if (!ex.target_weight_kg && targetKg) {
          // fire-and-forget; do NOT block UI
          supabase.from('workout_exercises')
            .update({ target_weight_kg: targetKg })
            .eq('id', ex.id);
        }

        return (
          <ExerciseCard
            key={ex.id}
            exercise={ex}
            last={ lastRow ? { kg:lastRow.prev_weight_kg, reps:lastRow.prev_reps, date:lastRow.prev_date } : undefined }
            target={target}
            setIndex={1}
            showWarmup={idx===0}  // show warm-up above the first exercise block
            onLog={async (p) => {
              await logSet.mutateAsync({
                workout_exercise_id: ex.id,
                set_index: 1,
                weight_kg: p.weight_kg, reps: p.reps,
                rpe: p.rpe, pain: p.pain
              });
              toast.success('Set logged successfully!');
            }}
          />
        );
      })}
    </div>
  );
}