import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface EquipmentHandleRow {
  handle_id: string;
  is_default: boolean;
  handles: {
    id: string;
    slug: string;
    handles_translations: { language_code: string; name: string; description?: string }[];
  };
}

export function useEquipmentHandles(equipmentId?: string, lang: 'en' | 'ro' = 'en') {
  return useQuery({
    queryKey: ['equipment-handles', equipmentId, lang],
    enabled: !!equipmentId,
    queryFn: async (): Promise<EquipmentHandleRow[]> => {
      const { data, error } = await supabase
        .from('equipment_handle_grips')
        .select(`
          handle_id, is_default,
          handles!inner (
            id, slug,
            handles_translations (language_code, name, description)
          )
        `)
        .eq('equipment_id', equipmentId);

      if (error) throw error;

      // Remove duplicates and sort by default first
      const uniqueHandles = (data as any)?.reduce((acc: any, curr: any) => {
        const existing = acc.find(h => h.handle_id === curr.handle_id);
        if (!existing) {
          acc.push(curr);
        } else if (curr.is_default && !existing.is_default) {
          Object.assign(existing, curr);
        }
        return acc;
      }, [] as EquipmentHandleRow[]) || [];

      return uniqueHandles.sort((a, b) => (a.is_default === b.is_default ? 0 : a.is_default ? -1 : 1)) as any;
    },
  });
}

export function pickEquipmentHandleName(row: EquipmentHandleRow, lang: 'en' | 'ro' = 'en') {
  const t = row.handles?.handles_translations?.find(t => t.language_code === lang)
        || row.handles?.handles_translations?.[0];
  return t?.name || row.handles?.slug || 'Handle';
}