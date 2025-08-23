import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Plus, Copy, TrendingUp, Activity, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { usePRDetection } from '@/hooks/usePRDetection';

interface SetData {
  weight?: number;
  reps?: number;
  rpe?: number;
  notes?: string;
}

interface QuickSetEntryProps {
  unit: string;
  lastSet?: SetData;
  targetSet?: SetData;
  onSetComplete: (setData: SetData) => void;
  onRestTimerStart: (duration: number) => void;
  isLoading?: boolean;
  workoutExerciseId?: string;
  exercise?: { id: string; name: string };
  workoutId?: string;
}

export const QuickSetEntry: React.FC<QuickSetEntryProps> = ({
  unit,
  lastSet,
  targetSet,
  onSetComplete,
  onRestTimerStart,
  isLoading = false,
  workoutExerciseId,
  exercise,
  workoutId
}) => {
  const { checkForPRs } = usePRDetection();
  const [weight, setWeight] = useState<string>('');
  const [reps, setReps] = useState<string>('');
  const [rpe, setRpe] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const handleQuickAction = (action: 'same' | 'weight_plus_2_5' | 'reps_plus_1' | 'target') => {
    const baseData = action === 'target' ? targetSet : lastSet;
    if (!baseData) return;

    let newWeight = baseData.weight || 0;
    let newReps = baseData.reps || 0;

    switch (action) {
      case 'weight_plus_2_5':
        newWeight += 2.5;
        break;
      case 'reps_plus_1':
        newReps += 1;
        break;
      case 'target':
        // Use target values as-is
        break;
      case 'same':
      default:
        // Use values as-is
        break;
    }

    setWeight(newWeight.toString());
    setReps(newReps.toString());
    setRpe(baseData.rpe?.toString() || '');
    setNotes(baseData.notes || '');

    toast.success(`Applied ${action.replace('_', ' ')}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!weight || !reps) {
      toast.error('Please enter both weight and reps');
      return;
    }

    const setData: SetData = {
      weight: parseFloat(weight),
      reps: parseInt(reps),
      rpe: rpe ? parseFloat(rpe) : undefined,
      notes: notes || undefined
    };

    onSetComplete(setData);
    
    // Check for PRs after set completion
    if (workoutExerciseId && exercise && setData.weight && setData.reps) {
      await checkForPRs(
        {
          workout_exercise_id: workoutExerciseId,
          weight: setData.weight,
          reps: setData.reps,
          weight_unit: unit
        },
        exercise,
        workoutId
      );
    }
    
    // Auto-start rest timer based on RPE/effort
    const suggestedRest = calculateRestTime(setData.rpe);
    onRestTimerStart(suggestedRest);
    
    // Clear form
    setWeight('');
    setReps('');
    setRpe('');
    setNotes('');
    
    toast.success(`Set logged: ${setData.weight}${unit} × ${setData.reps} reps`);
  };

  const calculateRestTime = (rpe?: number): number => {
    if (!rpe) return 180; // Default 3 minutes
    
    // Rest based on RPE: higher RPE = more rest needed
    if (rpe >= 9) return 300; // 5 minutes for RPE 9-10
    if (rpe >= 8) return 240; // 4 minutes for RPE 8-9
    if (rpe >= 7) return 180; // 3 minutes for RPE 7-8
    if (rpe >= 6) return 120; // 2 minutes for RPE 6-7
    return 90; // 1.5 minutes for RPE < 6
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4 space-y-4">
        {/* Quick Action Buttons */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Quick Actions</h4>
          <div className="flex flex-wrap gap-2">
            {lastSet && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction('same')}
                  className="flex items-center gap-1 text-xs h-8"
                >
                  <Copy className="h-3 w-3" />
                  Same as Last
                  <Badge variant="secondary" className="text-xs ml-1">
                    {lastSet.weight}{unit} × {lastSet.reps}
                  </Badge>
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction('weight_plus_2_5')}
                  className="flex items-center gap-1 text-xs h-8"
                >
                  <TrendingUp className="h-3 w-3" />
                  +2.5{unit}
                  <Badge variant="secondary" className="text-xs ml-1">
                    {(lastSet.weight || 0) + 2.5}{unit}
                  </Badge>
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction('reps_plus_1')}
                  className="flex items-center gap-1 text-xs h-8"
                >
                  <Plus className="h-3 w-3" />
                  +1 Rep
                  <Badge variant="secondary" className="text-xs ml-1">
                    × {(lastSet.reps || 0) + 1}
                  </Badge>
                </Button>
              </>
            )}
            
            {targetSet && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction('target')}
                className="flex items-center gap-1 text-xs h-8"
              >
                <Activity className="h-3 w-3" />
                Use Target
                <Badge variant="secondary" className="text-xs ml-1">
                  {targetSet.weight}{unit} × {targetSet.reps}
                </Badge>
              </Button>
            )}
          </div>
        </div>

        {/* Manual Entry Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Input
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder={`Weight (${unit})`}
                inputMode="decimal"
                className="text-center font-mono"
              />
            </div>
            <div>
              <Input
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                placeholder="Reps"
                inputMode="numeric"
                className="text-center font-mono"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Input
                value={rpe}
                onChange={(e) => setRpe(e.target.value)}
                placeholder="RPE (1-10)"
                inputMode="decimal"
                className="text-center"
              />
            </div>
            <div>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes"
                className="text-center"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full touch-target"
            disabled={isLoading || !weight || !reps}
            size="lg"
          >
            {isLoading ? (
              'Adding Set...'
            ) : (
              <>
                <Clock className="h-4 w-4 mr-2" />
                Complete Set & Start Rest
              </>
            )}
          </Button>
        </form>

        {/* Last Set Reference */}
        {lastSet && (
          <div className="mt-3 p-2 bg-muted/30 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">Previous Set:</div>
            <div className="text-sm font-medium">
              {lastSet.weight}{unit} × {lastSet.reps} reps
              {lastSet.rpe && ` • RPE ${lastSet.rpe}`}
              {lastSet.notes && ` • ${lastSet.notes}`}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};