import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Pause, Square } from 'lucide-react';

interface Workout {
  id: string;
  title?: string;
  started_at: string;
  ended_at?: string;
  template_id?: string;
  template?: {
    name: string;
  };
}

interface Props {
  workout: Workout;
  onEndWorkout?: () => void;
}

const WorkoutHeader: React.FC<Props> = ({ workout, onEndWorkout }) => {
  const isActive = !workout.ended_at;
  const startTime = new Date(workout.started_at);
  const duration = isActive ? Date.now() - startTime.getTime() : 
    workout.ended_at ? new Date(workout.ended_at).getTime() - startTime.getTime() : 0;
  
  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return hours > 0 ? `${hours}h ${remainingMinutes}m` : `${remainingMinutes}m`;
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {workout?.template?.name || "Workout Session"}
          </h2>
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Active" : "Completed"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              Started: {startTime.toLocaleTimeString()}
            </p>
            <p className="text-sm font-medium">
              Duration: {formatDuration(duration)}
            </p>
          </div>
          {isActive && onEndWorkout && (
            <Button onClick={onEndWorkout} variant="outline" size="sm">
              <Square className="h-4 w-4 mr-2" />
              End Workout
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkoutHeader;