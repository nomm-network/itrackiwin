import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface EquipmentGrip {
  equipment_id: string;
  grip_id: string;
  is_default: boolean;
  grip: {
    id: string;
    slug: string;
    category: string;
    translations?: Array<{
      name: string;
      description?: string;
      language_code: string;
    }>;
  };
}

export const useEquipmentGrips = (equipmentId?: string) => {
  return useQuery({
    queryKey: ['equipment-grips', equipmentId],
    queryFn: async (): Promise<EquipmentGrip[]> => {
      const { data, error } = await supabase
        .from('equipment_grip_defaults')
        .select(`
          equipment_id,
          grip_id,
          is_default,
          grip:grips!grip_id(
            id,
            slug,
            category,
            translations:grips_translations(
              name,
              description,
              language_code
            )
          )
        `)
        .eq('equipment_id', equipmentId)
        .order('is_default', { ascending: false });

      if (error) throw error;

      return data || [];
    },
    enabled: !!equipmentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useAllEquipmentGrips = () => {
  return useQuery({
    queryKey: ['all-equipment-grips'],
    queryFn: async (): Promise<EquipmentGrip[]> => {
      const { data, error } = await supabase
        .from('equipment_grip_defaults')
        .select(`
          equipment_id,
          grip_id,
          is_default,
          grip:grips!grip_id(
            id,
            slug,
            category,
            translations:grips_translations(
              name,
              description,
              language_code
            )
          )
        `)
        .order('is_default', { ascending: false });

      if (error) throw error;

      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};