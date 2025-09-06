import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Play, Pause, SkipForward, Plus, Minus, Timer } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface EnhancedRestTimerProps {
  suggestedSeconds: number;
  workoutSetId?: string;
  onComplete: () => void;
  onSkip: () => void;
  isActive?: boolean;
  className?: string;
}

export const EnhancedRestTimer: React.FC<EnhancedRestTimerProps> = ({
  suggestedSeconds,
  workoutSetId,
  onComplete,
  onSkip,
  isActive = false,
  className
}) => {
  const [remainingSeconds, setRemainingSeconds] = useState(suggestedSeconds);
  const [isPaused, setIsPaused] = useState(!isActive);
  const [customTime, setCustomTime] = useState(suggestedSeconds);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [pauseCount, setPauseCount] = useState(0);
  const [totalPauseTime, setTotalPauseTime] = useState(0);
  const [lastPauseStart, setLastPauseStart] = useState<Date | null>(null);

  // Initialize rest timer session
  useEffect(() => {
    if (isActive && !sessionId) {
      createRestSession();
    }
  }, [isActive]);

  const createRestSession = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('rest_timer_sessions')
        .insert({
          user_id: user.id,
          workout_set_id: workoutSetId || null,
          planned_rest_seconds: suggestedSeconds,
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating rest session:', error);
        return;
      }

      setSessionId(data.id);
      setStartTime(new Date());
    } catch (error) {
      console.error('Error in createRestSession:', error);
    }
  };

  const updateRestSession = async (updates: any) => {
    if (!sessionId) return;

    try {
      const { error } = await supabase
        .from('rest_timer_sessions')
        .update(updates)
        .eq('id', sessionId);

      if (error) {
        console.error('Error updating rest session:', error);
      }
    } catch (error) {
      console.error('Error in updateRestSession:', error);
    }
  };

  useEffect(() => {
    setRemainingSeconds(suggestedSeconds);
    setCustomTime(suggestedSeconds);
  }, [suggestedSeconds]);

  useEffect(() => {
    if (!isPaused && remainingSeconds > 0) {
      const timer = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isPaused, remainingSeconds]);

  const handleComplete = async () => {
    const actualDuration = startTime ? Math.floor((Date.now() - startTime.getTime()) / 1000) : suggestedSeconds;
    
    await updateRestSession({
      completed_at: new Date().toISOString(),
      actual_rest_seconds: actualDuration,
      was_interrupted: pauseCount > 0
    });

    toast.success('Rest complete! Ready for your next set.', {
      description: `Rested for ${formatTime(actualDuration)}`
    });

    onComplete();
  };

  const handleSkip = async () => {
    const actualDuration = startTime ? Math.floor((Date.now() - startTime.getTime()) / 1000) : 0;
    
    await updateRestSession({
      actual_rest_seconds: actualDuration,
      was_interrupted: true,
      interruption_reason: 'skipped'
    });

    toast.info('Rest skipped', {
      description: `Rested for ${formatTime(actualDuration)}`
    });

    onSkip();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = ((customTime - remainingSeconds) / customTime) * 100;

  const handlePlayPause = () => {
    if (isPaused) {
      // Resume: calculate pause duration if we were paused
      if (lastPauseStart) {
        const pauseDuration = Math.floor((Date.now() - lastPauseStart.getTime()) / 1000);
        setTotalPauseTime(prev => prev + pauseDuration);
        setLastPauseStart(null);
      }
    } else {
      // Pause: record pause start time
      setLastPauseStart(new Date());
      setPauseCount(prev => prev + 1);
    }
    
    setIsPaused(!isPaused);
  };

  const adjustTime = (adjustment: number) => {
    const newTime = Math.max(0, customTime + adjustment);
    setCustomTime(newTime);
    setRemainingSeconds(Math.min(remainingSeconds + adjustment, newTime));
    
    toast.info(`Timer adjusted by ${adjustment > 0 ? '+' : ''}${adjustment}s`);
  };

  const resetTimer = () => {
    setRemainingSeconds(customTime);
    setIsPaused(true);
    setLastPauseStart(null);
    setPauseCount(0);
    setTotalPauseTime(0);
    toast.info('Timer reset');
  };

  const isCompleted = remainingSeconds === 0;
  const isAlmostDone = remainingSeconds <= 10 && remainingSeconds > 0;

  return (
    <Card className={cn("w-full max-w-sm", className)}>
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-lg flex items-center justify-center gap-2">
          <Timer className="h-5 w-5" />
          Rest Timer
        </CardTitle>
        {workoutSetId && (
          <Badge variant="outline" className="text-xs">
            Auto-started
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Timer Display */}
        <div className="text-center">
          <div className={cn(
            "text-4xl font-mono font-bold transition-all duration-300",
            isCompleted && "text-green-500 animate-pulse",
            isAlmostDone && "text-red-500 animate-bounce"
          )}>
            {formatTime(remainingSeconds)}
          </div>
          <p className="text-sm text-muted-foreground">
            Target: {formatTime(suggestedSeconds)}
            {pauseCount > 0 && ` • ${pauseCount} pause${pauseCount > 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Progress Bar */}
        <Progress 
          value={progressPercentage} 
          className={cn(
            "h-3 transition-all duration-300",
            isCompleted && "bg-green-100",
            isAlmostDone && "animate-pulse"
          )}
        />

        {/* Quick Time Adjustments */}
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
                {remainingSeconds === customTime ? 'Start' : 'Resume'}
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
            onClick={handleSkip}
            className="flex-1"
          >
            <SkipForward className="h-4 w-4 mr-1" />
            Skip
          </Button>
        </div>

        {isCompleted && (
          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-sm text-green-700 dark:text-green-300 font-medium">
              🎉 Rest complete! Ready for your next set.
            </p>
            {startTime && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                Total rest: {formatTime(Math.floor((Date.now() - startTime.getTime()) / 1000))}
              </p>
            )}
          </div>
        )}

        {/* Session Stats */}
        {sessionId && (
          <div className="text-xs text-muted-foreground text-center">
            Session tracked • Set ID: {workoutSetId?.slice(-8) || 'Manual'}
          </div>
        )}
      </CardContent>
    </Card>
  );
};