import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  ArrowRight,
  Timer,
  Target
} from 'lucide-react';
import { SetFeelSelector } from '@/features/health/fitness/components/SetFeelSelector';
import { EnhancedSetEditor } from '@/components/workout/EnhancedSetEditor';
import { EffectiveLoadDisplay } from '@/components/workout/EffectiveLoadDisplay';
import { PersistentRestTimer } from './PersistentRestTimer';

interface SetData {
  id?: string;
  weight?: number;
  reps?: number;
  rpe?: number;
  feel?: string;
  set_index?: number;
  is_completed?: boolean;
  rest_seconds?: number;
  total_weight_kg?: number;
  load_meta?: {
    logged_bodyweight_kg?: number;
    [key: string]: any;
  };
}

interface ExerciseData {
  id: string;
  name: string;
  order_index: number;
  sets?: SetData[];
  target_sets?: number;
  notes?: string;
  load_type?: string;
  equipment_ref?: string;
  load_mode?: string;
  attribute_values_json?: {
    bodyweight_involvement_pct?: number;
    [key: string]: any;
  };
}

interface MobileWorkoutSessionProps {
  exercises: ExerciseData[];
  onSetComplete: (exerciseId: string, setData: SetData) => void;
  onWorkoutComplete: () => void;
  className?: string;
}

