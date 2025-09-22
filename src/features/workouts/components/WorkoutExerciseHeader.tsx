import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ImplementChooser } from './ImplementChooser';

interface WorkoutExerciseHeaderProps {
  exerciseName: string;
  exerciseId: string;
  loadType?: string;
  supportedImplements?: ('barbell' | 'dumbbell' | 'machine')[];
  selectedImplement?: string;
  onImplementChange: (implement: string) => void;
  className?: string;
}

export function WorkoutExerciseHeader({
  exerciseName,
  exerciseId,
  loadType,
  supportedImplements = ['barbell'],
  selectedImplement,
  onImplementChange,
  className
}: WorkoutExerciseHeaderProps) {
  return (
    <div className={`flex items-center justify-between ${className || ''}`}>
      <div className="flex items-center gap-2">
        <h3 className="font-medium">{exerciseName}</h3>
        {loadType && (
          <Badge variant="outline" className="text-xs">
            {loadType}
          </Badge>
        )}
      </div>
      
      <ImplementChooser
        exerciseId={exerciseId}
        supportedImplements={supportedImplements}
        selectedImplement={selectedImplement}
        onImplementChange={onImplementChange}
      />
    </div>
  );
}