import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, CheckCircle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface SeedExercisesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ExerciseSeed {
  name: string;
  slug: string;
  variant?: string;
  equipment: string;
  bodyPart: string;
  primaryMuscle: string;
  movementPattern: string;
  tags: string[];
  aliases: string[];
  skillLevel: 'low' | 'medium' | 'high';
  loadType: string;
  description: string;
}

const EXERCISE_SEEDS: ExerciseSeed[] = [
  // Chest Press Variants
  {
    name: 'Flat Barbell Bench Press',
    slug: 'flat-barbell-bench-press',
    variant: 'flat',
    equipment: 'barbell',
    bodyPart: 'chest',
    primaryMuscle: 'pectoralis-major',
    movementPattern: 'push',
    tags: ['press', 'barbell', 'chest', 'compound'],
    aliases: ['bench press', 'flat press', 'barbell press'],
    skillLevel: 'medium',
    loadType: 'barbell',
    description: 'Primary chest exercise performed on a flat bench with a barbell.'
  },
  {
    name: 'Incline Barbell Bench Press',
    slug: 'incline-barbell-bench-press',
    variant: 'incline',
    equipment: 'barbell',
    bodyPart: 'chest',
    primaryMuscle: 'pectoralis-major-clavicular',
    movementPattern: 'push',
    tags: ['press', 'barbell', 'chest', 'incline', 'compound'],
    aliases: ['incline press', 'inclined bench press', 'upper chest press'],
    skillLevel: 'medium',
    loadType: 'barbell',
    description: 'Incline chest exercise targeting upper pectorals with a barbell.'
  },
  {
    name: 'Decline Barbell Bench Press',
    slug: 'decline-barbell-bench-press',
    variant: 'decline',
    equipment: 'barbell',
    bodyPart: 'chest',
    primaryMuscle: 'pectoralis-major-sternal',
    movementPattern: 'push',
    tags: ['press', 'barbell', 'chest', 'decline', 'compound'],
    aliases: ['decline press', 'negative bench', 'declined press', 'lower chest press'],
    skillLevel: 'medium',
    loadType: 'barbell',
    description: 'Decline chest exercise targeting lower pectorals with a barbell.'
  },
  {
    name: 'Flat Dumbbell Bench Press',
    slug: 'flat-dumbbell-bench-press',
    variant: 'flat',
    equipment: 'dumbbell',
    bodyPart: 'chest',
    primaryMuscle: 'pectoralis-major',
    movementPattern: 'push',
    tags: ['press', 'dumbbell', 'chest', 'compound'],
    aliases: ['dumbbell press', 'db press', 'flat db press'],
    skillLevel: 'medium',
    loadType: 'dual_load',
    description: 'Chest exercise with dumbbells allowing greater range of motion.'
  },
  {
    name: 'Incline Dumbbell Bench Press',
    slug: 'incline-dumbbell-bench-press',
    variant: 'incline',
    equipment: 'dumbbell',
    bodyPart: 'chest',
    primaryMuscle: 'pectoralis-major-clavicular',
    movementPattern: 'push',
    tags: ['press', 'dumbbell', 'chest', 'incline', 'compound'],
    aliases: ['incline db press', 'inclined dumbbell press'],
    skillLevel: 'medium',
    loadType: 'dual_load',
    description: 'Incline dumbbell exercise for upper chest development.'
  },
  // Cable Fly Variants
  {
    name: 'High Cable Fly',
    slug: 'high-cable-fly',
    variant: 'high',
    equipment: 'cable-machine',
    bodyPart: 'chest',
    primaryMuscle: 'pectoralis-major-sternal',
    movementPattern: 'isolation',
    tags: ['fly', 'cable', 'chest', 'isolation'],
    aliases: ['high cable chest fly', 'high pulley fly'],
    skillLevel: 'low',
    loadType: 'stack',
    description: 'Isolation exercise targeting chest using high cable position.'
  },
  {
    name: 'Mid Cable Fly',
    slug: 'mid-cable-fly',
    variant: 'mid',
    equipment: 'cable-machine',
    bodyPart: 'chest',
    primaryMuscle: 'pectoralis-major',
    movementPattern: 'isolation',
    tags: ['fly', 'cable', 'chest', 'isolation'],
    aliases: ['middle cable fly', 'mid pulley fly'],
    skillLevel: 'low',
    loadType: 'stack',
    description: 'Chest isolation exercise using mid-level cable position.'
  },
  {
    name: 'Low Cable Fly',
    slug: 'low-cable-fly',
    variant: 'low',
    equipment: 'cable-machine',
    bodyPart: 'chest',
    primaryMuscle: 'pectoralis-major-clavicular',
    movementPattern: 'isolation',
    tags: ['fly', 'cable', 'chest', 'isolation'],
    aliases: ['low cable chest fly', 'low pulley fly', 'upward fly'],
    skillLevel: 'low',
    loadType: 'stack',
    description: 'Isolation exercise for upper chest using low cable position.'
  },
  // Back Exercises
  {
    name: 'Barbell Row',
    slug: 'barbell-row',
    equipment: 'barbell',
    bodyPart: 'back',
    primaryMuscle: 'latissimus-dorsi',
    movementPattern: 'pull',
    tags: ['row', 'barbell', 'back', 'compound'],
    aliases: ['bent over row', 'barbell bent row'],
    skillLevel: 'medium',
    loadType: 'barbell',
    description: 'Compound pulling exercise for back development.'
  },
  {
    name: 'Pull-up',
    slug: 'pull-up',
    equipment: 'bodyweight',
    bodyPart: 'back',
    primaryMuscle: 'latissimus-dorsi',
    movementPattern: 'pull',
    tags: ['pull', 'bodyweight', 'back', 'compound'],
    aliases: ['pullup', 'chin up'],
    skillLevel: 'high',
    loadType: 'bodyweight',
    description: 'Bodyweight pulling exercise targeting lats and upper back.'
  },
  // Leg Exercises
  {
    name: 'Barbell Back Squat',
    slug: 'barbell-back-squat',
    equipment: 'barbell',
    bodyPart: 'legs',
    primaryMuscle: 'quadriceps',
    movementPattern: 'squat',
    tags: ['squat', 'barbell', 'legs', 'compound'],
    aliases: ['back squat', 'squat'],
    skillLevel: 'medium',
    loadType: 'barbell',
    description: 'Primary leg exercise targeting quadriceps, glutes, and hamstrings.'
  },
  {
    name: 'Romanian Deadlift',
    slug: 'romanian-deadlift',
    equipment: 'barbell',
    bodyPart: 'legs',
    primaryMuscle: 'hamstrings',
    movementPattern: 'hinge',
    tags: ['deadlift', 'barbell', 'legs', 'hamstrings', 'compound'],
    aliases: ['RDL', 'stiff leg deadlift'],
    skillLevel: 'medium',
    loadType: 'barbell',
    description: 'Hip hinge exercise targeting hamstrings and glutes.'
  }
];

