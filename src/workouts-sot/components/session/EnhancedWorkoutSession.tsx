// SOT Simplified Workout Session - Self-contained with debug tracking
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, CheckCircle, Timer, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ExerciseCard from './shim-ExerciseCard';
import { useLogSet, useUpdateSet } from '../../hooks';

// Add SOT debug logging
console.log('📁 [EnhancedWorkoutSession] SOT Component loaded from: src/workouts-sot/components/session/EnhancedWorkoutSession.tsx');
console.log('📁 [EnhancedWorkoutSession] SOT Dependencies:', {
  hooks: '@/workouts-sot/hooks',
  shimedComponent: './shim-ExerciseCard',
  uiComponents: '@/components/ui/*'
});

interface WorkoutSessionProps {
  workout: any;
}

export default function EnhancedWorkoutSession({ workout }: WorkoutSessionProps) {
  console.log('🎯 [EnhancedWorkoutSession] Workout prop received:', { 
    workoutId: workout?.id, 
    hasExercises: !!workout?.exercises?.length,
    exerciseCount: workout?.exercises?.length || 0,
    sotFile: 'src/workouts-sot/components/session/EnhancedWorkoutSession.tsx'
  });
  
  const navigate = useNavigate();
  const { mutate: logSet, isPending: isLogging } = useLogSet();
  const { mutate: updateSet } = useUpdateSet();
  
  const [currentExerciseId, setCurrentExerciseId] = useState<string | null>(() => {
    return workout?.exercises?.sort((a: any, b: any) => a.order_index - b.order_index)?.[0]?.id ?? null;
  });
  
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  
  const currentExercise = useMemo(() => {
    const sortedExercises = workout?.exercises?.sort((a: any, b: any) => a.order_index - b.order_index) || [];
    return sortedExercises.find((x: any) => x.id === currentExerciseId) ?? sortedExercises[0];
  }, [workout?.exercises, currentExerciseId]);
  
  const getExerciseName = () => {
    const translations = currentExercise?.exercise?.exercises_translations;
    if (translations && Array.isArray(translations)) {
      const enTranslation = translations.find(t => t.language_code === 'en');
      if (enTranslation?.name) return enTranslation.name;
    }
    return currentExercise?.exercise?.name || `Exercise ${currentExercise?.exercise_id?.slice(0, 8) || 'Unknown'}`;
  };
  
  const sets = currentExercise?.sets || [];
  const completedSetsCount = sets.filter((set: any) => set.is_completed).length;
  const totalExercises = workout?.exercises?.length || 0;
  const progressPercentage = totalExercises > 0 ? (completedExercises.size / totalExercises) * 100 : 0;
  
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">{workout.title || 'Workout Session'}</h1>
            <Badge variant="secondary">
              {completedExercises.size} / {totalExercises} Complete
            </Badge>
          </div>
          <Progress value={progressPercentage} className="w-full" />
        </div>

        {/* Current Exercise */}
        {currentExercise && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                {getExerciseName()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {/* Sets Display */}
                <div className="space-y-2">
                  <h3 className="font-medium">Sets ({completedSetsCount} completed)</h3>
                  {sets.map((set: any, index: number) => (
                    <div 
                      key={set.id || index} 
                      className={`p-3 rounded-lg border ${set.is_completed ? 'bg-green-50 border-green-200' : 'bg-background'}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Set {index + 1}</span>
                        {set.is_completed ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <Play className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      {set.weight && (
                        <div className="text-sm text-muted-foreground mt-1">
                          {set.weight}{set.weight_unit || 'kg'} × {set.reps} reps
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Exercise Navigation */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      const exercises = workout.exercises?.sort((a: any, b: any) => a.order_index - b.order_index) || [];
                      const currentIndex = exercises.findIndex((ex: any) => ex.id === currentExerciseId);
                      if (currentIndex > 0) {
                        setCurrentExerciseId(exercises[currentIndex - 1].id);
                      }
                    }}
                    disabled={!workout.exercises || workout.exercises.findIndex((ex: any) => ex.id === currentExerciseId) <= 0}
                  >
                    Previous Exercise
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      const exercises = workout.exercises?.sort((a: any, b: any) => a.order_index - b.order_index) || [];
                      const currentIndex = exercises.findIndex((ex: any) => ex.id === currentExerciseId);
                      if (currentIndex < exercises.length - 1) {
                        setCurrentExerciseId(exercises[currentIndex + 1].id);
                      }
                    }}
                    disabled={!workout.exercises || workout.exercises.findIndex((ex: any) => ex.id === currentExerciseId) >= (workout.exercises?.length || 0) - 1}
                  >
                    Next Exercise
                  </Button>
                  
                  <Button 
                    className="ml-auto"
                    onClick={() => navigate('/fitness')}
                  >
                    End Workout
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}