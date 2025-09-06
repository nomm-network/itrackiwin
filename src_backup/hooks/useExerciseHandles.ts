import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ExerciseGrip {
  id: string;
  slug: string;
  category: string;
  name: string;
  translations?: Array<{
    name: string;
    description?: string;
    language_code: string;
  }>;
}

export function useExerciseGrips(exerciseId?: string, lang: 'en' | 'ro' = 'en') {
  return useQuery({
    queryKey: ['exercise-grips', exerciseId, lang],
    enabled: !!exerciseId,
    queryFn: async (): Promise<ExerciseGrip[]> => {
      // First get the exercise to find its equipment
      const { data: exercise, error: exerciseError } = await supabase
        .from('exercises')
        .select('equipment_id, default_grip_ids')
        .eq('id', exerciseId)
        .single();

      if (exerciseError) throw exerciseError;

      // Get grips for this equipment
      const { data, error } = await supabase
        .from('equipment_grip_defaults')
        .select(`
          grip:grips!grip_id(
            id,
            slug,
            category,
            translations:grips_translations(
              name,
              description,
              language_code
            )
          )
        `)
        .eq('equipment_id', exercise.equipment_id);

      if (error) throw error;

      // Process and return grips
      return (data || []).map((item: any) => {
        const grip = item.grip;
        const translation = grip.translations?.find((t: any) => t.language_code === lang) || 
                          grip.translations?.[0];
        
        return {
          id: grip.id,
          slug: grip.slug,
          category: grip.category,
          name: translation?.name || grip.slug,
          translations: grip.translations
        };
      });
    },
  });
}