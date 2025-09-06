import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Calendar, Award, Activity } from 'lucide-react';

const FitnessStats: React.FC = () => {
  // This would use real data from your fitness API/hooks
  const stats = {
    weeklyWorkouts: 4,
    currentStreak: 12,
    totalWorkouts: 156,
    avgDuration: 45
  };

  return (
    <Card className="col-span-2 md:col-span-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Fitness Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{stats.weeklyWorkouts}</div>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <Calendar className="h-3 w-3" />
              This Week
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-500">{stats.currentStreak}</div>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <Award className="h-3 w-3" />
              Day Streak
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-500">{stats.totalWorkouts}</div>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <Activity className="h-3 w-3" />
              Total
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">{stats.avgDuration}m</div>
            <div className="text-sm text-muted-foreground">
              Avg Duration
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FitnessStats;