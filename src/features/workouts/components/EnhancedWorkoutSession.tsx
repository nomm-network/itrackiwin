import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getEquipmentRefId, getLoadType, getExerciseId } from '@/lib/workouts/equipmentContext';
import SmartSetForm from '@/components/workout/set-forms/SmartSetForm';
import { 
  Play, 
  Pause, 
  CheckCircle, 
  Timer, 
  Target,
  Settings,
  ArrowLeft,
  ArrowRight,
  Zap,
  Plus,
  ChevronDown,
  Hand,
  Hash,
  Flame,
  Clock,
  Trophy,
  Edit3,
  Minus
  } from 'lucide-react';
import { Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ExerciseCard from './ExerciseCard';
import TouchOptimizedSetInput from '@/components/workout/TouchOptimizedSetInput';
import { SetFeelSelector } from '@/features/health/fitness/components/SetFeelSelector';
import { WarmupEditor } from '@/features/health/fitness/components/WarmupEditor';
import { WorkoutRecalibration } from '@/features/health/fitness/components/WorkoutRecalibration';
import { GymConstraintsFilter } from '@/features/health/fitness/components/GymConstraintsFilter';
import { DefaultSetsManager } from './DefaultSetsManager';
import { useMyGym } from '@/features/health/fitness/hooks/useMyGym.hook';
import { useLogSet, useUpdateSet } from '../hooks';
import { useAdvanceProgramState } from '@/hooks/useTrainingPrograms';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useExerciseTranslation } from '@/hooks/useExerciseTranslations';
import { useGrips, getGripIdByName } from '@/hooks/useGrips';
import { sanitizeUuid, isUuid } from '@/utils/ids';
import { WarmupBlock } from '@/components/fitness/WarmupBlock';
import { getExerciseDisplayName } from '../utils/exerciseName';
import { useAdvancedSetLogging } from '../hooks/useAdvancedSetLogging';
import { useUnifiedSetLogging } from '@/hooks/useUnifiedSetLogging';
import { WorkoutDebugFooter } from '@/components/workout/WorkoutDebugFooter';
import { recomputeWarmupPlan } from '../warmup/recalc';
import { submitWarmupFeedback } from '../warmup/feedback';
import { SessionHeaderMeta } from './SessionHeaderMeta';
import { useWarmupSessionState } from '../state/warmupSessionState';
import { useWarmupManager } from '../hooks/useWarmupManager';
import { ExerciseGripMenu } from '@/components/workout/ExerciseGripMenu';
import { ExerciseWarmupMenu } from '@/components/workout/ExerciseWarmupMenu';
import { SetSettingsMenu } from '@/components/workout/SetSettingsMenu';

// Add readiness check imports
import EnhancedReadinessCheckIn, { EnhancedReadinessData } from '@/components/fitness/EnhancedReadinessCheckIn';
import { useShouldShowReadiness } from '@/features/health/fitness/hooks/useShouldShowReadiness';
import { usePreWorkoutCheckin } from '@/features/health/fitness/hooks/usePreWorkoutCheckin';
import { useAuth } from '@/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import PageNav from "@/components/PageNav";
import { useExerciseEstimate } from '../hooks/useExerciseEstimate';

// Import readiness scoring utilities
import { computeReadinessScore, getCurrentUserReadinessScore } from '@/lib/readiness';
import { saveTodayReadiness } from '@/lib/api/readiness';
import { useSessionTiming } from '@/stores/sessionTiming';
import { WorkoutFormDebugPanel } from './WorkoutFormDebugPanel';

interface WorkoutSessionProps {
  workout: any;
  source?: string;
}

