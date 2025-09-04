// src/features/health/fitness/workouts/pages/WorkoutPage.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

// Old-UI building blocks you restored earlier:
import WorkoutHeader from '../components/WorkoutHeader';
import WarmupPanel from '../components/WarmupPanel';
import SetList from '../components/SetList';
import WorkoutExerciseCard from '../components/WorkoutExerciseCard';
import { DebugPanel } from '../components/DebugPanel';

type UUID = string;

type Workout = {
  id: UUID;
  user_id: UUID;
  template_id: UUID | null;
  started_at: string | null;
  ended_at: string | null;
  readiness_score: number | null;
  // optional title support — if templates don't copy a name, we'll show fallback
  title?: string | null;
};

type WorkoutExercise = {
  id: UUID;
  workout_id: UUID;
  exercise_id: UUID;
  order_index: number;
  target_reps: number | null;
  target_weight_kg: number | null; // ✅ normalized
  weight_unit: 'kg' | 'lb' | null;
  attribute_values_json: any | null; // { warmup: [...] } when present
  readiness_adjusted_from: UUID | null;
  workout_sets?: WorkoutSet[]; // Add sets to the type
  exercises: {
    id: UUID;
    display_name: string | null;
    slug: string;
    equipment_id: UUID | null;
    load_type: string | null;
    tags: string[] | null;
  };
};

type WorkoutSet = {
  id: UUID;
  workout_exercise_id: UUID;
  set_index: number;
  set_kind: 'warmup' | 'normal' | 'top_set' | 'backoff' | 'amrap' | 'drop' | 'distance' | 'timed' | 'cooldown';
  reps: number | null;
  weight_kg: number | null; // ✅ prefer normalized
  is_completed: boolean;
  rest_seconds: number | null;
};

