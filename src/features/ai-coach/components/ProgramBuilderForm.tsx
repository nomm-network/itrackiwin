import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Dumbbell, Home, Target, Calendar, Clock, Zap } from 'lucide-react';
import { ProgramGenerationRequest, useGenerateProgram } from '../hooks/useBroAICoach';

const programSchema = z.object({
  goal: z.enum(['recomp', 'fat_loss', 'muscle_gain', 'strength', 'general_fitness']),
  experience_level: z.enum(['new', 'returning', 'intermediate', 'advanced', 'very_experienced']),
  training_days_per_week: z.number().min(1).max(7),
  location_type: z.enum(['home', 'gym']),
  available_equipment: z.array(z.string()),
  priority_muscle_groups: z.array(z.string()),
  time_per_session_min: z.number().min(15).max(180).optional(),
});

const goalOptions = [
  { value: 'muscle_gain', label: 'Build Muscle', icon: '💪' },
  { value: 'fat_loss', label: 'Lose Fat', icon: '🔥' },
  { value: 'strength', label: 'Get Stronger', icon: '🏋️' },
  { value: 'recomp', label: 'Body Recomposition', icon: '⚡' },
  { value: 'general_fitness', label: 'General Fitness', icon: '🏃' },
];

const experienceOptions = [
  { value: 'new', label: 'Complete Beginner', description: 'Never worked out before' },
  { value: 'returning', label: 'Returning', description: 'Worked out before but taking a break' },
  { value: 'intermediate', label: 'Intermediate', description: '6+ months of consistent training' },
  { value: 'advanced', label: 'Advanced', description: '2+ years of consistent training' },
  { value: 'very_experienced', label: 'Very Experienced', description: '5+ years of training' },
];

const equipmentOptions = [
  'bodyweight', 'dumbbells', 'barbell', 'pull-up-bar', 'resistance-bands',
  'cable-machine', 'machine', 'kettlebells', 'bench', 'squat-rack'
];

const muscleGroups = [
  'chest', 'back', 'shoulders', 'biceps', 'triceps', 
  'quads', 'hamstrings', 'glutes', 'calves', 'abs'
];

interface ProgramBuilderFormProps {
  onProgramGenerated?: (programId: string) => void;
}

export function ProgramBuilderForm({ onProgramGenerated }: ProgramBuilderFormProps) {
  const generateProgram = useGenerateProgram();
  
  const form = useForm<ProgramGenerationRequest>({
    resolver: zodResolver(programSchema),
    defaultValues: {
      goal: 'muscle_gain',
      experience_level: 'new',
      training_days_per_week: 3,
      location_type: 'gym',
      available_equipment: ['dumbbells', 'barbell'],
      priority_muscle_groups: [],
      time_per_session_min: 60,
    },
  });

  const onSubmit = async (data: ProgramGenerationRequest) => {
    try {
      const result = await generateProgram.mutateAsync(data);
      if (result.program_id && onProgramGenerated) {
        onProgramGenerated(result.program_id);
      }
    } catch (error) {
      console.error('Program generation failed:', error);
    }
  };

  const watchedLocation = form.watch('location_type');

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-2xl">
          <Dumbbell className="h-6 w-6 text-primary" />
          Bro AI Coach - Program Builder
        </CardTitle>
        <p className="text-muted-foreground">
          Let's create your perfect workout program based on your goals and experience
        </p>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="text-center mb-6">
              <p className="text-muted-foreground">
                Configure your fitness goals and preferences in{' '}
                <a 
                  href="/dashboard?cat=health&sub=configure" 
                  className="text-primary hover:underline font-medium"
                >
                  Fitness Configuration
                </a>{' '}
                to generate better programs, or proceed with current settings.
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              disabled={generateProgram.isPending}
            >
              {generateProgram.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Generating Your Program...
                </>
              ) : (
                <>
                  <Dumbbell className="h-4 w-4 mr-2" />
                  Generate My Program
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}