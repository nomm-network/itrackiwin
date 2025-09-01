import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface HandleSelectorOptions {
  exerciseId: string;
}

export const useHandleSelector = ({ exerciseId }: HandleSelectorOptions) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getDefaultHandles = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('exercise_default_handles')
        .select(`
          handle_id,
          handles!inner (
            id,
            slug,
            handles_translations (
              language_code,
              name,
              description
            )
          )
        `)
        .eq('exercise_id', exerciseId);

      if (fetchError) throw fetchError;

      return data || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch default handles';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [exerciseId]);

  const getDefaultGrips = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('exercise_default_grips')
        .select(`
          grip_id,
          grips!inner (
            id,
            slug,
            grips_translations (
              language_code,
              name,
              description
            )
          )
        `)
        .eq('exercise_id', exerciseId);

      if (fetchError) throw fetchError;

      return data || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch default grips';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [exerciseId]);

  const saveTemplateSelection = useCallback(async (templateExerciseId: string, handleId?: string, gripIds?: string[]) => {
    setIsLoading(true);
    setError(null);

    try {
      const updateData: any = {};
      if (handleId) updateData.handle_id = handleId;
      if (gripIds) updateData.grip_ids = gripIds;

      const { error: updateError } = await supabase
        .from('template_exercises')
        .update(updateData)
        .eq('id', templateExerciseId);

      if (updateError) throw updateError;

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save template selection';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    getDefaultHandles,
    getDefaultGrips,
    saveTemplateSelection,
    isLoading,
    error
  };
};