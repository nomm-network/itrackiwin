import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type ExerciseHandleRow = {
  handle_id: string;
  is_default: boolean;
  handle: {
    id: string;
    slug: string;
    translations: { language_code: string; name: string; description?: string }[];
  };
};

export function useExerciseHandles(exerciseId?: string, lang: 'en' | 'ro' = 'en') {
  return useQuery({
    queryKey: ['exercise-handles', exerciseId, lang],
    enabled: !!exerciseId,
    queryFn: async (): Promise<ExerciseHandleRow[]> => {
      const { data, error } = await supabase
        .from('exercise_handles')
        .select(`
          handle_id, is_default,
          handle:handles (
            id, slug,
            translations:handle_translations (language_code, name, description)
          )
        `)
        .eq('exercise_id', exerciseId);

      if (error) throw error;

      // Sort by default first
      const rows = (data || []) as ExerciseHandleRow[];
      return rows.sort((a,b) => (a.is_default === b.is_default ? 0 : a.is_default ? -1 : 1));
    },
  });
}

export function pickHandleName(row: ExerciseHandleRow, lang: 'en' | 'ro' = 'en') {
  const t = row.handle?.translations?.find(t => t.language_code === lang)
        || row.handle?.translations?.[0];
  return t?.name || row.handle?.slug || 'Handle';
}