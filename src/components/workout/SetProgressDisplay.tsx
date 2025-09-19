import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Target, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SetData {
  weight?: number;
  reps?: number;
  feel?: string;
  rpe?: number;
}

interface SetProgressDisplayProps {
  previousSet?: SetData;
  targetSet?: SetData;
  currentSet?: Partial<SetData>;
  className?: string;
}

export const SetProgressDisplay: React.FC<SetProgressDisplayProps> = ({
  previousSet,
  targetSet,
  currentSet,
  className
}) => {
  const formatSetDisplay = (set: SetData | undefined, prefix: string) => {
    if (!set) return null;
    
    const weight = set.weight ? `${set.weight}kg` : 'BW';
    const reps = set.reps ? ` × ${set.reps}` : '';
    const feel = set.feel || '';
    
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">{prefix}</span>
        <span className="font-medium">{weight}{reps}</span>
        {feel && <span className="text-lg">{feel}</span>}
      </div>
    );
  };

  if (!previousSet && !targetSet) {
    return null;
  }

  return (
    <div className={cn("space-y-2 p-3 bg-muted/50 rounded-lg", className)}>
      {previousSet && (
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-500" />
          {formatSetDisplay(previousSet, "Prev")}
        </div>
      )}
      
      {targetSet && (
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-red-500" />
          {formatSetDisplay(targetSet, "Target")}
        </div>
      )}
    </div>
  );
};

export default SetProgressDisplay;