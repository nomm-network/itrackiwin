import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { WorkoutSet } from '@/types/workout';

interface WorkoutSetCardProps {
  set: WorkoutSet;
  onComplete: (setId: string) => void;
  onEdit: (setId: string) => void;
}

const WorkoutSetCard: React.FC<WorkoutSetCardProps> = ({ set, onComplete, onEdit }) => {
  return (
    <Card
      className={cn(
        'flex items-center justify-between p-3 mb-2',
        set.is_completed ? 'bg-green-50 border-green-300' : 'bg-white'
      )}
    >
      <div className="flex items-center space-x-4">
        <div className="text-sm font-medium">Set {set.set_index}</div>
        <div className="text-sm text-muted-foreground">
          {set.weight} {set.weight_unit} × {set.reps} reps
        </div>
      </div>

      <div className="flex space-x-2">
        {!set.is_completed && (
          <Button
            size="sm"
            variant="default"
            onClick={() => onComplete(set.id)}
          >
            Complete
          </Button>
        )}
        <Button
          size="sm"
          variant="outline"
          onClick={() => onEdit(set.id)}
        >
          Edit
        </Button>
      </div>
    </Card>
  );
};

export default WorkoutSetCard;