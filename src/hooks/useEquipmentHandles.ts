import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface EquipmentHandle {
  handle_id: string;
  handle: {
    id: string;
    slug: string;
    translations: Array<{
      language_code: string;
      name: string;
      description?: string;
    }>;
  };
}

export function useEquipmentHandles(equipmentId?: string, lang: 'en' | 'ro' = 'en') {
  return useQuery({
    queryKey: ['equipment-handles', equipmentId, lang],
    enabled: !!equipmentId,
    queryFn: async (): Promise<EquipmentHandle[]> => {
      const { data, error } = await supabase
        .from('handle_equipment')
        .select(`
          handle_id,
          handle:handles (
            id,
            slug,
            translations:handle_translations (
              language_code,
              name,
              description
            )
          )
        `)
        .eq('equipment_id', equipmentId);

      if (error) throw error;

      return (data || []) as EquipmentHandle[];
    },
  });
}

export function pickEquipmentHandleName(row: EquipmentHandle, lang: 'en' | 'ro' = 'en') {
  const t = row.handle?.translations?.find(t => t.language_code === lang)
        || row.handle?.translations?.[0];
  return t?.name || row.handle?.slug || 'Handle';
}