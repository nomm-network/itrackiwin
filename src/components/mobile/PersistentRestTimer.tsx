import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Timer, Play, Pause, X, Plus, Minus } from 'lucide-react';

interface PersistentRestTimerProps {
  suggestedSeconds: number;
  workoutSetId?: string;
  onComplete?: () => void;
  onSkip?: () => void;
  isActive?: boolean;
  className?: string;
}

export const PersistentRestTimer: React.FC<PersistentRestTimerProps> = ({
  suggestedSeconds,
  workoutSetId,
  onComplete,
  onSkip,
  isActive = false,
  className
}) => {
  const [timeLeft, setTimeLeft] = useState(suggestedSeconds);
  const [isRunning, setIsRunning] = useState(isActive);
  const [totalTime, setTotalTime] = useState(suggestedSeconds);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    setTimeLeft(suggestedSeconds);
    setTotalTime(suggestedSeconds);
    setIsRunning(isActive);
  }, [suggestedSeconds, isActive]);

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          onComplete?.();
          // Vibration feedback when timer completes
          if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200]);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, onComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  const adjustTime = (delta: number) => {
    const newTime = Math.max(0, timeLeft + delta);
    setTimeLeft(newTime);
    if (newTime > totalTime) {
      setTotalTime(newTime);
    }
  };

  if (isMinimized) {
    return (
      <Card 
        className={cn(
          "fixed bottom-20 right-4 w-20 h-16 cursor-pointer shadow-lg border-primary/20",
          className
        )}
        onClick={() => setIsMinimized(false)}
      >
        <CardContent className="p-2 flex flex-col items-center justify-center h-full">
          <Timer className="h-4 w-4 text-primary" />
          <span className="text-xs font-mono">{formatTime(timeLeft)}</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("shadow-xl border-primary/20 bg-card/95 backdrop-blur-sm", className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Rest Timer</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMinimized(true)}
              className="h-8 w-8"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onSkip}
              className="h-8 w-8 hover:bg-destructive/10"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {/* Progress bar */}
          <Progress value={progress} className="h-2" />
          
          {/* Time display */}
          <div className="text-center">
            <div className="text-2xl font-bold text-primary font-mono">
              {formatTime(timeLeft)}
            </div>
            <div className="text-sm text-muted-foreground">
              of {formatTime(totalTime)}
            </div>
          </div>

          {/* Control buttons */}
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => adjustTime(-30)}
              className="touch-target h-10 w-10"
            >
              <span className="text-xs">-30s</span>
            </Button>
            
            <Button
              variant={isRunning ? "secondary" : "default"}
              size="sm"
              onClick={() => setIsRunning(!isRunning)}
              className="touch-target flex items-center gap-2 px-6"
            >
              {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isRunning ? "Pause" : "Start"}
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => adjustTime(30)}
              className="touch-target h-10 w-10"
            >
              <span className="text-xs">+30s</span>
            </Button>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setTimeLeft(0);
                setIsRunning(false);
                onComplete?.();
              }}
              className="text-xs"
            >
              Skip Rest
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setTimeLeft(totalTime);
                setIsRunning(false);
              }}
              className="text-xs"
            >
              Reset
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};