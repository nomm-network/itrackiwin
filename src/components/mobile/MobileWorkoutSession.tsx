import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Target,
  Clock
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
              className="w-full h-full p-4"
              style={{ width: `${100 / exercises.length}%` }}
            >
              <div className="h-full flex flex-col space-y-4">
                {/* Exercise Title Row */}
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">{exercise.name}</h2>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                      ✋
                    </div>
                    <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                      🥇
                    </div>
                    <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                      🏃
                    </div>
                    <Badge variant="secondary" className="text-sm">
                      {completedSets.length}/{targetSets} sets
                    </Badge>
                  </div>
                </div>

                {/* Completed Sets */}
                {completedSets.map((set, setIndex) => (
                  <div key={setIndex} className="bg-muted/30 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium">{set.set_index || setIndex + 1}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">📦</span>
                          <span className="font-medium">{set.weight}kg × {set.reps} reps</span>
                          <span className="text-lg">🙂</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          ✏️
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          ⌄
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Current Set Entry */}
                {!isExerciseComplete && index === currentExerciseIndex && (
                  <div className="bg-green-100 dark:bg-green-900/20 rounded-xl p-4 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-white">{nextSetIndex}</span>
                      </div>
                      <span className="font-medium">Current Set</span>
                    </div>

                    {/* Previous/Target Display */}
                    <div className="bg-black/20 rounded-xl p-3 flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <span>📦</span>
                          <span>Prev <strong>40kg × 8</strong> 🙂</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span>🎯</span>
                          <span>Target <strong>40kg × 10</strong></span>
                        </div>
                      </div>
                      <div className="bg-black/30 rounded-xl px-4 py-3 flex items-center gap-2">
                        <Clock className="w-6 h-6 text-green-500" />
                        <span className="text-2xl font-mono font-bold text-green-500">0:24</span>
                      </div>
                    </div>

                    {/* Per-side/Total Toggle */}
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">Weight entry:</span>
                      <div className="flex bg-muted rounded-lg p-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-xs px-3 h-7"
                        >
                          Per-side
                        </Button>
                        <Button
                          type="button"
                          variant="default"
                          size="sm"
                          className="text-xs px-3 h-7 bg-green-500 hover:bg-green-600 text-white"
                        >
                          Total
                        </Button>
                      </div>
                    </div>

                    {/* Weight and Reps Inputs */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">
                          Total Weight (kg)
                        </Label>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="lg"
                            className="h-12 w-12 p-0 text-lg rounded-xl"
                          >
                            —
                          </Button>
                          <Input
                            type="number"
                            value={newSetData.weightKg || 40}
                            onChange={(e) => setNewSetData(prev => ({ 
                              ...prev, 
                              weightKg: e.target.value === '' ? 0 : Number(e.target.value) 
                            }))}
                            className="flex-1 h-12 text-center text-lg rounded-xl border-2"
                          />
                          <Button
                            variant="outline"
                            size="lg"
                            className="h-12 w-12 p-0 text-lg rounded-xl"
                          >
                            +
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">
                          Reps
                        </Label>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="lg"
                            className="h-12 w-12 p-0 text-lg rounded-xl"
                          >
                            —
                          </Button>
                          <Input
                            type="number"
                            value={newSetData.reps || 10}
                            onChange={(e) => setNewSetData(prev => ({ 
                              ...prev, 
                              reps: e.target.value === '' ? 0 : Number(e.target.value) 
                            }))}
                            className="flex-1 h-12 text-center text-lg rounded-xl border-2"
                          />
                          <Button
                            variant="outline"
                            size="lg"
                            className="h-12 w-12 p-0 text-lg rounded-xl"
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* How did that feel */}
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-3">How did that feel?</h3>
                      <div className="grid grid-cols-5 gap-2">
                        <Button variant="outline" size="lg" className="h-16 flex-col gap-1 rounded-xl">
                          <span className="text-xl">😣</span>
                          <span className="text-xs">Terrible</span>
                        </Button>
                        <Button variant="outline" size="lg" className="h-16 flex-col gap-1 rounded-xl">
                          <span className="text-xl">😞</span>
                          <span className="text-xs">Bad</span>
                        </Button>
                        <Button variant="default" size="lg" className="h-16 flex-col gap-1 rounded-xl bg-green-500 hover:bg-green-600 text-white">
                          <span className="text-xl">🙂</span>
                          <span className="text-xs">Okay</span>
                        </Button>
                        <Button variant="outline" size="lg" className="h-16 flex-col gap-1 rounded-xl">
                          <span className="text-xl">😃</span>
                          <span className="text-xs">Good</span>
                        </Button>
                        <Button variant="outline" size="lg" className="h-16 flex-col gap-1 rounded-xl">
                          <span className="text-xl">😎</span>
                          <span className="text-xs">Amazing</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky footer with large actions */}
      <div className="p-4 border-t bg-card">
        <Button
          onClick={handleAddSet}
          disabled={(!newSetData.weightKg && !newSetData.perSideKg) || !newSetData.reps || isExerciseComplete}
          size="lg"
          className="w-full h-14 text-lg bg-green-500 hover:bg-green-600 text-white rounded-xl"
        >
          Log Set {nextSetIndex}
        </Button>
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