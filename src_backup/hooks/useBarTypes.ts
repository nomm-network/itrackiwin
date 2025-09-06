import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useBarTypes = () => {
  return useQuery({
    queryKey: ['bar-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bar_types')
        .select('*')
        .order('default_weight');
      
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};