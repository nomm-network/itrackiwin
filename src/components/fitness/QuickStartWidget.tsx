import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Target, RotateCcw, Calendar } from 'lucide-react';
import { useNextProgramBlock } from '@/hooks/useTrainingPrograms';
import { Link } from 'react-router-dom';

export const QuickStartWidget = () => {
  const { data: nextBlock, isLoading } = useNextProgramBlock();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded mb-2"></div>
            <div className="h-6 bg-muted rounded mb-4"></div>
            <div className="h-10 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!nextBlock) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Quick Start
          </CardTitle>
          <CardDescription>No active program set</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Set up a training program to get structured workout suggestions.
          </p>
          <Link to="/fitness/programs">
            <Button variant="outline" className="w-full">
              Create Training Program
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Quick Start</CardTitle>
        </div>
        <CardDescription>Your next scheduled workout</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold text-xl mb-2">{nextBlock.template_name}</h3>
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="secondary">
              Workout {nextBlock.order_index} of {nextBlock.total_blocks}
            </Badge>
            <Badge variant="outline" className="text-xs">
              <RotateCcw className="h-3 w-3 mr-1" />
              Cycle {nextBlock.cycles_completed + 1}
            </Badge>
          </div>
          
          {nextBlock.focus_tags && nextBlock.focus_tags.length > 0 && (
            <div className="flex gap-1 flex-wrap mb-4">
              {nextBlock.focus_tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs capitalize">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <Link 
          to={`/fitness/session/start?template=${nextBlock.workout_template_id}&block=${nextBlock.next_block_id}`}
        >
          <Button size="lg" className="w-full">
            <Play className="h-4 w-4 mr-2" />
            Start Workout
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};