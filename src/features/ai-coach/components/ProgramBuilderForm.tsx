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
import { useAuth } from '@/hooks/useAuth';

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
  const { user } = useAuth();
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
          Create your perfect workout program based on your goals and experience
        </p>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Goal Selection */}
            <FormField
              control={form.control}
              name="goal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    What's your main goal?
                  </FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {goalOptions.map((option) => (
                        <Button
                          key={option.value}
                          type="button"
                          variant={field.value === option.value ? "default" : "outline"}
                          className="h-auto p-4"
                          onClick={() => field.onChange(option.value)}
                        >
                          <div className="text-center">
                            <div className="text-2xl mb-1">{option.icon}</div>
                            <div className="text-sm">{option.label}</div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Experience Level */}
            <FormField
              control={form.control}
              name="experience_level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Experience Level</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your experience level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {experienceOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-sm text-muted-foreground">{option.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Training Days */}
            <FormField
              control={form.control}
              name="training_days_per_week"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Training Days Per Week: {field.value}
                  </FormLabel>
                  <FormControl>
                    <Slider
                      min={1}
                      max={7}
                      step={1}
                      value={[field.value]}
                      onValueChange={(values) => field.onChange(values[0])}
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Location */}
            <FormField
              control={form.control}
              name="location_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    Where will you train?
                  </FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        type="button"
                        variant={field.value === "gym" ? "default" : "outline"}
                        className="h-16"
                        onClick={() => field.onChange("gym")}
                      >
                        <div className="text-center">
                          <div className="text-2xl mb-1">🏋️</div>
                          <div>Gym</div>
                        </div>
                      </Button>
                      <Button
                        type="button"
                        variant={field.value === "home" ? "default" : "outline"}
                        className="h-16"
                        onClick={() => field.onChange("home")}
                      >
                        <div className="text-center">
                          <div className="text-2xl mb-1">🏠</div>
                          <div>Home</div>
                        </div>
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Equipment */}
            <FormField
              control={form.control}
              name="available_equipment"
              render={() => (
                <FormItem>
                  <FormLabel>Available Equipment</FormLabel>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {equipmentOptions.map((equipment) => (
                      <FormField
                        key={equipment}
                        control={form.control}
                        name="available_equipment"
                        render={({ field }) => {
                          return (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(equipment)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, equipment])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== equipment
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal capitalize">
                                {equipment.replace('-', ' ')}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Session Duration */}
            <FormField
              control={form.control}
              name="time_per_session_min"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Session Duration: {field.value} minutes
                  </FormLabel>
                  <FormControl>
                    <Slider
                      min={15}
                      max={180}
                      step={15}
                      value={[field.value || 60]}
                      onValueChange={(values) => field.onChange(values[0])}
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />


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