import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Play, Pause, CheckCircle, Clock } from 'lucide-react';
import { useEndWorkout } from '../api/workouts.api';
import { toast } from 'sonner';

interface WorkoutData {
  id: string;
  title?: string;
  started_at: string;
  ended_at?: string;
  exercises?: Array<{
    id: string;
    exercise_id: string;
    order_index: number;
    exercise?: {
      id: string;
      exercises_translations?: Array<{
        name: string;
        language_code: string;
      }>;
    };
    sets?: Array<{
      id: string;
      set_index: number;
      weight?: number;
      reps?: number;
      is_completed: boolean;
      set_kind?: string;
    }>;
  }>;
}

interface EnhancedWorkoutSessionProps {
  workout: WorkoutData;
}

const EnhancedWorkoutSession: React.FC<EnhancedWorkoutSessionProps> = ({ workout }) => {
  const navigate = useNavigate();
  const { mutateAsync: endWorkout, isPending: isEnding } = useEndWorkout();

  const handleEndWorkout = async () => {
    try {
      await endWorkout(workout.id);
      toast.success('Workout completed!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to end workout');
      console.error('End workout error:', error);
    }
  };

  const getExerciseName = (exercise: any) => {
    const translation = exercise?.exercises_translations?.find(
      (t: any) => t.language_code === 'en'
    );
    return translation?.name || `Exercise ${exercise?.id}`;
  };

  const formatTime = (startTime: string) => {
    const start = new Date(startTime);
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const minutes = diffMins % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const completedExercises = workout.exercises?.filter(ex => 
    ex.sets?.some(set => set.is_completed)
  ).length || 0;

  const totalExercises = workout.exercises?.length || 0;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {formatTime(workout.started_at)}
          </div>
        </div>

        {/* Workout Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{workout.title || 'Active Workout'}</span>
              <Badge variant="secondary">
                {completedExercises}/{totalExercises} exercises
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button 
                onClick={handleEndWorkout}
                disabled={isEnding}
                variant="destructive"
                className="flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                {isEnding ? 'Ending...' : 'End Workout'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Exercises */}
        <div className="space-y-4">
          {workout.exercises?.map((exercise, index) => (
            <Card key={exercise.id}>
              <CardHeader>
                <CardTitle className="text-lg">
                  {index + 1}. {getExerciseName(exercise.exercise)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {exercise.sets && exercise.sets.length > 0 ? (
                  <div className="space-y-2">
                    {exercise.sets.map((set) => (
                      <div 
                        key={set.id}
                        className={`flex items-center justify-between p-2 rounded ${
                          set.is_completed ? 'bg-green-50 dark:bg-green-900/20' : 'bg-muted'
                        }`}
                      >
                        <span className="font-medium">Set {set.set_index}</span>
                        <div className="flex items-center gap-4 text-sm">
                          {set.weight && <span>{set.weight}kg</span>}
                          {set.reps && <span>{set.reps} reps</span>}
                          {set.is_completed && (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Play className="h-8 w-8 mx-auto mb-2" />
                    <p>No sets logged yet</p>
                    <Button variant="outline" className="mt-2">
                      Start Exercise
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {(!workout.exercises || workout.exercises.length === 0) && (
            <Card>
              <CardContent className="text-center py-8">
                <div className="text-muted-foreground">
                  <Play className="h-8 w-8 mx-auto mb-2" />
                  <p>No exercises in this workout</p>
                  <p className="text-sm">Add exercises to get started</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedWorkoutSession;