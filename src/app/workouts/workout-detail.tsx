import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EnhancedWorkoutSession } from '@/features/workouts/components';

export default function WorkoutPage() {
  const { workoutId } = useParams<{ workoutId: string }>();
  const { data: workout, isLoading, isError, error } = useQuery({
    queryKey: ['workout-with-title', workoutId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workouts')
        .select(`
          *,
          workout_template:workout_templates(name),
          program_session:program_sessions(title)
        `)
        .eq('id', workoutId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!workoutId,
  });

  console.log('[WorkoutPage] id param:', workoutId);
  console.log('[WorkoutPage] query state:', { isLoading, isError, hasData: !!workout });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading workout...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Failed to load workout</h2>
          <p className="text-muted-foreground">{(error as any)?.message}</p>
        </div>
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Workout not found</h2>
          <p className="text-muted-foreground">This workout doesn't exist or you don't have access to it.</p>
        </div>
      </div>
    );
  }

  return <EnhancedWorkoutSession workout={workout} />;
}