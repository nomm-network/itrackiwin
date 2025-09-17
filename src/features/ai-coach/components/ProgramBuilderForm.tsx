import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dumbbell, Target } from 'lucide-react';
import { useGenerateProgram, ProgramGenerationRequest } from '../hooks/useBroAICoach';
import { useAuth } from '@/hooks/useAuth';
import { useFitnessProfileCheck } from '@/features/health/fitness/hooks/useFitnessProfileCheck.hook';

interface ProgramBuilderFormProps {
  onProgramGenerated?: (programId: string) => void;
}

export function ProgramBuilderForm({ onProgramGenerated }: ProgramBuilderFormProps) {
  const { user } = useAuth();
  const { hasProfile, profile } = useFitnessProfileCheck();
  const generateProgram = useGenerateProgram();

  const handleGenerateProgram = async () => {
    try {
      console.log('Generating program using saved fitness profile...');
      // Send empty object since edge function reads from user's fitness profile
      const result = await generateProgram.mutateAsync({});
      if (result.data?.program_id && onProgramGenerated) {
        onProgramGenerated(result.data.program_id);
      }
    } catch (error) {
      console.error('Program generation failed:', error);
    }
  };

  if (!user) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="py-12 text-center">
          <Dumbbell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Authentication Required</h3>
          <p className="text-muted-foreground mb-4">
            You need to be logged in to use Bro AI Coach
          </p>
          <Button asChild>
            <a href="/auth">Sign In</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-2xl">
          <Dumbbell className="h-6 w-6 text-primary" />
          Bro AI Coach - Program Builder
        </CardTitle>
        <p className="text-muted-foreground">
          Generate your perfect workout program with AI
        </p>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          {/* AI Program Generation */}
          <div className="text-center space-y-4">
            <h3 className="text-lg font-medium">Generate Your AI Program</h3>
            <p className="text-muted-foreground">
              Your personalized workout program will be generated using AI
            </p>
            <Button 
              className="w-full" 
              size="lg"
              onClick={handleGenerateProgram}
              disabled={generateProgram.isPending}
            >
              <Dumbbell className="h-4 w-4 mr-2" />
              {generateProgram.isPending ? 'Generating Program...' : 'Generate AI Program'}
            </Button>
            {!hasProfile && (
              <p className="text-sm text-orange-600">
                Tip: Complete your <a href="/dashboard?cat=health&sub=configure&tab=profile" className="underline">fitness configuration</a> for better personalization
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}