export const MobileWorkoutSession: React.FC<MobileWorkoutSessionProps> = ({
  exercises,
  onSetComplete,
  onWorkoutComplete,
  className
}) => {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isRestTimerActive, setIsRestTimerActive] = useState(false);
  const [restTimerSeconds, setRestTimerSeconds] = useState(180);
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [longPressedSetId, setLongPressedSetId] = useState<string | null>(null);
  const [newSetData, setNewSetData] = useState<{
    weightKg?: number;
    perSideKg?: number;
    reps?: number;
    entryMode?: 'total' | 'per_side';
  }>({});
  
  const containerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const currentXRef = useRef(0);
  const longPressTimerRef = useRef<NodeJS.Timeout>();

  const currentExercise = exercises[currentExerciseIndex];
  const completedSets = currentExercise?.sets || [];
  const targetSets = currentExercise?.target_sets || 3;
  // Calculate next set index properly: find max existing set_index and add 1
  const nextSetIndex = completedSets.length > 0 
    ? Math.max(...completedSets.map(s => s.set_index || 0)) + 1 
    : 1;
  const isExerciseComplete = completedSets.length >= targetSets;
  
  const lastSet = completedSets[completedSets.length - 1];

  // Touch/swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (exercises.length <= 1) return;
    
    setIsDragging(true);
    startXRef.current = e.touches[0].clientX;
    currentXRef.current = translateX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || exercises.length <= 1) return;
    
    const deltaX = e.touches[0].clientX - startXRef.current;
    const newTranslateX = currentXRef.current + deltaX;
    
    // Limit swipe range
    const maxTranslate = 100;
    const clampedTranslate = Math.max(-maxTranslate, Math.min(maxTranslate, newTranslateX));
    setTranslateX(clampedTranslate);
  };

  const handleTouchEnd = () => {
    if (!isDragging || exercises.length <= 1) return;
    
    setIsDragging(false);
    
    const threshold = 50;
    if (translateX > threshold && currentExerciseIndex > 0) {
      // Swipe right - previous exercise
      setCurrentExerciseIndex(prev => prev - 1);
    } else if (translateX < -threshold && currentExerciseIndex < exercises.length - 1) {
      // Swipe left - next exercise
      setCurrentExerciseIndex(prev => prev + 1);
    }
    
    setTranslateX(0);
  };

  // Long press handlers for set rows
  const handleSetMouseDown = (setId: string) => {
    longPressTimerRef.current = setTimeout(() => {
      setLongPressedSetId(setId);
    }, 500);
  };

  const handleSetMouseUp = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
  };

  const handleAddSet = () => {
    console.log('🔍 MobileWorkoutSession handleAddSet called with:', {
      newSetData,
      currentExercise: currentExercise?.id,
      nextSetIndex,
      lastSet
    });
    
    const finalWeight = newSetData.entryMode === 'per_side' && newSetData.perSideKg 
      ? (currentExercise.equipment_ref === 'barbell_standard' ? 20 : 0) + newSetData.perSideKg * 2
      : newSetData.weightKg;
      
    if (!finalWeight || !newSetData.reps) {
      console.log('🔍 Validation failed:', { finalWeight, reps: newSetData.reps });
      return;
    }

    const setData: SetData = {
      weight: finalWeight,
      reps: newSetData.reps,
      set_index: nextSetIndex,
      is_completed: true,
      rest_seconds: lastSet?.rest_seconds || 180
    };

    console.log('🔍 About to call onSetComplete with:', {
      exerciseId: currentExercise.id,
      setData
    });

    try {
      onSetComplete(currentExercise.id, setData);
      
      // Start rest timer
      setRestTimerSeconds(setData.rest_seconds || 180);
      setIsRestTimerActive(true);
      
      // Clear inputs
      setNewSetData({});
      
      console.log('✅ MobileWorkoutSession handleAddSet completed successfully');
    } catch (error) {
      console.error('❌ MobileWorkoutSession handleAddSet error:', error);
    }
  };

  const handleNextExercise = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
    } else {
      onWorkoutComplete();
    }
  };

  const calculateProgress = () => {
    const totalSets = exercises.reduce((sum, ex) => sum + (ex.target_sets || 3), 0);
    const completedSetsCount = exercises.reduce((sum, ex) => sum + (ex.sets?.length || 0), 0);
    return totalSets > 0 ? (completedSetsCount / totalSets) * 100 : 0;
  };

  return (
    <div className={cn("h-screen flex flex-col bg-background", className)}>
      {/* Header with progress */}
      <div className="p-4 border-b bg-card">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentExerciseIndex(prev => Math.max(0, prev - 1))}
              disabled={currentExerciseIndex === 0}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">
              {currentExerciseIndex + 1} of {exercises.length}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentExerciseIndex(prev => Math.min(exercises.length - 1, prev + 1))}
              disabled={currentExerciseIndex === exercises.length - 1}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Badge variant="outline">
            {Math.round(calculateProgress())}% Complete
          </Badge>
        </div>
        <Progress value={calculateProgress()} className="h-2" />
      </div>

      {/* Card stack container */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-hidden relative"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className="flex h-full transition-transform duration-200 ease-out"
          style={{ 
            transform: `translateX(${translateX}px)`,
            width: `${exercises.length * 100}%`
          }}
        >
          {exercises.map((exercise, index) => (
            <div 
              key={exercise.id}
              className="w-full h-full p-2"
              style={{ width: `${100 / exercises.length}%` }}
            >
              <Card className="h-full flex flex-col">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{exercise.name}</CardTitle>
                    {isExerciseComplete && index === currentExerciseIndex && (
                      <Badge variant="default" className="bg-green-500">
                        Complete
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {completedSets.length}/{targetSets} sets
                    </Badge>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>

                <CardContent className="flex-1 overflow-y-auto space-y-3">
                  {/* Completed sets */}
                  {completedSets.map((set, setIndex) => (
                    <Popover key={setIndex}>
                      <PopoverTrigger asChild>
                        <div
                          className="flex items-center justify-between p-2.5 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50"
                          onMouseDown={() => handleSetMouseDown(set.id || `${exercise.id}-${setIndex}`)}
                          onMouseUp={handleSetMouseUp}
                          onTouchStart={() => handleSetMouseDown(set.id || `${exercise.id}-${setIndex}`)}
                          onTouchEnd={handleSetMouseUp}
                        >
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="text-xs">
                              Set {set.set_index}
                            </Badge>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {set.weight}kg × {set.reps} reps
                              </span>
                              <EffectiveLoadDisplay 
                                totalWeight={set.total_weight_kg}
                                weight={set.weight}
                                loadMode={exercise.load_mode}
                                bodyweightPct={exercise.attribute_values_json?.bodyweight_involvement_pct}
                                loggedBodyweight={set.load_meta?.logged_bodyweight_kg}
                                className="text-xs text-muted-foreground"
                              />
                            </div>
                            {set.rpe && (
                              <Badge variant="secondary" className="text-xs">
                                RPE {set.rpe}
                              </Badge>
                            )}
                          </div>
                          {set.feel && (
                            <Badge variant="outline" className="text-xs">
                              {set.feel}
                            </Badge>
                          )}
                        </div>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 p-0" side="top">
                        <SetFeelSelector
                          setId={set.id || `${exercise.id}-${setIndex}`}
                          currentFeel={set.feel as any}
                          onFeelChange={(feel) => {
                            // Update set feel
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  ))}

                  {/* Next set entry */}
                  {!isExerciseComplete && index === currentExerciseIndex && (
                     <div className="space-y-2.5 p-2.5 border-2 border-dashed border-primary/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Set {nextSetIndex}</Badge>
                        <span className="text-sm text-muted-foreground">Next up</span>
                      </div>
                       
                        <EnhancedSetEditor
                          workoutExerciseId={currentExercise.id} // Use the exercise id directly
                          exercise={{
                            id: currentExercise.id,
                            load_type: currentExercise.load_type,
                            effort_mode: 'reps',
                            load_mode: 'external_added',
                            equipment_ref: currentExercise.equipment_ref,
                            equipment: {
                              slug: currentExercise.equipment_ref,
                              equipment_type: undefined
                            }
                          }}
                          setIndex={nextSetIndex - 1}
                          onLogged={handleAddSet}
                          className="space-y-2"
                        />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky footer with large actions */}
      <div className="p-3.5 border-t bg-card">
        <div className="grid grid-cols-2 gap-2.5">
          <Button
            onClick={handleAddSet}
            disabled={(!newSetData.weightKg && !newSetData.perSideKg) || !newSetData.reps || isExerciseComplete}
            size="lg"
            className="h-14 text-lg touch-target-comfortable"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Set
          </Button>
          <Button
            onClick={handleNextExercise}
            variant={isExerciseComplete ? "default" : "outline"}
            size="lg"
            className="h-14 text-lg touch-target-comfortable"
          >
            <ArrowRight className="h-5 w-5 mr-2" />
            {currentExerciseIndex === exercises.length - 1 ? 'Finish' : 'Next'}
          </Button>
        </div>
      </div>

      {/* Persistent bottom rest timer overlay */}
      {isRestTimerActive && (
        <div className="fixed bottom-20 left-4 right-4 z-50">
          <PersistentRestTimer
            suggestedSeconds={restTimerSeconds}
            onComplete={() => setIsRestTimerActive(false)}
            onSkip={() => setIsRestTimerActive(false)}
            isActive={true}
            className="shadow-xl border-2 border-primary/20"
          />
        </div>
      )}
    </div>
  );
};