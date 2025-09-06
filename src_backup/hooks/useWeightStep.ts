import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useWeightStep = (
  loadType?: string,
  sideMinPlateKg?: number,
  singleMinIncrementKg?: number
) => {
  return useQuery({
    queryKey: ['weight-step', loadType, sideMinPlateKg, singleMinIncrementKg],
    queryFn: async () => {
      if (!loadType) return 0;
      
      const { data, error } = await supabase.rpc('next_weight_step_kg', {
        p_load_type: loadType as 'none' | 'single_load' | 'dual_load' | 'stack',
        p_side_min_plate_kg: sideMinPlateKg || null,
        p_single_min_increment_kg: singleMinIncrementKg || null
      });
      
      if (error) throw error;
      return data as number;
    },
    enabled: !!loadType,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};