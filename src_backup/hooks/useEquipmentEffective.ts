import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useEquipmentEffective = (equipmentId?: string, gymId?: string) => {
  return useQuery({
    queryKey: ['equipment-effective', equipmentId, gymId],
    queryFn: async () => {
      if (!equipmentId) return null;
      
      let query = supabase
        .from('v_equipment_effective')
        .select('*')
        .eq('equipment_id', equipmentId);
      
      if (gymId) {
        query = query.eq('gym_id', gymId);
      }
      
      const { data, error } = await query.maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!equipmentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};