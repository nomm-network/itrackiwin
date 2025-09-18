import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function ProgramGeneratorTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const runAcceptanceTest = async () => {
    setIsLoading(true);
    try {
      // Call the deterministic generator edge function
      const { data, error } = await supabase.functions.invoke('generate-deterministic-template', {
        body: {
          goal: 'recomp',
          experience_level: 'intermediate',
          training_days_per_week: 3,
          location_type: 'gym',
          available_equipment: [
            '33a8bf6b-5832-442e-964d-3f32070ea029', // olympic-barbell
            '1328932a-54fe-42fc-8846-6ead942c2b98', // dumbbell
            '027ddad8-75c1-4a75-a390-53e483760a6d'  // weight-plate
          ],
          priority_muscle_groups: [
            'eacf1326-62c3-4eab-b6d8-bb561d1ee4bf', // upper_abs
            'c05fbbd9-5e4a-4549-8628-79be7b92cf8a'  // lower_abs
          ],
          time_per_session_min: 65
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        toast({
          title: "Error",
          description: `Failed to generate program: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      setResult(data);
      toast({
        title: "Success", 
        description: "Program generated successfully!"
      });

      // Run validation queries
      await runValidationQueries();

    } catch (err: any) {
      console.error('Test error:', err);
      toast({
        title: "Error",
        description: `Test failed: ${err.message}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const runValidationQueries = async () => {
    try {
      // Query 1: Check recent programs
      const { data: programs, error: programsError } = await supabase
        .from('training_programs')
        .select(`
          id,
          name,
          goal,
          ai_generated,
          created_at
        `)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(5);

      // Query 2: Check template exercises for recent templates
      const { data: templateExercises, error: templateError } = await supabase
        .from('template_exercises')
        .select(`
          template_id,
          exercise_id,
          candidate_id,
          workout_templates!inner(created_at)
        `)
        .gte('workout_templates.created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (programsError) console.error('Programs query error:', programsError);
      if (templateError) console.error('Template exercises query error:', templateError);

      console.log('Recent programs:', programs);
      console.log('Template exercises:', templateExercises);
      
    } catch (err) {
      console.error('Validation query error:', err);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Program Generator Acceptance Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          <p>Test parameters:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Goal: recomp</li>
            <li>Experience: intermediate</li>
            <li>Training days: 3 per week</li>
            <li>Location: gym</li>
            <li>Equipment: Olympic barbell, dumbbells, weight plates</li>
            <li>Priority muscles: Upper/lower abs</li>
            <li>Session time: 65 minutes</li>
          </ul>
        </div>

        <Button 
          onClick={runAcceptanceTest}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Running Test...' : 'Run Acceptance Test'}
        </Button>

        {result && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Result:</h4>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}