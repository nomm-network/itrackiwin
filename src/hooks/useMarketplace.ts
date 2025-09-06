import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface MarketplaceGym {
  id: string;
  slug: string;
  name: string;
  city: string;
  country: string;
  photo_url: string | null;
  active_members: number;
  active_coaches: number;
}

export interface MarketplaceMentor {
  mentor_profile_id: string;
  headline: string | null;
  bio: string | null;
  slug: string | null;
  is_active: boolean;
  categories: string[] | null;
}

export function useMarketplaceGyms(city?: string, country?: string, sortBy?: string) {
  return useQuery({
    queryKey: ['marketplace-gyms', city, country, sortBy],
    queryFn: async () => {
      let query = supabase
        .from('v_marketplace_gyms')
        .select('*');

      if (city) {
        query = query.ilike('city', `%${city}%`);
      }
      if (country) {
        query = query.ilike('country', `%${country}%`);
      }

      // Apply sorting
      if (sortBy === 'members_desc') {
        query = query.order('active_members', { ascending: false });
      } else if (sortBy === 'coaches_desc') {
        query = query.order('active_coaches', { ascending: false });
      } else {
        query = query.order('name');
      }

      const { data, error } = await query.limit(20);
      if (error) throw error;
      return data as MarketplaceGym[];
    },
    staleTime: 300000, // 5 minutes
  });
}

export function useMarketplaceMentors(category?: string, city?: string) {
  return useQuery({
    queryKey: ['marketplace-mentors', category, city],
    queryFn: async () => {
      let query = supabase
        .from('v_marketplace_mentors')
        .select('*');

      if (category) {
        query = query.contains('categories', [category]);
      }

      const { data, error } = await query.limit(20);
      if (error) throw error;
      return data as MarketplaceMentor[];
    },
    staleTime: 300000, // 5 minutes
  });
}

export function useMarketplaceLocalMentors(city?: string, country?: string) {
  return useQuery({
    queryKey: ['marketplace-local-mentors', city, country],
    queryFn: async () => {
      let query = supabase
        .from('v_marketplace_local_mentors')
        .select('*');

      if (city) {
        query = query.ilike('city', `%${city}%`);
      }
      if (country) {
        query = query.ilike('country', `%${country}%`);
      }

      const { data, error } = await query.limit(20);
      if (error) throw error;
      return data;
    },
    staleTime: 300000, // 5 minutes
  });
}

export function useGymBySlug(slug: string) {
  return useQuery({
    queryKey: ['gym-by-slug', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gyms')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!slug,
    staleTime: 300000, // 5 minutes
  });
}

export function useMentorById(mentorId: string) {
  return useQuery({
    queryKey: ['mentor-by-id', mentorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mentor_profiles')
        .select('*')
        .eq('id', mentorId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!mentorId,
    staleTime: 300000, // 5 minutes
  });
}