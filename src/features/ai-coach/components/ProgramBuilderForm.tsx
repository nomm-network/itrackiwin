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
            {/* Goal Selection */}
            <FormField
              control={form.control}
              name="goal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-lg">
                    <Target className="h-5 w-5" />
                    What's your primary goal?
                  </FormLabel>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {goalOptions.map((option) => (
                      <Card
                        key={option.value}
                        className={`cursor-pointer transition-all hover:scale-105 ${
                          field.value === option.value 
                            ? 'ring-2 ring-primary bg-primary/5' 
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={() => field.onChange(option.value)}
                      >
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl mb-2">{option.icon}</div>
                          <div className="font-medium">{option.label}</div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
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
                  <FormLabel className="flex items-center gap-2 text-lg">
                    <Zap className="h-5 w-5" />
                    What's your experience level?
                  </FormLabel>
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
                  <FormLabel className="flex items-center gap-2 text-lg">
                    <Calendar className="h-5 w-5" />
                    How many days per week can you train?
                  </FormLabel>
                  <div className="px-4">
                    <Slider
                      min={1}
                      max={7}
                      step={1}
                      value={[field.value]}
                      onValueChange={(value) => field.onChange(value[0])}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-2">
                      <span>1 day</span>
                      <span className="font-medium text-primary">{field.value} days</span>
                      <span>7 days</span>
                    </div>
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
                  <FormLabel className="flex items-center gap-2 text-lg">
                    <Clock className="h-5 w-5" />
                    How long can you train per session?
                  </FormLabel>
                  <div className="px-4">
                    <Slider
                      min={15}
                      max={180}
                      step={15}
                      value={[field.value || 60]}
                      onValueChange={(value) => field.onChange(value[0])}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-2">
                      <span>15 min</span>
                      <span className="font-medium text-primary">{field.value || 60} minutes</span>
                      <span>3 hours</span>
                    </div>
                  </div>
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
                  <FormLabel className="flex items-center gap-2 text-lg">
                    <Home className="h-5 w-5" />
                    Where will you be training?
                  </FormLabel>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { value: 'gym', label: 'Gym', icon: '🏋️' },
                      { value: 'home', label: 'Home', icon: '🏠' },
                    ].map((option) => (
                      <Card
                        key={option.value}
                        className={`cursor-pointer transition-all hover:scale-105 ${
                          field.value === option.value 
                            ? 'ring-2 ring-primary bg-primary/5' 
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={() => field.onChange(option.value)}
                      >
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl mb-2">{option.icon}</div>
                          <div className="font-medium">{option.label}</div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
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
                  <FormLabel className="text-lg">
                    What equipment do you have access to?
                  </FormLabel>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {equipmentOptions.map((item) => (
                      <FormField
                        key={item}
                        control={form.control}
                        name="available_equipment"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={item}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(item)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, item])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== item
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal capitalize">
                                {item.replace('-', ' ')}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Priority Muscle Groups */}
            <FormField
              control={form.control}
              name="priority_muscle_groups"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">
                    Which muscle groups do you want to prioritize? (optional)
                  </FormLabel>
                  <div className="flex flex-wrap gap-2">
                    {muscleGroups.map((muscle) => (
                      <Badge
                        key={muscle}
                        variant={field.value.includes(muscle) ? "default" : "outline"}
                        className="cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => {
                          const current = field.value || [];
                          if (current.includes(muscle)) {
                            field.onChange(current.filter(m => m !== muscle));
                          } else {
                            field.onChange([...current, muscle]);
                          }
                        }}
                      >
                        {muscle.charAt(0).toUpperCase() + muscle.slice(1)}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Priority muscles will get extra volume in your program
                  </p>
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