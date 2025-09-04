// src/features/health/fitness/workouts/pages/WorkoutPage.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

// Old-UI building blocks you restored earlier:
import WorkoutHeader from '../components/WorkoutHeader';
import WarmupPanel from '../components/WarmupPanel';
import SetList from '../components/SetList';

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
  exercise: {
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

      // 1) workout
      const { data: w, error: wErr } = await supabase
        .from('workouts')
        .select('id,user_id,template_id,started_at,ended_at,readiness_score,title')
        .eq('id', workoutId)
        .single();

      if (wErr) {
        if (!isCancelled) {
          setErr(`Failed to load workout: ${wErr.message}`);
          setLoading(false);
        }
        return;
      }

      // 2) workout_exercises + exercise info
      const { data: wes, error: weErr } = await supabase
        .from('workout_exercises')
        .select(`
          id, workout_id, exercise_id, order_index,
          target_reps, target_weight_kg, weight_unit,
          attribute_values_json, readiness_adjusted_from,
          exercise:exercises!inner(id, display_name, slug, equipment_id, load_type, tags)
        `)
        .eq('workout_id', workoutId)
        .order('order_index', { ascending: true });

      if (weErr) {
        if (!isCancelled) {
          setErr(`Failed to load workout exercises: ${weErr.message}`);
          setLoading(false);
        }
        return;
      }

      // 3) sets for those workout_exercises
      const allWeIds = (wes ?? []).map((x) => x.id);
      let setsMap: Record<string, WorkoutSet[]> = {};
      if (allWeIds.length > 0) {
        const { data: sets, error: sErr } = await supabase
          .from('workout_sets')
          .select('id,workout_exercise_id,set_index,set_kind,reps,weight_kg,is_completed,rest_seconds')
          .in('workout_exercise_id', allWeIds)
          .order('set_index', { ascending: true });

        if (sErr) {
          if (!isCancelled) {
            setErr(`Failed to load sets: ${sErr.message}`);
            setLoading(false);
          }
          return;
        }

        // group by workout_exercise_id
        (sets ?? []).forEach((s) => {
          if (!setsMap[s.workout_exercise_id]) setsMap[s.workout_exercise_id] = [];
          setsMap[s.workout_exercise_id].push(s);
        });
      }

      if (!isCancelled) {
        setWorkout(w as Workout);
        setExercises((wes ?? []) as unknown as WorkoutExercise[]);
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
    // Prefer template title if stored on workout, else first exercise name, else fallback
    if (workout?.title && workout.title.trim().length > 0) return workout.title;
    if (exercises.length > 0) {
      const first = exercises[0];
      return first?.exercise?.display_name || 'Workout Session';
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
        target_reps, target_weight_kg, weight_unit,
        attribute_values_json, readiness_adjusted_from,
        exercise:exercises!inner(id, display_name, slug, equipment_id, load_type, tags)
      `)
      .eq('id', weId)
      .single();

    if (!error && data) {
      setExercises((prev) => prev.map((e) => (e.id === weId ? (data as unknown as WorkoutExercise) : e)));
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
        {exercises.map((we) => {
          const warmupSteps =
            we.attribute_values_json?.warmup && Array.isArray(we.attribute_values_json.warmup)
              ? we.attribute_values_json.warmup
              : null;

          // compact warmup block + sets below (old UI feel)
          return (
            <div key={we.id} className="rounded-lg border bg-card">
              {/* Warmup (compact) */}
              <WarmupPanel
                exerciseId={we.exercise_id}
                workoutExerciseId={we.id}
                exerciseName={we.exercise.display_name || we.exercise.slug}
                topWeightKg={we.target_weight_kg ?? null}
                warmupSteps={warmupSteps}
                // Ask WarmupPanel to be compact like old UI
                compact
                onWarmupRecalculated={() => refreshOneExercise(we.id)}
              />

              {/* Working sets */}
              <SetList
                workoutExerciseId={we.id}
                targetReps={we.target_reps ?? undefined}
                targetWeightKg={we.target_weight_kg ?? undefined}
                unit={we.weight_unit ?? 'kg'}
                sets={setsByExercise[we.id] ?? []}
                onSetsChanged={() => refreshSetsFor(we.id)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WorkoutPage;