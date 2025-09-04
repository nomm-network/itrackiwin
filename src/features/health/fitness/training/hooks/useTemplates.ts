import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

type Template = { id: string; name: string | null };

export const useTemplates = () => {
  return useQuery({
    queryKey: ['training', 'templates'],
    queryFn: async (): Promise<Template[]> => {
      const { data, error } = await supabase
        .from('workout_templates')
        .select('id,name')
        .eq('is_public', true) // adjust if you also want private ones of current user
        .order('name', { ascending: true });

      if (error) throw error;
      return data ?? [];
    },
    staleTime: 60_000,
  });
};