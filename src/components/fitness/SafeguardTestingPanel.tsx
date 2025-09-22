import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useStartWorkout } from '@/workouts-sot/hooks';
import { useRecalibration } from '@/features/health/fitness/hooks/useRecalibration.hook';
import { supabase } from '@/integrations/supabase/client';

export const SafeguardTestingPanel: React.FC = () => {
  const [testResults, setTestResults] = useState<Array<{
    test: string;
    result: 'success' | 'blocked' | 'error';
    message: string;
    timestamp: Date;
  }>>([]);

  const { mutateAsync: startWorkout, isPending: isGenerating } = useStartWorkout();
  const recalibration = useRecalibration('test-exercise-id');

  const addTestResult = (test: string, result: 'success' | 'blocked' | 'error', message: string) => {
    setTestResults(prev => [{
      test,
      result,
      message,
      timestamp: new Date()
    }, ...prev].slice(0, 10)); // Keep last 10 results
  };

  const testWorkoutGeneration = async () => {
    try {
      toast.info('Testing workout generation safeguards...');
      
      // Test 1: Rapid multiple clicks
      const promises = Array.from({ length: 5 }, () => startWorkout({}));
      const results = await Promise.allSettled(promises);
      
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      if (successful === 1 && failed === 4) {
        addTestResult('Multiple clicks protection', 'success', 'Only 1 workout created from 5 rapid requests');
        toast.success('Multiple clicks test passed!');
      } else {
        addTestResult('Multiple clicks protection', 'error', `${successful} successful, ${failed} failed`);
        toast.error('Multiple clicks test failed!');
      }
    } catch (error: any) {
      addTestResult('Multiple clicks protection', 'error', error.message);
      toast.error('Test failed: ' + error.message);
    }
  };

  const testRateLimit = async () => {
    try {
      toast.info('Testing rate limits...');
      
      // Try to generate 12 workouts rapidly (should be blocked after 10)
      let successCount = 0;
      let blockedCount = 0;
      
      for (let i = 0; i < 12; i++) {
        try {
          await startWorkout({});
          successCount++;
        } catch (error: any) {
          if (error.message.includes('Rate limit exceeded')) {
            blockedCount++;
          }
        }
      }
      
      if (successCount <= 10 && blockedCount > 0) {
        addTestResult('Rate limiting', 'success', `${successCount} allowed, ${blockedCount} blocked`);
        toast.success('Rate limiting working correctly!');
      } else {
        addTestResult('Rate limiting', 'error', `${successCount} allowed, ${blockedCount} blocked`);
        toast.error('Rate limiting not working!');
      }
    } catch (error: any) {
      addTestResult('Rate limiting', 'error', error.message);
      toast.error('Rate limit test failed: ' + error.message);
    }
  };

  const testRecalibrationLimits = async () => {
    try {
      toast.info('Testing recalibration limits...');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Try to run recalibration 6 times (should be blocked after 5)
      let successCount = 0;
      let blockedCount = 0;
      
      for (let i = 0; i < 6; i++) {
        try {
          // Recalibration is now a query, not a mutation
          await recalibration.refetch();
          successCount++;
        } catch (error: any) {
          if (error.message.includes('Rate limit exceeded')) {
            blockedCount++;
          }
        }
      }
      
      if (successCount <= 5 && blockedCount > 0) {
        addTestResult('Recalibration limits', 'success', `${successCount} allowed, ${blockedCount} blocked`);
        toast.success('Recalibration limits working!');
      } else {
        addTestResult('Recalibration limits', 'error', `${successCount} allowed, ${blockedCount} blocked`);
        toast.error('Recalibration limits not working!');
      }
    } catch (error: any) {
      addTestResult('Recalibration limits', 'error', error.message);
      toast.error('Recalibration test failed: ' + error.message);
    }
  };

  const clearResults = () => {
    setTestResults([]);
    toast.info('Test results cleared');
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Safeguards & Rate Limits Testing</CardTitle>
        <CardDescription>
          Test idempotency keys and rate limiting to prevent runaway jobs and abuse
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Test Controls */}
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={testWorkoutGeneration}
            disabled={isGenerating}
            variant="outline"
          >
            Test Multiple Clicks Protection
          </Button>
          <Button 
            onClick={testRateLimit}
            disabled={isGenerating}
            variant="outline"
          >
            Test Rate Limiting
          </Button>
          <Button 
            onClick={testRecalibrationLimits}
            disabled={recalibration.isPending}
            variant="outline"
          >
            Test Recalibration Limits
          </Button>
          <Button 
            onClick={clearResults}
            variant="ghost"
            size="sm"
          >
            Clear Results
          </Button>
        </div>

        {/* Test Results */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Test Results</h3>
          {testResults.length === 0 ? (
            <p className="text-muted-foreground">No tests run yet</p>
          ) : (
            testResults.map((result, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Badge 
                    variant={
                      result.result === 'success' ? 'default' : 
                      result.result === 'blocked' ? 'secondary' : 'destructive'
                    }
                  >
                    {result.result}
                  </Badge>
                  <span className="font-medium">{result.test}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm">{result.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {result.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Current Status */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Current Safeguards Status</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Workout Generation:</strong>
              <ul className="ml-4 list-disc">
                <li>Rate limit: 10 per hour</li>
                <li>Idempotency keys enabled</li>
                <li>Duplicate prevention active</li>
              </ul>
            </div>
            <div>
              <strong>Recalibration:</strong>
              <ul className="ml-4 list-disc">
                <li>Rate limit: 5 per day</li>
                <li>Idempotency keys enabled</li>
                <li>Admin override available</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};