import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Hand, 
  Hash,
  Flame,
  Clock,
  Trophy,
  Edit3,
  ChevronDown,
  Minus,
  Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SmartSetForm from '@/components/workout/set-forms/SmartSetForm';
import { PerSideToggle } from '@/components/workout/PerSideToggle';
import { useLogSet } from '../hooks';
import { useAuth } from '@/hooks/useAuth';
import { useSessionTiming } from '@/stores/sessionTiming';
import { WORKOUT_FLOW_VERSION } from './constants';

interface WorkoutSessionBodyProps {
  workout: any;
  workoutId?: string;
}

export default function WorkoutSessionBody({ workout, workoutId }: WorkoutSessionBodyProps) {
  // Fix 8: Add debug logging with all key info
  const debugPayload = {
    templateId: workout?.template_id || null,
    workoutId: workoutId,
    exerciseCount: workout?.exercises?.length || 0,
    hasReadiness: !!workout?.readiness_score
  };
  console.info('[workout-flow-v0.6.0] session', debugPayload);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { startSession } = useSessionTiming();
  
  const [currentExerciseId, setCurrentExerciseId] = useState<string | null>(() => {
    const key = `workout_${workout?.id || workoutId}_currentExercise`;
    try {
      const stored = localStorage.getItem(key);
      if (stored && workout?.exercises?.some((ex: any) => ex.id === stored)) {
        return stored;
      }
    } catch {}
    return workout?.exercises?.sort((a: any, b: any) => a.order_index - b.order_index)?.[0]?.id ?? null;
  });
  
  // UI state for menus
  const [showGripSelector, setShowGripSelector] = useState(false);
  const [showWarmupMenu, setShowWarmupMenu] = useState(false);
  const [showSetSettings, setShowSetSettings] = useState(false);
  const [selectedGrips, setSelectedGrips] = useState<Record<string, string[]>>({});
  
  // Exercise settings state
  const [targetSets, setTargetSets] = useState(3);
  const [autoRestTimer, setAutoRestTimer] = useState(true);
  const [showTargets, setShowTargets] = useState(true);
  
  // Current set input state
  const [currentSetData, setCurrentSetData] = useState({
    weight: 20,
    reps: 10,
    feel: '=',
    perSideMode: false as boolean
  });
  
  // Rest timer state
  const [restStartTime, setRestStartTime] = useState<Date | null>(null);
  const [restDuration, setRestDuration] = useState(0);
  const [readinessScore] = useState<number>(() => {
    const key = `workout_${workout?.id || workoutId}_readiness`;
    try {
      const stored = localStorage.getItem(key);
      return stored ? parseFloat(stored) : 69;
    } catch {
      return 69;
    }
  });

  const currentExercise = useMemo(() => {
    const sortedExercises = workout?.exercises?.sort((a: any, b: any) => a.order_index - b.order_index) || [];
    return sortedExercises.find((x: any) => x.id === currentExerciseId) ?? sortedExercises[0];
  }, [workout?.exercises, currentExerciseId]);

  // Fix 4: Warmup visibility rule
  const hasWarmup = useMemo(() => {
    if (!currentExercise) return false;
    const warmupPlan = currentExercise.attribute_values_json?.warmup;
    return !!(warmupPlan && Object.keys(warmupPlan || {}).length > 0);
  }, [currentExercise]);

  const sets = currentExercise?.sets || [];
  const completedSetsCount = sets.filter((set: any) => set.is_completed).length;
  const currentSetNumber = completedSetsCount + 1;
  
  // Timer effect - starts from set 2
  useEffect(() => {
    if (currentSetNumber >= 2) {
      const timer = setInterval(() => {
        if (restStartTime) {
          const elapsed = Math.floor((Date.now() - restStartTime.getTime()) / 1000);
          setRestDuration(elapsed);
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [currentSetNumber, restStartTime]);

  // Fix 3: Exercise name resolution rule
  const getExerciseName = () => {
    return currentExercise?.display_name
        || currentExercise?.exercise?.display_name 
        || currentExercise?.exercise?.name 
        || currentExercise?.name 
        || 'Exercise';
  };

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle feel selection (feel chips)
  const handleFeelSelect = (feel: string) => {
    setCurrentSetData(prev => ({ ...prev, feel }));
  };

  // Handle weight/reps changes
  const handleWeightChange = (delta: number) => {
    setCurrentSetData(prev => ({ 
      ...prev, 
      weight: Math.max(0, prev.weight + delta) 
    }));
  };

  const handleRepsChange = (delta: number) => {
    setCurrentSetData(prev => ({ 
      ...prev, 
      reps: Math.max(0, prev.reps + delta) 
    }));
  };

  const handleLogSet = () => {
    console.log('Logging set:', currentSetData);
    // Start rest timer for next set
    setRestStartTime(new Date());
  };

  // Per-side toggle handler
  const handlePerSideModeChange = (mode: 'per_side' | 'total') => {
    setCurrentSetData(prev => ({ 
      ...prev, 
      perSideMode: mode === 'per_side' 
    }));
  };

  // Menu handlers
  const handleGripMenuOpen = () => setShowGripSelector(true);
  const handleWarmupMenuOpen = () => setShowWarmupMenu(true);
  const handleSetSettingsOpen = () => setShowSetSettings(true);

  if (!currentExercise) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No exercises found in this workout.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalExercises = workout?.exercises?.length || 0;
  const totalSets = currentExercise?.target_sets || 3;
  const lastSet = sets.find((set: any) => set.is_completed && set.set_index === completedSetsCount);

  // Fix 8: Complete debug info
  const debugInfo = {
    version: WORKOUT_FLOW_VERSION,
    templateId: workout?.template_id || null,
    workoutId: workoutId,
    exerciseId: currentExercise?.id || null,
    exerciseTitle: getExerciseName(),
    effort_mode: currentExercise?.exercise?.effort_mode || null,
    load_mode: currentExercise?.exercise?.load_mode || null,
    hasWarmup: hasWarmup,
    shouldShowReadiness: false, // Will be updated by container
    exercise: {
      id: currentExercise?.id,
      display_name: currentExercise?.display_name,
      equipment_type: currentExercise?.exercise?.equipment?.equipment_type
    },
    derived: {
      isBodyweight: currentExercise?.exercise?.load_mode === 'bodyweight_plus_optional',
      isBarbell: currentExercise?.exercise?.equipment?.equipment_type === 'barbell',
      isMachine: currentExercise?.exercise?.equipment?.equipment_type === 'machine',
      isPerSide: currentSetData.perSideMode
    },
    lastReadiness: { score: readinessScore, at: new Date().toISOString() },
    setPayloadPreview: {
      workout_exercise_id: currentExercise?.id,
      set_index: currentSetNumber,
      weight_kg: currentSetData.weight,
      reps: currentSetData.reps,
      effort_rating: currentSetData.feel,
      is_completed: true
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h1 className="text-xl font-semibold">{workout?.name || 'Workout'}</h1>
        <div className="flex items-center gap-2">
          {/* Readiness Badge */}
          <Badge variant="secondary" className="bg-orange-500/20 text-orange-400 border-orange-500/30">
            {Math.round(readinessScore)}
          </Badge>
          
          {/* Timer Badge - only show from set 2 */}
          {currentSetNumber >= 2 && (
            <Badge variant="secondary" className="bg-slate-700 text-white border-slate-600 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatTime(restDuration)}
            </Badge>
          )}
          
          {/* Progress Badge */}
          <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 flex items-center gap-1">
            <Trophy className="h-3 w-3" />
            1/{totalExercises}
          </Badge>
        </div>
      </div>

      {/* Exercise Header */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">{getExerciseName()}</h2>
          <div className="flex items-center gap-2">
            {/* Mini Menu Icons */}
            <Button
              variant="ghost"
              size="sm"
              className="p-2 h-8 w-8"
              onClick={handleGripMenuOpen}
            >
              <Hand className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="p-2 h-8 w-8 relative"
              onClick={handleSetSettingsOpen}
            >
              <Hash className="h-4 w-4" />
              <Badge variant="secondary" className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs">
                {targetSets}
              </Badge>
            </Button>
            
            {/* Fix 4: Only show warmup icon when warmup is available */}
            {hasWarmup && (
              <Button
                variant="ghost"
                size="sm"
                className="p-2 h-8 w-8"
                onClick={handleWarmupMenuOpen}
              >
                <Flame className="h-4 w-4" />
              </Button>
            )}
            
            <Badge variant="secondary" className="bg-slate-700 text-white">
              {completedSetsCount}/{totalSets} sets
            </Badge>
          </div>
        </div>

        {/* Prev/Target Card */}
        {lastSet && (
          <Card className="mb-4 bg-muted/50">
            <CardContent className="p-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Previous:</span>
                  <div className="font-medium">{lastSet.weight}kg × {lastSet.reps}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Target:</span>
                  <div className="font-medium">{currentExercise?.target_weight || lastSet.weight}kg × {currentExercise?.target_reps || lastSet.reps}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Completed Sets */}
        {sets
          .filter((set: any) => set.is_completed)
          .map((set: any, index: number) => (
            <Card key={set.id} className="mb-3 border-green-500/30 bg-green-500/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Set</span>
                      <Badge variant="secondary" className="h-6 w-6 rounded-full p-0 flex items-center justify-center">
                        {set.set_index}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-orange-400">📦</span>
                      <span className="font-medium">{set.weight}kg × {set.reps} reps</span>
                      <span className="text-lg">{set.feel === '--' ? '😵' : set.feel === '-' ? '😣' : set.feel === '=' ? '🙂' : set.feel === '+' ? '😄' : '😎'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="p-1 h-6 w-6">
                      <Edit3 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

        {/* Current Set */}
        <Card className="mb-4 border-green-500/50 bg-green-500/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Set</span>
                <Badge className="h-8 w-8 rounded-full p-0 flex items-center justify-center bg-green-500 text-white">
                  {currentSetNumber}
                </Badge>
              </div>
              <span className="font-medium">Current Set</span>
            </div>

            {/* Fix 7: Per-side toggle visibility based on load_mode and equipment */}
            {(currentExercise?.exercise?.load_mode !== 'bodyweight_plus_optional' && 
              (currentExercise?.exercise?.equipment?.equipment_type === 'barbell' || 
               currentExercise?.exercise?.equipment?.equipment_type === 'dumbbell')) && (
              <div className="mb-4">
                <PerSideToggle
                  mode={currentSetData.perSideMode ? 'per_side' : 'total'}
                  onModeChange={handlePerSideModeChange}
                  equipmentType={currentExercise?.exercise?.equipment?.equipment_type}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Weight Input */}
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <span>Weight (kg)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="p-2 h-8 w-8"
                    onClick={() => handleWeightChange(-2.5)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <Input
                    type="number"
                    value={currentSetData.weight}
                    onChange={(e) => setCurrentSetData(prev => ({ ...prev, weight: Number(e.target.value) }))}
                    className="text-center h-8"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="p-2 h-8 w-8"
                    onClick={() => handleWeightChange(2.5)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Reps Input */}
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <span>Reps</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="p-2 h-8 w-8"
                    onClick={() => handleRepsChange(-1)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <Input
                    type="number"
                    value={currentSetData.reps}
                    onChange={(e) => setCurrentSetData(prev => ({ ...prev, reps: Number(e.target.value) }))}
                    className="text-center h-8"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="p-2 h-8 w-8"
                    onClick={() => handleRepsChange(1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Feel chips */}
            <div className="mb-4">
              <div className="text-sm text-muted-foreground mb-2">How did it feel?</div>
              <div className="flex items-center gap-2">
                {['--', '-', '=', '+', '++'].map((feel) => (
                  <Button
                    key={feel}
                    variant={currentSetData.feel === feel ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleFeelSelect(feel)}
                    className="px-3"
                  >
                    {feel}
                  </Button>
                ))}
              </div>
            </div>

            {/* Log Set Button */}
            <Button 
              onClick={handleLogSet} 
              className="w-full"
            >
              Log Set
            </Button>
          </CardContent>
        </Card>

        {/* Fix 8: Debug footer with version tag */}
        <div className="mt-6 space-y-2">
          <div className="text-center">
            <Badge variant="outline" className="text-xs">
              {WORKOUT_FLOW_VERSION}
            </Badge>
          </div>
          
          <Card className="border-blue-500/30 bg-blue-500/5">
            <CardContent className="p-4">
              <div className="text-sm space-y-2">
                <div className="font-medium text-blue-700 dark:text-blue-300">Debug Panel</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>templateId: {debugInfo.templateId || 'null'}</div>
                  <div>workoutId: {debugInfo.workoutId || 'null'}</div>
                  <div>exerciseId: {debugInfo.exerciseId || 'null'}</div>
                  <div>exerciseTitle: {debugInfo.exerciseTitle}</div>
                  <div>effort_mode: {debugInfo.effort_mode || 'null'}</div>
                  <div>load_mode: {debugInfo.load_mode || 'null'}</div>
                  <div>hasWarmup: {debugInfo.hasWarmup.toString()}</div>
                  <div>shouldShowReadiness: {debugInfo.shouldShowReadiness.toString()}</div>
                </div>
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs">Full Debug JSON</summary>
                  <pre className="text-xs bg-background p-2 rounded overflow-auto max-h-40 mt-2">
                    {JSON.stringify(debugInfo, null, 2)}
                  </pre>
                </details>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}