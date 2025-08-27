import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useBars = () => {
  return useQuery({
    queryKey: ['bars'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('equipment')
        .select(`
          id,
          weight_kg,
          equipment_translations!inner(name, description)
        `)
        .eq('kind', 'bar')
        .eq('equipment_translations.language_code', 'en')
        .order('weight_kg');
      
      if (error) throw error;
      
      // Transform the data to flatten the translations
      return data?.map(bar => ({
        id: bar.id,
        weight_kg: bar.weight_kg || 0,
        name: bar.equipment_translations[0]?.name || 'Unknown Bar',
        description: bar.equipment_translations[0]?.description || ''
      })) || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};