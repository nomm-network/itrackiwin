import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Target, TrendingUp, Timer } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkoutClockProps {
  startedAt: string;
  totalSets: number;
  completedSets: number;
  estimatedDurationSeconds?: number;
  className?: string;
}

const WorkoutClock: React.FC<WorkoutClockProps> = ({
  startedAt,
  totalSets,
  completedSets,
  estimatedDurationSeconds,
  className
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const workoutStart = new Date(startedAt);
  const elapsedSeconds = Math.floor((currentTime.getTime() - workoutStart.getTime()) / 1000);
  
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;
  
  // Calculate ETA based on average time per set
  const calculateETA = () => {
    if (completedSets === 0 || totalSets === 0) {
      // Return icon instead of text when calculating
      return estimatedDurationSeconds ? formatDuration(estimatedDurationSeconds) : <Timer className="h-4 w-4 animate-spin" />;
    }
    
    const avgTimePerSet = elapsedSeconds / completedSets;
    const remainingSets = totalSets - completedSets;
    const estimatedRemainingSeconds = Math.floor(remainingSets * avgTimePerSet);
    
    return formatDuration(estimatedRemainingSeconds);
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          {/* Elapsed Time */}
          <div className="space-y-1">
            <div className="flex items-center justify-center text-muted-foreground">
              <Clock className="h-4 w-4 mr-1" />
              <span className="text-xs">Elapsed</span>
            </div>
            <div className="text-lg font-mono font-semibold">
              {formatDuration(elapsedSeconds)}
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-1">
            <div className="flex items-center justify-center text-muted-foreground">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span className="text-xs">Progress</span>
            </div>
            <div className="text-lg font-semibold">
              {completedSets}/{totalSets}
            </div>
            <div className="w-full bg-muted rounded-full h-1.5">
              <div 
                className="bg-primary h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
            </div>
          </div>

          {/* ETA */}
          <div className="space-y-1">
            <div className="flex items-center justify-center text-muted-foreground">
              <Target className="h-4 w-4 mr-1" />
              <span className="text-xs">ETA</span>
            </div>
            <div className="text-lg font-mono font-semibold flex items-center justify-center">
              {calculateETA()}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3 w-full bg-muted rounded-full h-2">
          <div 
            className={cn(
              "h-2 rounded-full transition-all duration-500",
              progressPercentage >= 100 ? "bg-green-500" : "bg-primary"
            )}
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          />
        </div>

        {progressPercentage >= 100 && (
          <div className="mt-2 text-center">
            <span className="text-sm text-green-600 font-medium">
              🎉 All sets completed!
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WorkoutClock;