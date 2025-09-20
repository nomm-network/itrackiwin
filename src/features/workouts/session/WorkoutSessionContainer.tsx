// workout-flow-v0.8.0 (SOT)
// Restores old flow, readiness handoff, correct workout query (with exercise names + warmup)
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import WorkoutSessionBody from './WorkoutSessionBody';
import { useReadinessStore } from '@/stores/readinessStore';
import { toast } from '@/components/ui/use-toast';

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
  const params = useParams<{ workoutId?: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const workoutId = useMemo(() => (Array.isArray(params?.workoutId) ? params.workoutId[0] : params?.workoutId) ?? null, [params]);
  const [shouldShowReadiness, setShouldShowReadiness] = useState(false);

  // sanity – we never allow "test" fallbacks
  useEffect(() => {
    if (!workoutId) {
      toast({
        title: 'Workout missing',
        description: 'No workoutId in route.',
        variant: 'destructive',
      });
      navigate('/app/programs');
    }
  }, [workoutId, navigate]);

  const readinessStore = useReadinessStore();

  const { data: workout, isLoading } = useQuery({
    queryKey: ['workout-session', workoutId],
    enabled: !!workoutId,
    staleTime: 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workouts')
        .select(`
          id, title, started_at, readiness_score, template_id,
          exercises:workout_exercises(
            id, order_index, target_sets, target_reps, target_weight_kg, weight_unit,
            attribute_values_json, display_name,
            exercise:exercises(
              id, display_name, name, slug, effort_mode, load_mode, allows_grips, is_unilateral,
              equipment:equipment_id(id, equipment_type, default_bar_weight_kg, slug)
            ),
            sets:workout_sets(
              id, set_index, weight_kg, reps, duration_seconds, distance,
              rpe, notes, set_kind, is_completed, completed_at, grip_key
            )
          )
        `)
        .eq('id', workoutId)
        .maybeSingle();

      if (error) throw error;
      return data as any;
    },
  });

  // readiness handoff after submit
  useEffect(() => {
    if (!workoutId) return;
    if (readinessStore.score != null) {
      setShouldShowReadiness(false);
      // persist snapshot to workout
      if (readinessStore.score != null) {
        supabase.from('workouts').update({ readiness_score: readinessStore.score }).eq('id', workoutId);
        queryClient.invalidateQueries({ queryKey: ['workout-session', workoutId] });
      }
    }
  }, [workoutId, readinessStore.score]); // eslint-disable-line

  if (!workoutId) return null;

  return (
    <WorkoutSessionBody
      workoutId={workoutId}
      workout={workout ?? null}
      loading={isLoading}
      shouldShowReadiness={shouldShowReadiness}
      setShouldShowReadiness={setShouldShowReadiness}
    />
  );
}