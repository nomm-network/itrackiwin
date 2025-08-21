import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Battery, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FitnessReadiness: React.FC = () => {
  // This would use real readiness data
  const readiness = {
    score: 85,
    sleep: 7.5,
    hrv: 45,
    restingHr: 58
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Battery className="h-5 w-5" />
          Readiness
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className={`text-3xl font-bold ${getScoreColor(readiness.score)}`}>
            {readiness.score}%
          </div>
          <div className="text-sm text-muted-foreground">Ready to train</div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="flex items-center gap-1">
              <Moon className="h-3 w-3" />
              Sleep
            </span>
            <span>{readiness.sleep}h</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              Resting HR
            </span>
            <span>{readiness.restingHr} bpm</span>
          </div>
        </div>

        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
        >
          Log Readiness
        </Button>
      </CardContent>
    </Card>
  );
};

export default FitnessReadiness;