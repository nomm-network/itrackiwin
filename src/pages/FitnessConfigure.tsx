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
import { Target, Calendar, Clock, Settings, Save } from 'lucide-react';
import { useFitnessProfile, useUpsertFitnessProfile } from '@/features/ai-coach';

const fitnessProfileSchema = z.object({
  goal: z.enum(['recomp', 'fat_loss', 'muscle_gain', 'strength', 'general_fitness']),
  experience_level: z.enum(['new', 'returning', 'intermediate', 'advanced', 'very_experienced']),
  training_days_per_week: z.number().min(1).max(7),
  location_type: z.enum(['home', 'gym']),
  available_equipment: z.array(z.string()),
  priority_muscle_groups: z.array(z.string()),
  time_per_session_min: z.number().min(15).max(180).optional(),
});

const goalOptions = [
  { value: 'muscle_gain', label: 'Build Muscle', icon: '💪', description: 'Focus on hypertrophy and size gains' },
  { value: 'fat_loss', label: 'Lose Fat', icon: '🔥', description: 'Burn calories and lose body fat' },
  { value: 'strength', label: 'Get Stronger', icon: '🏋️', description: 'Increase maximum strength and power' },
  { value: 'recomp', label: 'Body Recomposition', icon: '⚡', description: 'Build muscle while losing fat' },
  { value: 'general_fitness', label: 'General Fitness', icon: '🏃', description: 'Overall health and wellness' },
];

const experienceOptions = [
  { value: 'new', label: 'Complete Beginner', description: 'Never worked out before' },
  { value: 'returning', label: 'Returning', description: 'Worked out before but taking a break' },
  { value: 'intermediate', label: 'Intermediate', description: '6+ months of consistent training' },
  { value: 'advanced', label: 'Advanced', description: '2+ years of consistent training' },
  { value: 'very_experienced', label: 'Very Experienced', description: '5+ years of training' },
];

const equipmentOptions = [
  { value: 'bodyweight', label: 'Bodyweight' },
  { value: 'dumbbells', label: 'Dumbbells' },
  { value: 'barbell', label: 'Barbell' },
  { value: 'pull-up-bar', label: 'Pull-up Bar' },
  { value: 'resistance-bands', label: 'Resistance Bands' },
  { value: 'cable-machine', label: 'Cable Machine' },
  { value: 'machine', label: 'Machines' },
  { value: 'kettlebells', label: 'Kettlebells' },
  { value: 'bench', label: 'Bench' },
  { value: 'squat-rack', label: 'Squat Rack' },
];

const muscleGroups = [
  { value: 'chest', label: 'Chest' },
  { value: 'back', label: 'Back' },
  { value: 'shoulders', label: 'Shoulders' },
  { value: 'biceps', label: 'Biceps' },
  { value: 'triceps', label: 'Triceps' },
  { value: 'quads', label: 'Quadriceps' },
  { value: 'hamstrings', label: 'Hamstrings' },
  { value: 'glutes', label: 'Glutes' },
  { value: 'calves', label: 'Calves' },
  { value: 'abs', label: 'Abs' },
];

export default function FitnessConfigure() {
  const { data: profile } = useFitnessProfile();
  const upsertProfile = useUpsertFitnessProfile();
  
  const form = useForm({
    resolver: zodResolver(fitnessProfileSchema),
    defaultValues: {
      goal: 'muscle_gain',
      experience_level: profile?.experience_level || 'new',
      training_days_per_week: profile?.training_days_per_week || 3,
      location_type: profile?.location_type || 'gym',
      available_equipment: profile?.available_equipment || ['dumbbells', 'barbell'],
      priority_muscle_groups: profile?.priority_muscle_groups || [],
      time_per_session_min: profile?.time_per_session_min || 60,
    },
  });

  const onSubmit = async (data: any) => {
    try {
      await upsertProfile.mutateAsync(data);
    } catch (error) {
      console.error('Failed to save fitness profile:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Settings className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Fitness Configuration</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Set up your fitness profile to get personalized AI program recommendations
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Fitness Profile</CardTitle>
          <p className="text-muted-foreground">
            This information will be used to generate personalized workout programs
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
                      Primary Fitness Goal
                    </FormLabel>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="text-2xl">{option.icon}</div>
                              <div>
                                <div className="font-medium">{option.label}</div>
                                <div className="text-sm text-muted-foreground">
                                  {option.description}
                                </div>
                              </div>
                            </div>
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
                    <FormLabel className="text-lg">Experience Level</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
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
                      Training Days Per Week
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
                      Session Duration
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
                    <FormLabel className="text-lg">Training Location</FormLabel>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { value: 'gym', label: 'Gym', icon: '🏋️', description: 'Full equipment access' },
                        { value: 'home', label: 'Home', icon: '🏠', description: 'Limited equipment' },
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
                            <div className="text-sm text-muted-foreground">{option.description}</div>
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
                    <FormLabel className="text-lg">Available Equipment</FormLabel>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {equipmentOptions.map((item) => (
                        <FormField
                          key={item.value}
                          control={form.control}
                          name="available_equipment"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={item.value}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(item.value)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, item.value])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== item.value
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {item.label}
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
                      Priority Muscle Groups (Optional)
                    </FormLabel>
                    <div className="flex flex-wrap gap-2">
                      {muscleGroups.map((muscle) => (
                        <Badge
                          key={muscle.value}
                          variant={field.value.includes(muscle.value) ? "default" : "outline"}
                          className="cursor-pointer hover:scale-105 transition-transform"
                          onClick={() => {
                            const current = field.value || [];
                            if (current.includes(muscle.value)) {
                              field.onChange(current.filter(m => m !== muscle.value));
                            } else {
                              field.onChange([...current, muscle.value]);
                            }
                          }}
                        >
                          {muscle.label}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Priority muscles will get extra volume in generated programs
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={upsertProfile.isPending}
              >
                {upsertProfile.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Saving Profile...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Fitness Profile
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}