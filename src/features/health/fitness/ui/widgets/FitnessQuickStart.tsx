import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Clock, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TemplateSelectionDialog from '@/components/fitness/TemplateSelectionDialog';
import { useRecentWorkouts } from '@/features/health/fitness/services/fitness.api';

const FitnessQuickStart: React.FC = () => {
  const navigate = useNavigate();
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const { data: recentWorkouts } = useRecentWorkouts(5);
  
  // Check if there's an active workout (started but not ended)
  const activeWorkout = recentWorkouts?.find(workout => workout.started_at && !workout.ended_at);

  return (
    <>
      <Card className="col-span-2 md:col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Quick Start
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button 
              onClick={activeWorkout ? () => navigate(`/fitness/session/${activeWorkout.id}`) : () => setShowTemplateDialog(true)}
              className="flex items-center gap-2 h-12"
            >
              <Play className="h-4 w-4" />
              {activeWorkout ? 'Continue Workout' : 'Start Workout'}
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/fitness/templates')}
              className="flex items-center gap-2 h-12"
            >
              <Target className="h-4 w-4" />
              Templates
            </Button>
          </div>
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Last workout: 2 days ago
          </div>
        </CardContent>
      </Card>
      
      <TemplateSelectionDialog 
        open={showTemplateDialog}
        onOpenChange={setShowTemplateDialog}
      />
    </>
  );
};

export default FitnessQuickStart;