import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Timer, Play, Pause, X, Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileRestTimerProps {
  suggestedSeconds: number;
  onComplete?: () => void;
  onSkip?: () => void;
  isActive?: boolean;
  className?: string;
}

export const MobileRestTimer: React.FC<MobileRestTimerProps> = ({
  suggestedSeconds,
  onComplete,
  onSkip,
  isActive = false,
  className
}) => {
  const [timeLeft, setTimeLeft] = useState(suggestedSeconds);
  const [isRunning, setIsRunning] = useState(isActive);
  const [totalTime, setTotalTime] = useState(suggestedSeconds);

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

  return (
    <Card className={cn("sticky-mobile border-primary/20 shadow-lg", className)}>
      <CardContent className="p-fluid-s">
        <div className="flex items-center justify-between mb-fluid-xs">
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4 text-primary" />
            <span className="text-fluid-sm font-medium">Rest Timer</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onSkip}
            className="h-8 w-8 hover:bg-destructive/10"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-fluid-xs">
          {/* Progress bar */}
          <Progress value={progress} className="h-2" />
          
          {/* Time display */}
          <div className="text-center">
            <div className="text-fluid-2xl font-bold text-primary">
              {formatTime(timeLeft)}
            </div>
            <div className="text-fluid-sm text-muted-foreground">
              of {formatTime(totalTime)}
            </div>
          </div>

          {/* Time adjustment controls */}
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => adjustTime(-15)}
              className="touch-target-comfortable"
            >
              <Minus className="h-4 w-4" />
            </Button>
            
            <Button
              variant={isRunning ? "secondary" : "default"}
              size="sm"
              onClick={() => setIsRunning(!isRunning)}
              className="touch-target-comfortable flex items-center gap-2"
            >
              {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isRunning ? "Pause" : "Start"}
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => adjustTime(15)}
              className="touch-target-comfortable"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Quick action buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setTimeLeft(0);
                setIsRunning(false);
                onComplete?.();
              }}
              className="touch-target"
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
              className="touch-target"
            >
              Reset
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MobileRestTimer;