const WorkoutPage: React.FC = () => {
  const { workoutId } = useParams<{ workoutId: string }>();
  if (!workoutId) return <div>❌ Missing workoutId</div>;
  const navigate = useNavigate();

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [setsByExercise, setSetsByExercise] = useState<Record<string, WorkoutSet[]>>({});
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // -------- data loaders ----------
  useEffect(() => {
    let isCancelled = false;
    const load = async () => {
      if (!workoutId) return;

      setLoading(true);
      setErr(null);

      // 1) workout with template name fallback
      const { data: w, error: wErr } = await supabase
        .from('workouts')
        .select(`
          id,user_id,template_id,started_at,ended_at,readiness_score,title,
          workout_templates(name)
        `)
        .eq('id', workoutId)
        .single();

      if (wErr) {
        if (!isCancelled) {
          setErr(`Failed to load workout: ${wErr.message}`);
          setLoading(false);
        }
        return;
      }

      // 2) workout_exercises + exercise info + grip_key + sets
      const { data: wes, error: weErr } = await supabase
        .from('workout_exercises')
        .select(`
          id, workout_id, exercise_id, order_index,
          target_reps, target_weight_kg, weight_unit, grip_key,
          attribute_values_json, readiness_adjusted_from,
          exercises(id, display_name, slug, equipment_id, load_type, tags),
          workout_sets(
            id, workout_exercise_id, set_index, set_kind, 
            reps, weight_kg, is_completed, rest_seconds
          )
        `)
        .eq('workout_id', workoutId)
        .order('order_index', { ascending: true })
        .order('set_index', { ascending: true, foreignTable: 'workout_sets' });

      if (weErr) {
        if (!isCancelled) {
          setErr(`Failed to load workout exercises: ${weErr.message}`);
          setLoading(false);
        }
        return;
      }

      // 3) extract sets from nested workout_exercises data and attach to exercises
      let setsMap: Record<string, WorkoutSet[]> = {};
      const exercisesWithSets = (wes ?? []).map((we: any) => {
        if (we.workout_sets && Array.isArray(we.workout_sets)) {
          const sortedSets = we.workout_sets.sort((a: any, b: any) => a.set_index - b.set_index);
          setsMap[we.id] = sortedSets;
          return { ...we, workout_sets: sortedSets };
        }
        return { ...we, workout_sets: [] };
      });

      if (!isCancelled) {
        setWorkout(w as Workout);
        setExercises(exercisesWithSets as unknown as WorkoutExercise[]);
        setSetsByExercise(setsMap);
        setLoading(false);
      }
    };

    load();
    return () => {
      isCancelled = true;
    };
  }, [workoutId]);

  const headerTitle = useMemo(() => {
    // Prefer workout title, then template name, then first exercise name
    if (workout?.title && workout.title.trim().length > 0) return workout.title;
    if ((workout as any)?.workout_templates?.name) return (workout as any).workout_templates.name;
    if (exercises.length > 0) {
      const first = exercises[0];
      return first?.exercises?.display_name || 'Workout Session';
    }
    return 'Workout Session';
  }, [workout, exercises]);

  // -------- handlers ----------
  const onExit = () => {
    navigate('/app/dashboard'); // adjust to your dashboard route
  };

  // When warmup changes (e.g., after first set logged), re-pull the single WE
  const refreshOneExercise = async (weId: UUID) => {
    const { data, error } = await supabase
      .from('workout_exercises')
      .select(`
        id, workout_id, exercise_id, order_index,
        target_reps, target_weight_kg, weight_unit, grip_key,
        attribute_values_json, readiness_adjusted_from,
        exercises(id, display_name, slug, equipment_id, load_type, tags),
        workout_sets(
          id, workout_exercise_id, set_index, set_kind, 
          reps, weight_kg, is_completed, rest_seconds
        )
      `)
      .eq('id', weId)
      .single();

    if (!error && data) {
      setExercises((prev) => prev.map((e) => (e.id === weId ? (data as unknown as WorkoutExercise) : e)));
      // Also update sets
      if ((data as any).workout_sets) {
        setSetsByExercise((prev) => ({ 
          ...prev, 
          [weId]: (data as any).workout_sets.sort((a: any, b: any) => a.set_index - b.set_index)
        }));
      }
    }
  };

  const refreshSetsFor = async (weId: UUID) => {
    const { data, error } = await supabase
      .from('workout_sets')
      .select('id,workout_exercise_id,set_index,set_kind,reps,weight_kg,is_completed,rest_seconds')
      .eq('workout_exercise_id', weId)
      .order('set_index', { ascending: true });

    if (!error) {
      setSetsByExercise((prev) => ({ ...prev, [weId]: (data ?? []) as WorkoutSet[] }));
    }
  };

  // -------- ui ----------
  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse text-muted-foreground">Loading workout…</div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="p-4 space-y-4">
        <WorkoutHeader
          title={headerTitle}
          subtitle={workout?.started_at ? new Date(workout.started_at).toLocaleString() : undefined}
          onExit={onExit}
        />
        <div className="text-red-500 text-sm">{err}</div>
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="p-4">
        <div className="text-red-500 text-sm">Workout not found.</div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <WorkoutHeader
        title={headerTitle}
        subtitle={workout.started_at ? new Date(workout.started_at).toLocaleString() : undefined}
        onExit={onExit}
      />

      {/* Exercises list */}
      <div className="space-y-6">
        {exercises?.map(we => {
          const warmup = we.attribute_values_json?.warmup ?? null;
          return (
            <WorkoutExerciseCard
              key={we.id}
              title={we.exercises?.display_name ?? "—"}
              totalSets={we.workout_sets?.length ?? 0}
              targetReps={we.target_reps ?? undefined}
              targetWeightKg={we.target_weight_kg ?? undefined}
              unit={we.weight_unit ?? "kg"}
            >
              <WarmupPanel
                workoutExerciseId={we.id}
                exerciseName={we.exercises?.display_name ?? ""}
                topWeightKg={we.target_weight_kg ?? null}
                steps={Array.isArray(warmup) ? warmup : undefined}
                compact
              />
              <SetList
                workoutExerciseId={we.id}
                sets={we.workout_sets ?? []}
                targetReps={we.target_reps ?? undefined}
                targetWeightKg={we.target_weight_kg ?? undefined}
                unit={we.weight_unit ?? "kg"}
              />
            </WorkoutExerciseCard>
          );
        })}
      </div>

      {/* Debug Panel - moved to bottom with margin */}
      <div className="mt-8 pt-4 border-t border-border">
        <DebugPanel
          workoutId={workoutId}
          workout={workout}
          exercises={exercises}
          firstExercise={exercises?.[0]}
          setsByExercise={setsByExercise}
          lastError={err}
        />
      </div>
    </div>
  );
};

export default WorkoutPage;