import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
// import { SessionRunner } from '@/components/fitness/SessionRunner'; // TODO: Migrate this component
// import { EnhancedRestTimer } from '@/components/fitness/EnhancedRestTimer'; // TODO: Migrate this component
import { 
  Play, 
  Square, 
  RotateCcw, 
  Settings, 
  Clock,
  Activity,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';

interface SetData {
  id?: string;
  weight?: number;
  reps?: number;
  rpe?: number;
  notes?: string;
  set_index?: number;
  is_completed?: boolean;
}

interface ExerciseData {
  id: string;
  name: string;
  order_index: number;
  notes?: string;
}

interface WorkoutData {
  id: string;
  title: string;
  started_at: string;
  ended_at?: string;
  exercises: ExerciseData[];
  sets: Record<string, SetData[]>; // exerciseId -> sets
}

const DEMO_WORKOUT: WorkoutData = {
  id: 'demo-workout',
  title: 'Push Day - Upper Body',
  started_at: new Date().toISOString(),
  exercises: [
    { id: 'exercise-1', name: 'Barbell Bench Press', order_index: 1 },
    { id: 'exercise-2', name: 'Overhead Press', order_index: 2 },
    { id: 'exercise-3', name: 'Incline Dumbbell Press', order_index: 3 },
    { id: 'exercise-4', name: 'Triceps Pushdown', order_index: 4 }
  ],
  sets: {
    'exercise-1': [
      { id: 'set-1', weight: 80, reps: 8, rpe: 7, set_index: 1, is_completed: true },
      { id: 'set-2', weight: 82.5, reps: 6, rpe: 8, set_index: 2, is_completed: true }
    ],
    'exercise-2': [],
    'exercise-3': [],
    'exercise-4': []
  }
};

const SessionRunnerDemo: React.FC = () => {
  const [workout, setWorkout] = useState<WorkoutData>(DEMO_WORKOUT);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isWorkoutActive, setIsWorkoutActive] = useState(true);
  const [showGlobalTimer, setShowGlobalTimer] = useState(false);

  const currentExercise = workout.exercises[currentExerciseIndex];
  const currentSets = workout.sets[currentExercise?.id] || [];
  
  // Calculate workout progress
  const totalSets = workout.exercises.length * 3; // Assume 3 sets per exercise
  const completedSets = Object.values(workout.sets).flat().filter(s => s.is_completed).length;
  const progressPercentage = (completedSets / totalSets) * 100;

  const handleSetComplete = (exerciseId: string, setData: SetData) => {
    const newSetData = {
      ...setData,
      id: `set-${Date.now()}`,
      is_completed: true
    };

    setWorkout(prev => ({
      ...prev,
      sets: {
        ...prev.sets,
        [exerciseId]: [...(prev.sets[exerciseId] || []), newSetData]
      }
    }));

    toast.success('Set completed!', {
      description: `${setData.weight}kg × ${setData.reps} reps added`
    });
  };

  const handleExerciseComplete = () => {
    if (currentExerciseIndex < workout.exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      toast.success('Exercise complete!', {
        description: 'Moving to next exercise'
      });
    } else {
      handleWorkoutComplete();
    }
  };

  const handleWorkoutComplete = () => {
    setIsWorkoutActive(false);
    setWorkout(prev => ({
      ...prev,
      ended_at: new Date().toISOString()
    }));
    
    toast.success('🎉 Workout Complete!', {
      description: `Great job! ${completedSets} sets completed.`
    });
  };

  const resetDemo = () => {
    setWorkout(DEMO_WORKOUT);
    setCurrentExerciseIndex(0);
    setIsWorkoutActive(true);
    setShowGlobalTimer(false);
    toast.info('Demo reset');
  };

  const calculateWorkoutDuration = () => {
    const start = new Date(workout.started_at);
    const end = workout.ended_at ? new Date(workout.ended_at) : new Date();
    const duration = Math.floor((end.getTime() - start.getTime()) / 1000 / 60);
    return `${duration} min`;
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Session Runner UX Demo</CardTitle>
                <p className="text-muted-foreground mt-1">
                  Enhanced workout logging with quick actions and auto-rest timer
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowGlobalTimer(!showGlobalTimer)}
                >
                  <Clock className="h-4 w-4 mr-1" />
                  Timer
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={resetDemo}
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Reset Demo
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Workout Progress */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{workout.title}</h3>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <Activity className="h-4 w-4" />
                    {completedSets}/{totalSets} sets
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {calculateWorkoutDuration()}
                  </span>
                </div>
              </div>
              
              <Progress value={progressPercentage} className="h-2" />
              
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Exercise {currentExerciseIndex + 1} of {workout.exercises.length}</span>
                <span>{Math.round(progressPercentage)}% complete</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h4 className="font-medium">Quick Actions</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                One-tap buttons for +2.5kg, +1 rep, "same as last", and target weight
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-primary" />
                <h4 className="font-medium">Auto Rest Timer</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Automatically starts rest timer based on RPE when set is completed
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-5 w-5 text-primary" />
                <h4 className="font-medium">Session Tracking</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                All timer sessions saved to database for analytics and insights
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Current Exercise */}
        {isWorkoutActive && currentExercise && (
          <div className="p-4 bg-muted rounded-lg text-center">
            <p>SessionRunner component - Migration in progress</p>
            <p>Current exercise: {currentExercise.name}</p>
          </div>
        )}

        {/* Exercise List / Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Exercise Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {workout.exercises.map((exercise, index) => {
                const sets = workout.sets[exercise.id] || [];
                const isActive = index === currentExerciseIndex && isWorkoutActive;
                const isCompleted = sets.filter(s => s.is_completed).length >= 3;
                
                return (
                  <div 
                    key={exercise.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      isActive ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant={isCompleted ? 'default' : isActive ? 'secondary' : 'outline'}>
                        #{exercise.order_index}
                      </Badge>
                      <span className={`font-medium ${isActive ? 'text-primary' : ''}`}>
                        {exercise.name}
                      </span>
                      {isActive && (
                        <Badge variant="outline" className="text-xs">
                          Current
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <span>{sets.filter(s => s.is_completed).length}/3 sets</span>
                      {sets.length > 0 && (
                        <span className="text-muted-foreground">
                          Last: {sets[sets.length - 1]?.weight}kg × {sets[sets.length - 1]?.reps}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Workout Complete Summary */}
        {!isWorkoutActive && (
          <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
            <CardContent className="pt-6">
              <div className="text-center space-y-3">
                <h3 className="text-xl font-bold text-green-700 dark:text-green-300">
                  🎉 Workout Complete!
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-2xl font-bold text-green-600">{completedSets}</p>
                    <p className="text-sm text-green-700">Sets Completed</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">{workout.exercises.length}</p>
                    <p className="text-sm text-green-700">Exercises</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">{calculateWorkoutDuration()}</p>
                    <p className="text-sm text-green-700">Duration</p>
                  </div>
                </div>
                <p className="text-green-700 dark:text-green-300">
                  All rest timer sessions have been saved to the database.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Global Rest Timer (Demo) */}
        {showGlobalTimer && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white p-6 rounded-lg shadow-2xl text-center">
              <p>EnhancedRestTimer component - Migration in progress</p>
              <Button onClick={() => setShowGlobalTimer(false)} className="mt-2">Close Timer</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionRunnerDemo;