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
    if (!profile) return;
    
    try {
      // Map fitness profile to program generation request
      const programData: ProgramGenerationRequest = {
        goal: profile.goal as "recomp" | "fat_loss" | "muscle_gain" | "strength" | "general_fitness",
        experience_level: profile.experience_level as "new" | "returning" | "intermediate" | "advanced" | "very_experienced",
        training_days_per_week: profile.days_per_week || 3,
        location_type: (profile.location_type || 'gym') as "home" | "gym",
        available_equipment: profile.available_equipment || ['dumbbells'],
        priority_muscle_groups: profile.priority_muscle_groups || [],
        time_per_session_min: profile.preferred_session_minutes || 60,
      };

      console.log('Generating program with data:', programData);
      const result = await generateProgram.mutateAsync(programData);
      if (result.program_id && onProgramGenerated) {
        onProgramGenerated(result.program_id);
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
        {!hasProfile ? (
          <div className="space-y-6">
            {/* Fitness Config Required */}
            <Card className="border-2 border-orange-200 bg-orange-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <Target className="h-5 w-5 text-orange-600" />
                  <h3 className="font-semibold text-orange-800">Complete Your Fitness Configuration First</h3>
                </div>
                <p className="text-orange-700 mb-4">
                  To generate a personalized AI program, you need to complete your fitness configuration including goals, experience level, available equipment, and preferences.
                </p>
                <Button asChild variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-100">
                  <a href="/dashboard?cat=health&sub=configure&tab=profile">
                    <Target className="h-4 w-4 mr-2" />
                    Complete Fitness Configuration
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            {/* AI Program Generation */}
            <div className="text-center space-y-4">
              <h3 className="text-lg font-medium">Ready to Generate Your AI Program!</h3>
              <p className="text-muted-foreground">
                Based on your fitness configuration: {profile?.goal}, {profile?.experience_level} level, {profile?.days_per_week} days/week
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
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}