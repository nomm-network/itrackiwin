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
  bio?: string | null;
  hourly_rate?: number | null;
  is_public?: boolean;
  updated_at?: string;
  gym_id?: string | null;
  gym_name?: string | null;
  category_slug?: string | null;
  category_name?: string | null;
};

const qk = {
  all: ['admin','mentors'] as const,
  one: (id: string) => ['admin','mentors',id] as const,
};

export function useMentors() {
  return useQuery({
    queryKey: qk.all,
    queryFn: async (): Promise<MentorRow[]> => {
      console.log('🔍 [useMentors] Calling v_admin_mentors_overview...');
      const { data, error } = await supabase
        .from('v_admin_mentors_overview')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        console.error('❌ [useMentors] Error:', error);
        throw error;
      }
      console.log('✅ [useMentors] Success:', data);
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
      console.log('🔍 [useMentor] Fetching mentor:', id);
      const { data, error } = await supabase
        .from('v_admin_mentors_overview')
        .select('*')
        .eq('id', id)
        .limit(1)
        .maybeSingle();
      if (error) {
        console.error('❌ [useMentor] Error:', error);
        throw error;
      }
      console.log('✅ [useMentor] Success:', data);
      return data as MentorRow | null;
    }
  });
}