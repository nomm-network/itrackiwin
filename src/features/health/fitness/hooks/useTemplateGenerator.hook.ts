import { useMutation, useQuery } from '@tanstack/react-query';
import { generateTemplate, type TemplateGeneratorInputs, type GeneratedTemplate } from '../services/templateGenerator.service';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useTemplateGenerator() {
  return useMutation({
    mutationFn: async (inputs: TemplateGeneratorInputs): Promise<GeneratedTemplate> => {
      return generateTemplate(inputs);
    },
    onError: (error) => {
      console.error('Template generation failed:', error);
      toast.error('Failed to generate workout template');
    }
  });
}

export function useSaveGeneratedTemplate() {
  return useMutation({
    mutationFn: async ({ 
      template, 
      exercises, 
      userId 
    }: { 
      template: GeneratedTemplate['template']; 
      exercises: GeneratedTemplate['exercises']; 
      userId: string;
    }) => {
      // Save template
      const { data: savedTemplate, error: templateError } = await supabase
        .from('workout_templates')
        .insert({
          user_id: userId,
          name: template.name,
          description: template.description,
          notes: template.notes,
          estimated_duration_minutes: template.estimated_duration_minutes,
          difficulty_level: template.difficulty_level
        })
        .select('id')
        .single();

      if (templateError || !savedTemplate) {
        throw new Error('Failed to save template');
      }

      // Save exercises
      const templateExercises = exercises.map(ex => ({
        template_id: savedTemplate.id,
        exercise_id: ex.exerciseId,
        order_index: ex.orderIndex,
        default_sets: ex.defaultSets,
        target_reps: ex.targetReps,
        rep_range_min: ex.repRangeMin,
        rep_range_max: ex.repRangeMax,
        rest_seconds: ex.restSeconds,
        weight_unit: ex.weightUnit,
        notes: ex.notes,
        progression_policy: ex.progressionPolicy
      }));

      const { error: exercisesError } = await supabase
        .from('template_exercises')
        .insert(templateExercises);

      if (exercisesError) {
        throw new Error('Failed to save template exercises');
      }

      return savedTemplate;
    },
    onSuccess: () => {
      toast.success('Workout template saved successfully');
    },
    onError: (error) => {
      console.error('Failed to save template:', error);
      toast.error('Failed to save workout template');
    }
  });
}