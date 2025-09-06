import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type Gym = {
  id: string;
  name: string;
  address?: string;
  city?: string;
};

export const useGyms = () => {
  return useQuery({
    queryKey: ['gyms'],
    queryFn: async (): Promise<Gym[]> => {
      console.log('🔍 [useGyms] Fetching gyms...');
      const { data, error } = await supabase
        .from('gyms')
        .select('id, name, address, city')
        .order('name');
      
      if (error) {
        console.error('❌ [useGyms] Error:', error);
        throw error;
      }
      console.log('✅ [useGyms] Success:', data);
      return data as Gym[];
    }
  });
};