export default function SeedExercisesDialog({ open, onOpenChange }: SeedExercisesDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  const seedMutation = useMutation({
    mutationFn: async (exerciseSeeds: ExerciseSeed[]) => {
      const results = [];
      
      for (const seed of exerciseSeeds) {
        try {
          // Create exercise (would need actual equipment_id from database)
          const exerciseData = {
            slug: seed.slug,
            custom_display_name: seed.name,
            owner_user_id: null, // System exercise
            equipment_id: 'dummy-equipment-id', // Would need to look up actual equipment IDs
            is_public: true,
            movement_pattern: seed.movementPattern as 'squat' | 'hinge' | 'horizontal_push' | 'vertical_push' | 'horizontal_pull' | 'vertical_pull' | 'lunge' | 'carry' | 'rotation' | 'isolation',
            exercise_skill_level: seed.skillLevel,
            load_type: seed.loadType as 'fixed' | 'barbell' | 'single_load' | 'dual_load' | 'stack' | 'bodyweight',
            is_unilateral: false,
            // requires_handle removed - using equipment-grip compatibility instead
            allows_grips: true,
            is_bar_loaded: seed.equipment === 'barbell',
            tags: seed.tags,
            popularity_rank: 100, // High popularity for seeded exercises
          };

          const { data: exercise, error: exerciseError } = await supabase
            .from('exercises')
            .insert(exerciseData)
            .select()
            .single();

          if (exerciseError) throw exerciseError;

          // Create translation
          await supabase
            .from('exercises_translations')
            .insert({
              exercise_id: exercise.id,
              language_code: 'en',
              name: seed.name,
              description: seed.description,
            });

          // Create aliases
          if (seed.aliases.length > 0) {
            const aliasInserts = seed.aliases.map(alias => ({
              exercise_id: exercise.id,
              alias: alias,
            }));

            await supabase
              .from('exercise_aliases')
              .insert(aliasInserts);
          }

          results.push({ name: seed.name, success: true });
        } catch (error) {
          console.error(`Failed to seed ${seed.name}:`, error);
          results.push({ name: seed.name, success: false, error });
        }
      }

      return results;
    },
    onSuccess: (results) => {
      const successCount = results.filter(r => r.success).length;
      const failCount = results.length - successCount;
      
      queryClient.invalidateQueries({ queryKey: ['admin_exercises'] });
      toast({
        title: "Seeding Complete",
        description: `${successCount} exercises created successfully${failCount > 0 ? `, ${failCount} failed` : ''}`,
      });
      
      if (failCount === 0) {
        onOpenChange(false);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to seed exercises",
        variant: "destructive",
      });
    },
  });

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedExercises([]);
    } else {
      setSelectedExercises(EXERCISE_SEEDS.map(ex => ex.slug));
    }
    setSelectAll(!selectAll);
  };

  const handleExerciseToggle = (slug: string) => {
    setSelectedExercises(prev => {
      if (prev.includes(slug)) {
        return prev.filter(s => s !== slug);
      } else {
        return [...prev, slug];
      }
    });
  };

  const handleSeed = () => {
    const exercisesToSeed = EXERCISE_SEEDS.filter(ex => selectedExercises.includes(ex.slug));
    seedMutation.mutate(exercisesToSeed);
  };

  // Group exercises by category
  const exercisesByCategory = EXERCISE_SEEDS.reduce((acc, exercise) => {
    const category = exercise.bodyPart;
    if (!acc[category]) acc[category] = [];
    acc[category].push(exercise);
    return acc;
  }, {} as Record<string, ExerciseSeed[]>);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Seed Hybrid Model Exercises
            <Badge variant="secondary">~50 Exercises</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-sm">Hybrid Model Seeding</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p><strong>Separate exercises:</strong> Flat/Incline/Decline variants</p>
              <p><strong>Tags & aliases:</strong> For enhanced search</p>
              <p><strong>Runtime choices:</strong> Handles/grips remain configurable</p>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={selectAll}
                onCheckedChange={handleSelectAll}
              />
              <Label>Select All ({EXERCISE_SEEDS.length} exercises)</Label>
            </div>
            <Badge variant="outline">
              {selectedExercises.length} selected
            </Badge>
          </div>

          <div className="space-y-4">
            {Object.entries(exercisesByCategory).map(([category, exercises]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="text-base capitalize flex items-center gap-2">
                    {category}
                    <Badge variant="secondary" className="text-xs">
                      {exercises.length} exercises
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {exercises.map((exercise) => (
                      <div 
                        key={exercise.slug}
                        className="flex items-start space-x-2 p-3 border rounded-lg hover:bg-muted/50"
                      >
                        <Checkbox
                          checked={selectedExercises.includes(exercise.slug)}
                          onCheckedChange={() => handleExerciseToggle(exercise.slug)}
                          className="mt-1"
                        />
                        <div className="flex-1 space-y-1">
                          <div className="font-medium text-sm">{exercise.name}</div>
                          <p className="text-xs text-muted-foreground">
                            {exercise.description}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {exercise.variant && (
                              <Badge variant="outline" className="text-xs">
                                {exercise.variant}
                              </Badge>
                            )}
                            <Badge variant="secondary" className="text-xs">
                              {exercise.equipment}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {exercise.skillLevel}
                            </Badge>
                          </div>
                          {exercise.aliases.length > 0 && (
                            <p className="text-xs text-muted-foreground">
                              Aliases: {exercise.aliases.join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSeed}
              disabled={selectedExercises.length === 0 || seedMutation.isPending}
              className="min-w-[120px]"
            >
              {seedMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Seeding...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Seed {selectedExercises.length} Exercises
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}