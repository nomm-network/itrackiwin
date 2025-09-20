// workout-flow-v0.7.0 (SOT) – DO NOT DUPLICATE
import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useShouldShowReadiness } from '@/features/health/fitness/hooks/useShouldShowReadiness';
import { usePreWorkoutCheckin } from '@/features/health/fitness/hooks/usePreWorkoutCheckin';
import { useQueryClient } from '@tanstack/react-query';
import { computeReadinessScore } from '@/lib/readiness';
import EnhancedReadinessCheckIn, { EnhancedReadinessData } from '@/components/fitness/EnhancedReadinessCheckIn';
import WorkoutSessionBody from './WorkoutSessionBody';

export default function WorkoutSessionContainer() {
  const { workoutId } = useParams();
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  
  // Fix 1: Assert we have a valid workout ID - no fallbacks to "test"
  if (!workoutId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-destructive mb-2">Missing workout ID</p>
          <p className="text-muted-foreground text-sm">Cannot load workout session without a valid workout ID</p>
        </div>
      </div>
    );
  }
  
  // Fix 6: Readiness check with proper invalidation
  const { data: shouldShowReadiness, isLoading: isCheckingReadiness } = useShouldShowReadiness(workoutId, user?.id);
  const { createCheckin } = usePreWorkoutCheckin(workoutId);
  
  // Fix 2 & 3: Fetch workout with proper joins including exercise names and warmup data
  const { data: workout, isLoading: workoutLoading } = useQuery({
    queryKey: ['workouts', workoutId],
    enabled: Boolean(workoutId),
    staleTime: 0,
    queryFn: async () => {
      console.log('🔍 [v0.7.0] Fetching workout data for ID:', workoutId);
      
      const { data, error } = await supabase
        .from('workouts')
        .select(`
          id, title, started_at, readiness_score, template_id,
          exercises:workout_exercises(
            id, order_index, target_sets, target_reps, target_weight_kg, weight_unit,
            attribute_values_json, display_name,
            exercise:exercises(
              id, display_name, slug, effort_mode, load_mode, allows_grips, is_unilateral,
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
      
      console.log('🔍 [v0.7.0] Workout query result:', { data, error, exerciseCount: data?.exercises?.length });
      
      if (error) {
        console.error('❌ [v0.7.0] Workout query error:', error);
        throw error;
      }
      
      if (!data) {
        console.warn('⚠️ [v0.7.0] No workout found for ID:', workoutId);
        return null;
      }
      
      return data;
    }
  });

  const handleReadinessSubmit = async (data: EnhancedReadinessData) => {
    try {
      const readinessInput = {
        energy: data.readiness.energy,
        sleepQuality: data.readiness.sleep_quality,
        sleepHours: data.readiness.sleep_hours,
        soreness: data.readiness.soreness,
        stress: data.readiness.stress,
        mood: data.readiness.mood,
        energizers: data.readiness.energisers_taken,
        illness: data.readiness.illness,
        alcohol: data.readiness.alcohol
      };
      const score = computeReadinessScore(readinessInput);
      
      await createCheckin.mutateAsync({ 
        answers: data.readiness, 
        readiness_score: score 
      });
      
      // Fix 6: Proper readiness invalidation 
      console.info('[workout-flow-v0.7.0] readiness logged – invalidated readiness query');
      queryClient.setQueryData(['workout-readiness', workoutId, user?.id], false);
      queryClient.invalidateQueries({ queryKey: ['workout-readiness', workoutId, user?.id] });
    } catch (error) {
      console.error('Failed to create checkin:', error);
      // Even if checkin fails, allow workout to proceed
      queryClient.setQueryData(['workout-readiness', workoutId, user?.id], false);
    }
  };

  if (authLoading || isCheckingReadiness || workoutLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading workout session...</p>
        </div>
      </div>
    );
  }

  if (shouldShowReadiness) {
    return (
      <div className="container mx-auto p-4 max-w-md pb-20">
        <EnhancedReadinessCheckIn
          workoutId={workoutId!}
          onSubmit={handleReadinessSubmit}
        />
      </div>
    );
  }

  return <WorkoutSessionBody workout={workout} workoutId={workoutId} />;
}