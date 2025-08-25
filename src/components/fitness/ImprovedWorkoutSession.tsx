import React, { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Plus, Minus, Hand } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SetData {
  weight: number;
  reps: number;
  rpe?: number;
  feel?: string;
  pain?: boolean;
  notes?: string;
  is_completed: boolean;
}

interface ExerciseData {
  id: string;
  workout_exercise_id: string;
  name: string;
  target_sets: number;
  completed_sets: SetData[];
}

interface ImprovedWorkoutSessionProps {
  exercise: ExerciseData;
  onSetComplete: (setData: SetData) => void;
  onExerciseComplete: () => void;
  unit: 'kg' | 'lb';
}

export default function ImprovedWorkoutSession({
  exercise,
  onSetComplete,
  onExerciseComplete,
  unit = 'kg'
}: ImprovedWorkoutSessionProps) {
  const [expandedSet, setExpandedSet] = useState<number | null>(null);
  const [currentSetData, setCurrentSetData] = useState<SetData>({
    weight: 0,
    reps: 0,
    rpe: undefined,
    feel: '',
    pain: false,
    notes: '',
    is_completed: false
  });

  const currentSetNumber = exercise.completed_sets.length + 1;
  const isLastSet = currentSetNumber > exercise.target_sets;
  const lastSet = exercise.completed_sets[exercise.completed_sets.length - 1];

  // Auto-fill from previous set
  const handleUsePrevious = useCallback(() => {
    if (lastSet) {
      setCurrentSetData(prev => ({
        ...prev,
        weight: lastSet.weight,
        reps: lastSet.reps
      }));
    }
  }, [lastSet]);

  // Quick weight adjustments
  const adjustWeight = useCallback((delta: number) => {
    setCurrentSetData(prev => ({
      ...prev,
      weight: Math.max(0, prev.weight + delta)
    }));
  }, []);

  // Quick rep adjustments
  const adjustReps = useCallback((delta: number) => {
    setCurrentSetData(prev => ({
      ...prev,
      reps: Math.max(0, prev.reps + delta)
    }));
  }, []);

  // Auto-advance to next set when current set is completed
  const handleSetSubmit = useCallback(() => {
    if (currentSetData.weight > 0 && currentSetData.reps > 0) {
      const completedSet = { ...currentSetData, is_completed: true };
      onSetComplete(completedSet);
      
      // Reset form for next set but keep feel/pain cleared
      setCurrentSetData({
        weight: 0,
        reps: 0,
        rpe: undefined,
        feel: '',
        pain: false,
        notes: '',
        is_completed: false
      });
      
      // Auto-expand the just-completed set briefly
      const setIndex = exercise.completed_sets.length;
      setExpandedSet(setIndex);
      setTimeout(() => setExpandedSet(null), 2000);
    }
  }, [currentSetData, onSetComplete, exercise.completed_sets.length]);

  // Handle Enter key for quick submission
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentSetData.weight > 0 && currentSetData.reps > 0) {
      handleSetSubmit();
    }
  }, [handleSetSubmit, currentSetData]);

  const toggleSetExpansion = (setIndex: number) => {
    setExpandedSet(expandedSet === setIndex ? null : setIndex);
  };

  return (
    <div className="space-y-3">
      {/* Exercise Header with Grips Icon */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-foreground">{exercise.name}</h3>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Hand className="h-4 w-4" />
          </Button>
        </div>
        <Badge variant="secondary">
          {exercise.completed_sets.length}/{exercise.target_sets} sets
        </Badge>
      </div>

      {/* Completed Sets - Collapsed by default */}
      {exercise.completed_sets.map((set, index) => (
        <Card key={index} className="p-3">
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleSetExpansion(index)}
          >
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                {index + 1}
              </Badge>
              <span className="font-medium">
                {set.weight}{unit} × {set.reps} reps
              </span>
              {set.rpe && (
                <Badge variant="secondary" className="text-xs">
                  RPE {set.rpe}
                </Badge>
              )}
            </div>
            {expandedSet === index ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
          
          {expandedSet === index && (
            <div className="mt-3 pt-3 border-t space-y-2 text-sm text-muted-foreground">
              {set.rpe && <div>RPE: {set.rpe}</div>}
              {set.notes && <div>Notes: {set.notes}</div>}
            </div>
          )}
        </Card>
      ))}

      {/* Current Set Entry */}
      {!isLastSet && (
        <Card className="p-4 border-primary/20 bg-primary/5">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge className="w-8 h-8 rounded-full flex items-center justify-center">
                {currentSetNumber}
              </Badge>
              <span className="font-medium">Current Set</span>
              {lastSet && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleUsePrevious}
                  className="text-xs"
                >
                  Use Previous ({lastSet.weight}{unit} × {lastSet.reps})
                </Button>
              )}
            </div>

            {/* Weight Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Weight ({unit})</label>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => adjustWeight(-2.5)}
                  className="w-8 h-8 p-0"
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <Input
                  type="number"
                  value={currentSetData.weight || ''}
                  onChange={(e) => setCurrentSetData(prev => ({ ...prev, weight: Number(e.target.value) }))}
                  onKeyPress={handleKeyPress}
                  className="text-center text-lg font-semibold"
                  placeholder="0"
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => adjustWeight(2.5)}
                  className="w-8 h-8 p-0"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Reps Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Reps</label>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => adjustReps(-1)}
                  className="w-8 h-8 p-0"
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <Input
                  type="number"
                  value={currentSetData.reps || ''}
                  onChange={(e) => setCurrentSetData(prev => ({ ...prev, reps: Number(e.target.value) }))}
                  onKeyPress={handleKeyPress}
                  className="text-center text-lg font-semibold"
                  placeholder="0"
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => adjustReps(1)}
                  className="w-8 h-8 p-0"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* RPE Input (Optional) */}
            <div className="space-y-2">
              <label className="text-sm font-medium">RPE (Optional)</label>
              <Input
                type="number"
                min="1"
                max="10"
                value={currentSetData.rpe || ''}
                onChange={(e) => setCurrentSetData(prev => ({ ...prev, rpe: e.target.value ? Number(e.target.value) : undefined }))}
                onKeyPress={handleKeyPress}
                className="text-center"
                placeholder="1-10"
              />
            </div>

            {/* Feel Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium">How did that feel?</label>
              <div className="grid grid-cols-5 gap-2">
                {[
                  { feel: 'terrible', emoji: '😣' },
                  { feel: 'bad', emoji: '😐' },
                  { feel: 'okay', emoji: '😊' },
                  { feel: 'good', emoji: '😎' },
                  { feel: 'amazing', emoji: '🔥' }
                ].map(({ feel, emoji }) => (
                  <Button
                    key={feel}
                    variant={currentSetData.feel === feel ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentSetData(prev => ({ ...prev, feel }))}
                    className="aspect-square text-lg"
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            </div>

            {/* Pain Toggle */}
            <Button
              variant={currentSetData.pain ? "destructive" : "outline"}
              onClick={() => setCurrentSetData(prev => ({ ...prev, pain: !prev.pain }))}
              className="w-full"
              size="sm"
            >
              {currentSetData.pain ? '⚠️ Pain reported' : 'No pain'}
            </Button>

            {/* Submit Button */}
            <Button 
              onClick={handleSetSubmit}
              disabled={!currentSetData.weight || !currentSetData.reps}
              className="w-full"
              size="lg"
            >
              Log Set {currentSetNumber}
            </Button>
          </div>
        </Card>
      )}

      {/* Exercise Complete */}
      {isLastSet && (
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="text-center space-y-3">
            <div className="text-lg font-semibold text-green-800">
              Exercise Complete! 🎉
            </div>
            <div className="text-sm text-green-600">
              {exercise.completed_sets.length} sets completed
            </div>
            <Button onClick={onExerciseComplete} className="w-full" size="lg">
              Next Exercise
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}