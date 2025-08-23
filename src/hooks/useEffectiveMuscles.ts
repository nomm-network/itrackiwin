import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface EffectiveMuscle {
  muscle_id: string;
  base_role: string;
  effective_score: number;
  primary_muscle: boolean;
}

export const useEffectiveMuscles = (
  exerciseId: string,
  gripIds?: string[],
  equipmentId?: string
) => {
  return useQuery({
    queryKey: ['effective-muscles', exerciseId, gripIds, equipmentId],
    queryFn: async (): Promise<EffectiveMuscle[]> => {
      const { data, error } = await supabase.rpc('get_effective_muscles', {
        _exercise_id: exerciseId,
        _grip_ids: gripIds || null,
        _equipment_id: equipmentId || null
      });

      if (error) throw error;
      return data || [];
    },
    enabled: !!exerciseId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};