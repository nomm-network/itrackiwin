import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Play, Pause, SkipForward, Plus, Minus } from "lucide-react";

interface RestTimerProps {
  suggestedSeconds: number;
  onComplete: () => void;
  onSkip: () => void;
  isActive?: boolean;
  className?: string;
}

const RestTimer: React.FC<RestTimerProps> = ({
  suggestedSeconds,
  onComplete,
  onSkip,
  isActive = false,
  className
}) => {
  const [remainingSeconds, setRemainingSeconds] = useState(suggestedSeconds);
  const [isPaused, setIsPaused] = useState(!isActive);
  const [customTime, setCustomTime] = useState(suggestedSeconds);

  useEffect(() => {
    setRemainingSeconds(suggestedSeconds);
    setCustomTime(suggestedSeconds);
  }, [suggestedSeconds]);

  useEffect(() => {
    if (!isPaused && remainingSeconds > 0) {
      const timer = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            onComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isPaused, remainingSeconds, onComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = ((customTime - remainingSeconds) / customTime) * 100;

  const handlePlayPause = () => {
    setIsPaused(!isPaused);
  };

  const adjustTime = (adjustment: number) => {
    const newTime = Math.max(0, customTime + adjustment);
    setCustomTime(newTime);
    setRemainingSeconds(Math.min(remainingSeconds + adjustment, newTime));
  };

  const resetTimer = () => {
    setRemainingSeconds(customTime);
    setIsPaused(true);
  };

  const isCompleted = remainingSeconds === 0;

  return (
    <Card className={cn("w-full max-w-sm", className)}>
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-lg">Rest Timer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Timer Display */}
        <div className="text-center">
          <div className={cn(
            "text-4xl font-mono font-bold transition-colors",
            isCompleted && "text-green-500",
            remainingSeconds <= 10 && remainingSeconds > 0 && "text-red-500"
          )}>
            {formatTime(remainingSeconds)}
          </div>
          <p className="text-sm text-muted-foreground">
            Suggested: {formatTime(suggestedSeconds)}
          </p>
        </div>

        {/* Progress Bar */}
        <Progress 
          value={progressPercentage} 
          className="h-2"
        />

        {/* Time Adjustment */}
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => adjustTime(-30)}
            disabled={customTime <= 30}
          >
            <Minus className="h-3 w-3" />
            30s
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => adjustTime(30)}
          >
            <Plus className="h-3 w-3" />
            30s
          </Button>
        </div>

        {/* Control Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePlayPause}
            disabled={isCompleted}
            className="flex-1"
          >
            {isPaused ? (
              <>
                <Play className="h-4 w-4 mr-1" />
                Start
              </>
            ) : (
              <>
                <Pause className="h-4 w-4 mr-1" />
                Pause
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={resetTimer}
            className="flex-1"
          >
            Reset
          </Button>
          
          <Button
            variant="secondary"
            size="sm"
            onClick={onSkip}
            className="flex-1"
          >
            <SkipForward className="h-4 w-4 mr-1" />
            Skip
          </Button>
        </div>

        {isCompleted && (
          <div className="text-center p-2 bg-green-50 rounded-md border border-green-200">
            <p className="text-sm text-green-700 font-medium">
              Rest complete! Ready for your next set.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RestTimer;