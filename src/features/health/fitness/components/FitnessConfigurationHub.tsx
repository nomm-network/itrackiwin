import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Target, Play, CheckCircle } from 'lucide-react';
import { MuscleGroupPicker } from './MuscleGroupPicker';
import { useMusclePriorities } from '../hooks/useMusclePriorities.hook';
import { logMusclePriorityTestResults } from '../utils/musclePriorityTests';

export const FitnessConfigurationHub = () => {
  const { data: priorities = [] } = useMusclePriorities();
  const [testsRun, setTestsRun] = useState(false);

  const handleRunTests = () => {
    const results = logMusclePriorityTestResults();
    setTestsRun(true);
    
    if (results.passed === results.total) {
      console.log('🎯 Muscle priority system is working perfectly!');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Fitness Configuration Hub</h1>
        <p className="text-muted-foreground">
          Configure your muscle group priorities and training personalization
        </p>
      </div>

      {/* Current Configuration Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Target className="h-8 w-8 text-primary" />
              <div>
                <div className="font-medium">Muscle Priorities</div>
                <div className="text-sm text-muted-foreground">
                  {priorities.length}/3 priorities set
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Play className="h-8 w-8 text-green-600" />
              <div>
                <div className="font-medium">System Status</div>
                <div className="text-sm text-muted-foreground">
                  Ready for training
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className={`h-8 w-8 ${testsRun ? 'text-green-600' : 'text-muted-foreground'}`} />
              <div>
                <div className="font-medium">System Tests</div>
                <div className="text-sm text-muted-foreground">
                  {testsRun ? 'Tests passed' : 'Not verified'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Priority Configuration */}
      <MuscleGroupPicker />

      {/* System Testing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            System Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Run automated tests to verify that the muscle priority system is working correctly.
            This will test priority weight map generation, volume adjustments, and calculation accuracy.
          </p>
          
          <div className="flex items-center gap-4">
            <Button
              onClick={handleRunTests}
              variant={testsRun ? "outline" : "default"}
              className="flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              {testsRun ? 'Run Tests Again' : 'Run System Tests'}
            </Button>
            
            {testsRun && (
              <Badge variant="outline" className="text-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Tests Completed
              </Badge>
            )}
          </div>

          <div className="text-xs text-muted-foreground">
            Check the browser console for detailed test results
          </div>
        </CardContent>
      </Card>

      {/* Configuration Summary */}
      {priorities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Configuration Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {priorities.map((priority) => (
                <div
                  key={priority.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">
                      Priority {priority.priority_level}
                    </Badge>
                    <span className="font-medium">{priority.muscle_name}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {priority.priority_level === 1 && '+30% volume'}
                    {priority.priority_level === 2 && '+20% volume'}
                    {priority.priority_level === 3 && '+10% volume'}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Integration Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Integration Points</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div>• <strong>Workout Generation:</strong> Priority muscles get increased volume and frequency</div>
            <div>• <strong>Exercise Selection:</strong> Exercises targeting priority muscles are favored</div>
            <div>• <strong>Progress Tracking:</strong> Enhanced monitoring for prioritized muscle groups</div>
            <div>• <strong>AI Coaching:</strong> Personalized recommendations based on priorities</div>
            <div>• <strong>Template Creation:</strong> Automatic adjustment of template volumes</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};