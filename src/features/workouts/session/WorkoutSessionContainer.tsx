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
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  
  // Readiness check
  const { data: shouldShowReadiness, isLoading: isCheckingReadiness } = useShouldShowReadiness(id, user?.id);
  const { createCheckin } = usePreWorkoutCheckin(id);
  
  // Fetch workout data
  const { data: workout, isLoading: workoutLoading } = useQuery({
    queryKey: ['workout-session', id],
    enabled: Boolean(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workouts')
        .select(`
          *,
          exercises:workout_exercises(
            *,
            exercise:exercises(*),
            sets:logged_sets(*)
          )
        `)
        .eq('id', id!)
        .single();
      
      if (error) throw error;
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
      
      // Force immediate update to bypass readiness check
      queryClient.setQueryData(['workout-readiness', id, user?.id], false);
      queryClient.invalidateQueries({ queryKey: ['workout-readiness', id, user?.id] });
    } catch (error) {
      console.error('Failed to create checkin:', error);
      // Even if checkin fails, allow workout to proceed
      queryClient.setQueryData(['workout-readiness', id, user?.id], false);
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
          workoutId={id!}
          onSubmit={handleReadinessSubmit}
        />
      </div>
    );
  }

  return <WorkoutSessionBody workout={workout} workoutId={id} />;
}