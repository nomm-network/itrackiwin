import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';

export interface ExerciseTranslation {
  exercise_id: string;
  name: string;
  description?: string;
}

// Hook to get translations for multiple exercises
export const useExerciseTranslations = (exerciseIds: string[]) => {
  const { i18n } = useTranslation();
  const language = i18n.language || 'en';
  
  return useQuery({
    queryKey: ['exercise-translations', exerciseIds, language],
    queryFn: async (): Promise<ExerciseTranslation[]> => {
      if (!exerciseIds.length) return [];
      
      const { data, error } = await supabase
        .from('exercises_translations')
        .select('exercise_id, name, description')
        .in('exercise_id', exerciseIds)
        .eq('language_code', language);
      
      if (error) throw error;
      
      // If no translations found for current language, fallback to English
      if (!data.length && language !== 'en') {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('exercises_translations')
          .select('exercise_id, name, description')
          .in('exercise_id', exerciseIds)
          .eq('language_code', 'en');
        
        if (fallbackError) throw fallbackError;
        return fallbackData || [];
      }
      
      return data || [];
    },
    enabled: exerciseIds.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to get translation for a single exercise
export const useExerciseTranslation = (exerciseId: string) => {
  const { i18n } = useTranslation();
  const language = i18n.language || 'en';
  
  return useQuery({
    queryKey: ['exercise-translation', exerciseId, language],
    queryFn: async (): Promise<ExerciseTranslation | null> => {
      if (!exerciseId) return null;
      
      const { data, error } = await supabase
        .from('exercises_translations')
        .select('exercise_id, name, description')
        .eq('exercise_id', exerciseId)
        .eq('language_code', language)
        .single();
      
      if (error) {
        // If no translation found for current language, fallback to English
        if (language !== 'en') {
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('exercises_translations')
            .select('exercise_id, name, description')
            .eq('exercise_id', exerciseId)
            .eq('language_code', 'en')
            .single();
          
          if (fallbackError) throw fallbackError;
          return fallbackData;
        }
        throw error;
      }
      
      return data;
    },
    enabled: !!exerciseId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Utility function to get exercise name from translation data
export const getExerciseName = (
  exerciseId: string, 
  translations?: ExerciseTranslation[]
): string => {
  const translation = translations?.find(t => t.exercise_id === exerciseId);
  return translation?.name || `Exercise ${exerciseId}`;
};

// Utility function to get exercise description from translation data
export const getExerciseDescription = (
  exerciseId: string, 
  translations?: ExerciseTranslation[]
): string | undefined => {
  const translation = translations?.find(t => t.exercise_id === exerciseId);
  return translation?.description;
};