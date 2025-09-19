import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { 
  Settings, 
  Hand, 
  Flame, 
  ChevronDown, 
  Timer,
  Trophy 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExerciseTitleRowProps {
  exerciseName: string;
  exerciseOrder: number;
  totalExercises: number;
  completedSets: number;
  targetSets: number;
  onGripMenuOpen: () => void;
  onWarmupMenuOpen: () => void;
  onSettingsMenuOpen: () => void;
  className?: string;
}

export const ExerciseTitleRow: React.FC<ExerciseTitleRowProps> = ({
  exerciseName,
  exerciseOrder,
  totalExercises,
  completedSets,
  targetSets,
  onGripMenuOpen,
  onWarmupMenuOpen, 
  onSettingsMenuOpen,
  className
}) => {
  return (
    <div className={cn(
      "flex items-center justify-between p-4 bg-background border-b",
      className
    )}>
      {/* Left: Exercise name and progress */}
      <div className="flex items-center gap-3 flex-1">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            {exerciseName}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-xs">
              {exerciseOrder}/{totalExercises}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {completedSets}/{targetSets} sets
            </span>
          </div>
        </div>
      </div>

      {/* Right: Exercise menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-1">
            <Settings className="w-4 h-4" />
            <ChevronDown className="w-3 h-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem 
            onClick={onGripMenuOpen}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Hand className="w-4 h-4" />
            <span>Grips</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={onWarmupMenuOpen}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Flame className="w-4 h-4" />
            <span>Warm-up</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={onSettingsMenuOpen}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Settings className="w-4 h-4" />
            <span>Exercise Settings</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ExerciseTitleRow;