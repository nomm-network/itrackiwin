import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Timer } from 'lucide-react';

interface WorkoutSet {
  id?: string;
  set_index: number;
  target_weight_kg?: number;
  target_reps?: number;
  weight_kg?: number;
  reps?: number;
  is_completed?: boolean;
  set_kind?: 'warmup' | 'normal' | 'top_set' | 'backoff' | 'amrap' | 'drop' | 'distance' | 'timed' | 'cooldown';
  rest_seconds?: number;
  prev_weight_kg?: number;
  prev_reps?: number;
}

interface Props {
  set: WorkoutSet;
  isTarget?: boolean;
  onComplete?: (setData: { weight_kg: number; reps: number }) => void;
  onUpdate?: (setData: Partial<WorkoutSet>) => void;
}

const SetCard: React.FC<Props> = ({ set, isTarget = false, onComplete, onUpdate }) => {
  const [weight, setWeight] = useState(set.weight_kg?.toString() || set.target_weight_kg?.toString() || '');
  const [reps, setReps] = useState(set.reps?.toString() || set.target_reps?.toString() || '');
  const [selectedFeeling, setSelectedFeeling] = useState<string>('=');

  const handleComplete = () => {
    const weightNum = parseFloat(weight) || 0;
    const repsNum = parseInt(reps) || 0;
    
    onComplete?.({ weight_kg: weightNum, reps: repsNum });
  };

  const getSetTypeLabel = (kind?: string) => {
    switch (kind) {
      case 'warmup': return 'Warmup';
      case 'drop': return 'Drop Set';
      case 'amrap': return 'AMRAP';
      default: return 'Set';
    }
  };

  const feelingButtons = ['--', '-', '=', '+', '++'];

  if (isTarget) {
    return (
      <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs">
            Target
          </Badge>
          <div className="text-sm font-medium">
            🎯 {set.target_weight_kg || '-'}kg × {set.target_reps || '-'} reps
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-3 rounded-lg border ${set.is_completed ? 'bg-green-50 dark:bg-green-900/20 border-green-200' : 'bg-card'}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {getSetTypeLabel(set.set_kind)} {set.set_index}
          </Badge>
          {set.is_completed && (
            <CheckCircle className="h-4 w-4 text-green-600" />
          )}
        </div>
        
        {set.rest_seconds && (
          <Badge variant="outline" className="text-xs">
            <Timer className="h-3 w-3 mr-1" />
            {set.rest_seconds}s
          </Badge>
        )}
      </div>

      {/* Previous + Target Display */}
      <div className="flex flex-col gap-1 text-sm text-muted-foreground mb-2">
        {set.prev_weight_kg && set.prev_reps && (
          <div>Prev: {set.prev_weight_kg}kg × {set.prev_reps}</div>
        )}
        <div className="text-foreground font-medium">
          🎯 Target: {set.target_weight_kg || '-'}kg × {set.target_reps || '-'}
        </div>
      </div>

      {!set.is_completed ? (
        <>
          {/* Inline Weight/Reps Inputs */}
          <div className="flex items-center gap-2 mb-2">
            <input 
              type="number" 
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-20 text-center px-2 py-1 rounded border bg-background text-sm"
              placeholder="0"
              step="0.5"
            />
            <span className="text-sm text-muted-foreground">kg</span>
            
            <input 
              type="number" 
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              className="w-16 text-center px-2 py-1 rounded border bg-background text-sm"
              placeholder="0"
            />
            <span className="text-sm text-muted-foreground">reps</span>
          </div>

          {/* Feeling Buttons Row */}
          <div className="flex justify-between gap-1 mb-3">
            {feelingButtons.map((feeling) => (
              <button
                key={feeling}
                onClick={() => setSelectedFeeling(feeling)}
                className={`flex-1 rounded px-2 py-1 text-xs transition-colors ${
                  selectedFeeling === feeling 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {feeling}
              </button>
            ))}
          </div>

          {/* Complete Button */}
          <Button 
            onClick={handleComplete}
            size="sm"
            className="w-full"
            disabled={!weight || !reps}
          >
            Complete Set
          </Button>
        </>
      ) : (
        /* Completed Set Display */
        <div className="flex items-center justify-between">
          <div className="font-medium">
            {set.weight_kg}kg × {set.reps} reps
          </div>
          <Button 
            variant="outline"
            size="sm"
            onClick={() => {
              setWeight(set.weight_kg?.toString() || '');
              setReps(set.reps?.toString() || '');
              onUpdate?.({ is_completed: false });
            }}
          >
            Edit
          </Button>
        </div>
      )}
    </div>
  );
};

export default SetCard;