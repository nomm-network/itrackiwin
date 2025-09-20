// src/features/training/hooks/useTemplates.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TemplateRow {
  id: string;
  name: string | null;
  notes?: string | null;
  is_public?: boolean | null;
  created_at?: string;
  favorite?: boolean | null;
}

export function useTemplates() {
  return useQuery({
    queryKey: ['workout_templates'],
    queryFn: async (): Promise<TemplateRow[]> => {
      const { data, error } = await supabase
        .from('workout_templates')
        .select('id, name, notes, is_public, created_at, favorite')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
    staleTime: 0,
  });
}