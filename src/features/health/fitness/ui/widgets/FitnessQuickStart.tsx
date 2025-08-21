import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Clock, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FitnessQuickStart: React.FC = () => {
  const navigate = useNavigate();

  return (
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
            onClick={() => navigate('/fitness')}
            className="flex items-center gap-2 h-12"
          >
            <Play className="h-4 w-4" />
            Start Workout
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
  );
};

export default FitnessQuickStart;