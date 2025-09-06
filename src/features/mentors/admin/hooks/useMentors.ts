import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type MentorRow = {
  id: string;
  user_id: string;
  display_name: string | null;
  email: string | null;
  mentor_type: 'mentor' | 'coach';
  primary_category_id: string | null;
  is_active: boolean;
  created_at: string;
  // Database also returns these fields
  bio?: string | null;
  hourly_rate?: number | null;
  is_public?: boolean;
  updated_at?: string;
};

const qk = {
  all: ['admin','mentors'] as const,
  one: (id: string) => ['admin','mentors',id] as const,
};

export function useMentors() {
  return useQuery({
    queryKey: qk.all,
    queryFn: async (): Promise<MentorRow[]> => {
      const { data, error } = await supabase
        .from('v_admin_mentors_overview')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as MentorRow[];
    }
  });
}

export function useMentor(id: string | undefined) {
  return useQuery({
    enabled: !!id,
    queryKey: id ? qk.one(id) : qk.all,
    queryFn: async (): Promise<MentorRow | null> => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('v_admin_mentors_overview')
        .select('*')
        .eq('id', id)
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as MentorRow | null;
    }
  });
}