import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Clock, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TrainingCenterCard() {
  const navigate = useNavigate();

  return (
    <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold mb-1">Training Center</h2>
            <p className="text-green-100 text-sm">Continue your active training session</p>
          </div>
          <div className="bg-white/20 p-3 rounded-full">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-green-100">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Last workout: 2 days ago</span>
          </div>
          
          <Button 
            onClick={() => navigate('/app/workouts')}
            className="w-full bg-white text-green-600 hover:bg-gray-100"
          >
            <Play className="w-4 h-4 mr-2" />
            Start Workout
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}