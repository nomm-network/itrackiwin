import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Settings, Zap } from 'lucide-react';
import { ImplementChooser } from './ImplementChooser';

interface WorkoutExerciseHeaderProps {
  exerciseName: string;
  exerciseId: string;
  loadType?: string;
  supportedImplements?: ('barbell' | 'dumbbell' | 'machine')[];
  selectedImplement?: string;
  onImplementChange: (implement: string) => void;
  onSettingsClick?: () => void;
  onWarmupClick?: () => void;
  className?: string;
}

export function WorkoutExerciseHeader({
  exerciseName,
  exerciseId,
  loadType,
  supportedImplements = ['barbell'],
  selectedImplement,
  onImplementChange,
  onSettingsClick,
  onWarmupClick,
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
      
      <div className="flex items-center gap-2">
        <ImplementChooser
          exerciseId={exerciseId}
          supportedImplements={supportedImplements}
          selectedImplement={selectedImplement}
          onImplementChange={onImplementChange}
        />
        
        {onSettingsClick && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onSettingsClick}
            className="h-8 w-8"
          >
            <Settings className="h-4 w-4" />
          </Button>
        )}
        
        {onWarmupClick && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onWarmupClick}
            className="h-8 w-8"
          >
            <Zap className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}