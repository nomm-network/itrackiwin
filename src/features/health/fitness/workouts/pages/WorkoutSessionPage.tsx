// src/features/health/fitness/workouts/pages/WorkoutSessionPage.tsx
import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWorkoutSession, useLogSet } from '../hooks/workouts.api';
import ExerciseCard from '../components/ExerciseCard';
import { pickFirstSetTarget } from '../hooks/useTargets';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function WorkoutSessionPage() {
  const { workoutId } = useParams<{workoutId:string}>();
  const nav = useNavigate();
  const { data, isLoading, error } = useWorkoutSession(workoutId!);
  const logSet = useLogSet();

  if (error) return <div className="p-4 text-destructive">Failed to load: {String((error as any)?.message || error)}</div>;
  if (isLoading || !data) return <div className="p-4">Loading…</div>;

  const exs = (data.workout?.workout_exercises ?? []).slice().sort((a:any,b:any)=>a.order_index-b.order_index);

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="mb-4">
        <div className="text-2xl font-bold">Workout Session</div>
        <div className="text-muted-foreground text-sm">Started {new Date(data.workout.started_at).toLocaleString()}</div>
        <div className="mt-3 flex gap-2">
          <button 
            className="rounded-lg bg-secondary text-secondary-foreground px-4 py-2 hover:bg-secondary/80 transition-colors" 
            onClick={() => nav(-1)}
          >
            Back
          </button>
          <button 
            className="rounded-lg bg-primary text-primary-foreground px-4 py-2 hover:bg-primary/90 transition-colors"
            onClick={async () => {
              try {
                const { error } = await supabase.rpc('end_workout', { p_workout_id: workoutId });
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
        const lastRow = (data.last || []).find((r:any)=>r.workout_exercises?.exercise_id === ex.exercise_id) ?? null;
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
            last={ lastRow ? { 
              kg:lastRow.weight_kg, 
              reps:lastRow.reps, 
              date:lastRow.completed_at ? new Date(lastRow.completed_at).toLocaleDateString() : null 
            } : undefined }
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