export default function EnhancedWorkoutSession({ workout, source = "direct" }: WorkoutSessionProps) {
  console.log('🔍 EnhancedWorkoutSession v0.6.0 entry:', { workout: !!workout, source, exerciseCount: workout?.exercises?.length });
  const navigate = useNavigate();
  const { mutate: logSet, isPending: isLogging } = useLogSet();
  const { mutate: updateSet } = useUpdateSet();
  const { gym } = useMyGym();
  const advanceProgramState = useAdvanceProgramState();
  const { data: grips = [] } = useGrips();
  const queryClient = useQueryClient();
  const { toast: toastUtils } = useToast();
  const { logSet: newLogSet, error: setLoggingError, isLoading: setLoggingLoading } = useAdvancedSetLogging();
  const { logSet: unifiedLogSet } = useUnifiedSetLogging();
  
  const { user, loading: authLoading } = useAuth();
  const { startSession } = useSessionTiming();

  const { data: shouldShowReadiness, isLoading: isCheckingReadiness } = useShouldShowReadiness(workout?.id, user?.id);
  const { createCheckin } = usePreWorkoutCheckin(workout?.id);
  
  const { warmupsShown, setWarmupShown } = useWarmupSessionState();
  const { resetSessionContext, logWorkingSet } = useWarmupManager();
  
  const [currentExerciseId, setCurrentExerciseId] = useState<string | null>(() => {
    const key = `workout_${workout?.id}_currentExercise`;
    try {
      const stored = localStorage.getItem(key);
      if (stored && workout?.exercises?.some((ex: any) => ex.id === stored)) {
        return stored;
      }
    } catch {}
    return workout?.exercises?.sort((a: any, b: any) => a.order_index - b.order_index)?.[0]?.id ?? null;
  });
  
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [showWarmupEditor, setShowWarmupEditor] = useState(false);
  const [showRecalibration, setShowRecalibration] = useState(false);
  const [workoutStartTime] = useState(new Date());
  const [warmupCompleted, setWarmupCompleted] = useState(false);
  const [hasExistingWarmupData, setHasExistingWarmupData] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [readinessScore, setReadinessScore] = useState<number | undefined>(() => {
    const key = `workout_${workout?.id}_readiness`;
    try {
      const stored = localStorage.getItem(key);
      return stored ? parseFloat(stored) : undefined;
    } catch {
      return undefined;
    }
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
  const [quickAddMode, setQuickAddMode] = useState(false);
  
  // Current set input state
  const [currentSetData, setCurrentSetData] = useState({
    weight: 20,
    reps: 10,
    feel: '='
  });
  
  // Rest timer state
  const [restStartTime, setRestStartTime] = useState<Date | null>(null);
  const [restDuration, setRestDuration] = useState(0);

  const currentExercise = useMemo(() => {
    const sortedExercises = workout?.exercises?.sort((a: any, b: any) => a.order_index - b.order_index) || [];
    return sortedExercises.find((x: any) => x.id === currentExerciseId) ?? sortedExercises[0];
  }, [workout?.exercises, currentExerciseId]);

  const currentExerciseEstimateId = currentExercise?.exercise_id || currentExercise?.exercise?.id;
  const { data: currentExerciseEstimate } = useExerciseEstimate(currentExerciseEstimateId, 'rm10');

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

  // Get exercise name
  const getExerciseName = () => {
    return currentExercise?.exercise?.name || currentExercise?.name || 'Exercise';
  };

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle feel selection
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
    // Logic to log the set
    console.log('Logging set:', currentSetData);
    // Start rest timer for next set
    setRestStartTime(new Date());
  };

  // Menu handlers
  const handleGripMenuOpen = () => setShowGripSelector(true);
  const handleWarmupMenuOpen = () => setShowWarmupMenu(true);
  const handleSetSettingsOpen = () => setShowSetSettings(true);

  if (authLoading || isCheckingReadiness) {
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
      <div className="container mx-auto p-4 max-w-md">
        <EnhancedReadinessCheckIn
          workoutId={workout?.id}
          onSubmit={async (data: EnhancedReadinessData) => {
            // Map ReadinessData to ReadinessInput format
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
            setReadinessScore(score);
            localStorage.setItem(`workout_${workout?.id}_readiness`, score.toString());
            
            try {
              await createCheckin.mutateAsync({ 
                answers: data.readiness, 
                readiness_score: score 
              });
              
              // Force immediate update to bypass readiness check
              queryClient.setQueryData(['should-show-readiness', workout?.id, user?.id], false);
              queryClient.invalidateQueries({ queryKey: ['should-show-readiness'] });
            } catch (error) {
              console.error('Failed to create checkin:', error);
              // Even if checkin fails, allow workout to proceed
              queryClient.setQueryData(['should-show-readiness', workout?.id, user?.id], false);
            }
          }}
        />
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h1 className="text-xl font-semibold">{workout?.name || 'test'}</h1>
        <div className="flex items-center gap-2">
          {/* Readiness Badge */}
          <Badge variant="secondary" className="bg-orange-500/20 text-orange-400 border-orange-500/30">
            {readinessScore ? Math.round(readinessScore) : '69'}
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
            
            <Button
              variant="ghost"
              size="sm"
              className="p-2 h-8 w-8"
              onClick={handleWarmupMenuOpen}
            >
              <Flame className="h-4 w-4" />
            </Button>
            
            <Badge variant="secondary" className="bg-slate-700 text-white">
              {completedSetsCount}/{totalSets} sets
            </Badge>
          </div>
        </div>

        {/* Warmup Section - shown at the beginning */}
        {currentSetNumber === 1 && (
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="text-center">
                <h3 className="font-semibold mb-2">Warmup</h3>
                <p className="text-muted-foreground text-sm">Complete your warmup before starting the first set</p>
                <Button variant="outline" className="mt-2" onClick={handleWarmupMenuOpen}>
                  Start Warmup
                </Button>
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
                    <Button variant="ghost" size="sm" className="p-1 h-6 w-6">
                      <ChevronDown className="h-3 w-3" />
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

            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Previous/Target */}
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <span className="text-orange-400">📦</span>
                  {lastSet ? `${lastSet.weight}kg × ${lastSet.reps}` : 'No previous data'}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Target className="h-3 w-3 text-red-500" />
                  <span>Target {currentSetData.weight}kg × {currentSetData.reps}</span>
                </div>
              </div>

              {/* Timer - only show from set 2 */}
              {currentSetNumber >= 2 && (
                <div className="flex items-center justify-center">
                  <div className="bg-slate-800 rounded-lg px-3 py-2">
                    <div className="text-green-400 text-xl font-mono">
                      {formatTime(restDuration)}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Per-side/Total Toggle */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="text-sm text-muted-foreground">Per-side</span>
              <Switch defaultChecked />
              <span className="text-sm font-medium">Total</span>
            </div>

            {/* Weight and Reps Controls */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              {/* Weight */}
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Total Weight (kg)</label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-12 w-12 rounded-lg"
                    onClick={() => handleWeightChange(-2.5)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <div className="flex-1 text-center">
                    <div className="bg-background rounded-lg border p-3 text-xl font-mono">
                      {currentSetData.weight}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-12 w-12 rounded-lg"
                    onClick={() => handleWeightChange(2.5)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Reps */}
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Reps</label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-12 w-12 rounded-lg"
                    onClick={() => handleRepsChange(-1)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <div className="flex-1 text-center">
                    <div className="bg-background rounded-lg border p-3 text-xl font-mono">
                      {currentSetData.reps}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-12 w-12 rounded-lg"
                    onClick={() => handleRepsChange(1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Feel Selector */}
            <div className="mb-4">
              <label className="text-sm text-muted-foreground mb-3 block">How did that feel?</label>
              <div className="grid grid-cols-5 gap-2">
                {[
                  { value: '--', emoji: '😵' },
                  { value: '-', emoji: '😣' },
                  { value: '=', emoji: '🙂' },
                  { value: '+', emoji: '😄' },
                  { value: '++', emoji: '😎' }
                ].map((feel) => (
                  <Button
                    key={feel.value}
                    variant={currentSetData.feel === feel.value ? "default" : "outline"}
                    className={`h-12 text-2xl ${
                      currentSetData.feel === feel.value 
                        ? 'bg-green-500 hover:bg-green-600' 
                        : 'bg-background hover:bg-muted'
                    }`}
                    onClick={() => handleFeelSelect(feel.value)}
                  >
                    {feel.emoji}
                  </Button>
                ))}
              </div>
            </div>

            {/* Log Set Button */}
            <Button 
              onClick={handleLogSet}
              className="w-full h-12 text-lg font-semibold bg-green-500 hover:bg-green-600"
            >
              Log Set
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Grip Selector Modal */}
      <Dialog open={showGripSelector} onOpenChange={setShowGripSelector}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Grip</DialogTitle>
          </DialogHeader>
          <ExerciseGripMenu
            selectedGrip={selectedGrips[currentExercise?.id]?.[0]}
            onGripChange={(grip) => {
              if (grip) {
                setSelectedGrips(prev => ({
                  ...prev,
                  [currentExercise?.id]: [grip]
                }));
              }
              setShowGripSelector(false);
            }}
            isOpen={true}
            onClose={() => setShowGripSelector(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Warmup Menu Modal */}
      <Dialog open={showWarmupMenu} onOpenChange={setShowWarmupMenu}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Warmup</DialogTitle>
          </DialogHeader>
          <ExerciseWarmupMenu
            targetWeight={currentSetData.weight}
            onStepComplete={(step) => console.log('Warmup step completed:', step)}
            isOpen={true}
            onClose={() => setShowWarmupMenu(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Set Settings Modal */}
      <Dialog open={showSetSettings} onOpenChange={setShowSetSettings}>
        <DialogContent>
          <SetSettingsMenu
            targetSets={targetSets}
            onTargetSetsChange={setTargetSets}
            autoRestTimer={autoRestTimer}
            showTargets={showTargets}
            quickAddMode={quickAddMode}
            onAutoRestTimerChange={setAutoRestTimer}
            onShowTargetsChange={setShowTargets}
            onQuickAddModeChange={setQuickAddMode}
            isOpen={true}
            onClose={() => setShowSetSettings(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
