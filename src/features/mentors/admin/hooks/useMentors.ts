import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface MentorOverview {
  id: string;
  user_id: string;
  display_name: string;
  mentor_type: 'mentor' | 'coach';
  primary_category_id: string | null;
  is_public: boolean;
  bio: string | null;
  hourly_rate: number | null;
  created_at: string;
  updated_at: string;
}

export const useMentors = () => {
  return useQuery({
    queryKey: ['admin', 'mentors'],
    queryFn: async (): Promise<MentorOverview[]> => {
      const { data, error } = await supabase
        .from('v_admin_mentors_overview')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching mentors:', error);
        throw error;
      }

      return data || [];
    },
  });
};

export const useMentor = (id: string | undefined) => {
  return useQuery({
    queryKey: ['admin', 'mentor', id],
    queryFn: async (): Promise<MentorOverview | null> => {
      if (!id || id === 'new') return null;

      const { data, error } = await supabase
        .from('v_admin_mentors_overview')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching mentor:', error);
        throw error;
      }

      return data;
    },
    enabled: !!id,
  });
};