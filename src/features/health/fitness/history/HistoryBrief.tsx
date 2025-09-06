import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, Target } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

export default function HistoryBrief() {
  const { workoutId } = useParams<{ workoutId: string }>();
  const navigate = useNavigate();

  const { data: workout, isLoading } = useQuery({
    queryKey: ['workout-brief', workoutId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workouts')
        .select(`
          id,
          started_at,
          ended_at,
          workout_exercises!inner(
            id,
            exercise:exercises(display_name),
            workout_sets(count)
          )
        `)
        .eq('id', workoutId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!workoutId,
  });

  // Calculate duration
  const duration = workout?.started_at && workout?.ended_at 
    ? Math.round((new Date(workout.ended_at).getTime() - new Date(workout.started_at).getTime()) / (1000 * 60))
    : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Workout not found</h2>
          <p className="text-muted-foreground mb-4">This workout doesn't exist or you don't have access to it.</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Workout Summary</h1>
            <p className="text-muted-foreground">
              {formatDistanceToNow(new Date(workout.started_at), { addSuffix: true })}
            </p>
          </div>
        </div>

        {/* Workout Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>
                {duration ? `${duration} minutes` : 'Duration not recorded'}
              </span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Started:</span>{' '}
              {new Date(workout.started_at).toLocaleString()}
            </div>
            {workout.ended_at && (
              <div className="text-sm">
                <span className="text-muted-foreground">Finished:</span>{' '}
                {new Date(workout.ended_at).toLocaleString()}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Exercises Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Exercises ({workout.workout_exercises?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {workout.workout_exercises?.map((we: any) => (
              <div key={we.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <div className="font-medium">{we.exercise?.display_name || 'Unknown Exercise'}</div>
                  <div className="text-sm text-muted-foreground">
                    {we.workout_sets?.length || 0} sets completed
                  </div>
                </div>
              </div>
            )) || (
              <div className="text-center text-muted-foreground py-8">
                No exercises recorded
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}