// workout-flow-v1.0.0 (SOT) – DO NOT DUPLICATE
'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import WorkoutSessionBody from './WorkoutSessionBody';
import { toast } from '@/hooks/use-toast';

type WorkoutRow = {
  id: string;
  title: string | null;
  started_at: string | null;
  readiness_score: number | null;
  template_id: string | null;
  exercises: Array<{
    id: string;
    order_index: number | null;
    target_sets: number | null;
    target_reps: number | null;
    target_weight_kg: number | null;
    weight_unit: 'kg' | 'lb' | null;
    attribute_values_json: any | null;
    display_name: string | null;
    exercise: {
      id: string;
      display_name: string | null;
      name: string | null;
      slug: string | null;
      effort_mode: 'reps' | 'time' | 'distance' | 'calories' | null;
      load_mode: 'none' | 'external_added' | 'external_assist' | 'bodyweight_plus_optional' | 'machine_level' | null;
      allows_grips: boolean | null;
      is_unilateral: boolean | null;
      equipment: {
        id: string;
        equipment_type: 'barbell' | 'dumbbell' | 'machine' | 'cable' | 'kb' | 'smith' | string | null;
        default_bar_weight_kg: number | null;
        slug: string | null;
      } | null;
    } | null;
    sets: Array<{
      id: string;
      set_index: number | null;
      weight_kg: number | null;
      reps: number | null;
      duration_seconds: number | null;
      distance: number | null;
      rpe: number | null;
      notes: string | null;
      set_kind: 'work' | 'warmup' | null;
      is_completed: boolean | null;
      completed_at: string | null;
      grip_key: string | null;
    }>;
  }>;
};

export default function WorkoutSessionContainer() {
  const { workoutId } = useParams<{ workoutId: string }>();
  const navigate = useNavigate();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['workout', workoutId],
    enabled: Boolean(workoutId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workouts')
        .select(`
          id, title, started_at, template_id, readiness_score,
          exercises:workout_exercises(
            id, workout_id, exercise_id, order_index,
            target_sets, target_reps, target_weight_kg, weight_unit,
            attribute_values_json, display_name,
            exercise:exercises(
              id, name, display_name, slug, effort_mode, load_mode, allows_grips, is_unilateral,
              equipment:equipment_id(id, equipment_type, default_bar_weight_kg, slug)
            ),
            sets:workout_sets(
              id, set_index, weight_kg, reps, duration_seconds, distance,
              rpe, notes, set_kind, is_completed, completed_at, grip_key
            )
          )
        `)
        .eq('id', workoutId)
        .single();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (error) {
      toast({ title: 'Failed to load workout', description: String(error), variant: 'destructive' });
    }
  }, [error]);

  if (isLoading) return null;

  if (!data) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-slate-700 bg-slate-900 p-6 text-slate-300">
          No exercises found in this workout.
        </div>
      </div>
    );
  }

  return <WorkoutSessionBody workout={data} onReload={refetch} />;
}