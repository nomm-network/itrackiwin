import React from 'react';
import { Clock, Play, Pause, SkipForward, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRestTimer } from '@/hooks/useRestTimer';

interface RestTimerBadgeProps {
  initialSeconds: number;
  isActive: boolean;
  onComplete?: () => void;
  className?: string;
}

export const RestTimerBadge: React.FC<RestTimerBadgeProps> = ({
  initialSeconds,
  isActive,
  onComplete,
  className
}) => {
  const { state, actions } = useRestTimer(initialSeconds, onComplete, true);

  React.useEffect(() => {
    if (isActive && !state.isActive && !state.isCompleted) {
      actions.start();
    }
  }, [isActive, state.isActive, state.isCompleted, actions]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = (): number => {
    if (state.totalSeconds === 0) return 0;
    return ((state.totalSeconds - state.remainingSeconds) / state.totalSeconds) * 100;
  };

  if (!isActive && state.remainingSeconds === state.totalSeconds) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Timer Badge */}
      <Badge 
        variant={state.isCompleted ? "default" : "secondary"}
        className="relative overflow-hidden"
      >
        <div 
          className="absolute inset-0 bg-primary/20 transition-all duration-1000"
          style={{ width: `${getProgressPercentage()}%` }}
        />
        <div className="relative flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formatTime(state.remainingSeconds)}
        </div>
      </Badge>

      {/* Control Buttons */}
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={state.isActive ? actions.pause : actions.start}
          className="h-6 w-6 p-0"
        >
          {state.isActive ? (
            <Pause className="w-3 h-3" />
          ) : (
            <Play className="w-3 h-3" />
          )}
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={actions.skip}
          className="h-6 w-6 p-0"
        >
          <SkipForward className="w-3 h-3" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={actions.reset}
          className="h-6 w-6 p-0"
        >
          <RotateCcw className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
};

export default RestTimerBadge;