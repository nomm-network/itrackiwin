import React from 'react';
import WorkoutSetCard from './WorkoutSetCard';
import { WorkoutSet } from '@/types/workout';

interface WorkoutSetsBlockProps {
  sets: WorkoutSet[];
  onComplete: (setId: string) => void;
  onEdit: (setId: string) => void;
}

const WorkoutSetsBlock: React.FC<WorkoutSetsBlockProps> = ({ sets, onComplete, onEdit }) => {
  if (!sets || sets.length === 0) {
    return <div className="text-sm text-muted-foreground">No sets logged yet</div>;
  }

  return (
    <div className="space-y-2">
      {sets.map((set) => (
        <WorkoutSetCard
          key={set.id}
          set={set}
          onComplete={onComplete}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
};

export default WorkoutSetsBlock;