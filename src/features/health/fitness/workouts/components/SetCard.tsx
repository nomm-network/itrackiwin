import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, Timer } from 'lucide-react';

interface WorkoutSet {
  id?: string;
  set_index: number;
  target_weight_kg?: number;
  target_reps?: number;
  weight_kg?: number;
  reps?: number;
  is_completed?: boolean;
  set_kind?: 'warmup' | 'normal' | 'drop' | 'amrap';
  rest_seconds?: number;
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
  const [isEditing, setIsEditing] = useState(!set.is_completed && !isTarget);

  const handleComplete = () => {
    const weightNum = parseFloat(weight) || 0;
    const repsNum = parseInt(reps) || 0;
    
    onComplete?.({ weight_kg: weightNum, reps: repsNum });
    setIsEditing(false);
  };

  const getSetTypeLabel = (kind?: string) => {
    switch (kind) {
      case 'warmup': return 'Warmup';
      case 'drop': return 'Drop Set';
      case 'amrap': return 'AMRAP';
      default: return 'Set';
    }
  };

  const getSetTypeColor = (kind?: string) => {
    switch (kind) {
      case 'warmup': return 'bg-blue-100 text-blue-800';
      case 'drop': return 'bg-orange-100 text-orange-800';
      case 'amrap': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className={`mb-2 ${set.is_completed ? 'bg-green-50 border-green-200' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded text-xs font-medium ${getSetTypeColor(set.set_kind)}`}>
                {getSetTypeLabel(set.set_kind)} {set.set_index}
              </span>
              {set.is_completed && (
                <CheckCircle className="h-4 w-4 text-green-600" />
              )}
            </div>

            <div className="flex items-center gap-4">
              {isEditing ? (
                <>
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="Weight"
                      className="w-20 h-8"
                      step="0.5"
                    />
                    <span className="text-sm text-muted-foreground">kg</span>
                  </div>
                  <span className="text-muted-foreground">×</span>
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      value={reps}
                      onChange={(e) => setReps(e.target.value)}
                      placeholder="Reps"
                      className="w-16 h-8"
                    />
                    <span className="text-sm text-muted-foreground">reps</span>
                  </div>
                </>
              ) : (
                <div className="font-medium">
                  {isTarget ? 'Target: ' : ''}
                  {weight || set.target_weight_kg || '-'}kg × {reps || set.target_reps || '-'} reps
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {set.rest_seconds && (
              <Badge variant="outline" className="text-xs">
                <Timer className="h-3 w-3 mr-1" />
                {set.rest_seconds}s
              </Badge>
            )}
            
            {isEditing && !isTarget && (
              <Button 
                onClick={handleComplete}
                size="sm"
                disabled={!weight || !reps}
              >
                Complete
              </Button>
            )}
            
            {set.is_completed && !isTarget && (
              <Button 
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                Edit
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SetCard;