// src/features/health/fitness/workouts/components/WorkoutSetsBlock.tsx
import React from 'react';
import { Separator } from "@/components/ui/separator";
import WorkoutSetCard from './WorkoutSetCard';

interface WorkoutSetsBlockProps {
  exerciseId: string;
  sets: any[];
  onUpdateSet?: (setId: string, data: any) => void;
}

const WorkoutSetsBlock: React.FC<WorkoutSetsBlockProps> = ({ exerciseId, sets, onUpdateSet }) => {
  if (!sets || sets.length === 0) {
    return null;
  }

  return (
    <div className="mt-4">
      <Separator className="mb-2" />
      <h3 className="text-sm font-medium text-muted-foreground mb-2">
        Sets
      </h3>
      {sets.map((set, idx) => (
        <WorkoutSetCard
          key={set.id || idx}
          set={set}
          onUpdate={(data) => onUpdateSet?.(set.id, data)}
        />
      ))}
    </div>
  );
};

export default WorkoutSetsBlock;