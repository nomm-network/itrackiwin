import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface EquipmentHandleGripRow {
  grip_id: string;
  grips: {
    id: string;
    slug: string;
  };
}

export function useEquipmentHandleGrips(equipmentId?: string, handleId?: string, lang: 'en' | 'ro' = 'en') {
  return useQuery({
    queryKey: ['equipment-handle-grips', equipmentId, handleId, lang],
    enabled: !!equipmentId,
    queryFn: async (): Promise<EquipmentHandleGripRow[]> => {
      let query = supabase
        .from('equipment_handle_grips')
        .select(`
          grip_id,
          grips!inner (
            id, slug
          )
        `)
        .eq('equipment_id', equipmentId);

      // Filter by handle if provided
      if (handleId) {
        query = query.eq('handle_id', handleId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Filter to only orientation grips and remove duplicates
      const orientationGrips = ['overhand', 'underhand', 'neutral', 'mixed'];
      const uniqueGrips = data?.reduce((acc, curr) => {
        if (orientationGrips.includes(curr.grips.slug)) {
          const existing = acc.find(g => g.grip_id === curr.grip_id);
          if (!existing) {
            acc.push(curr);
          }
        }
        return acc;
      }, [] as EquipmentHandleGripRow[]) || [];

      // Sort by preferred order
      return uniqueGrips.sort((a, b) => {
        const orderA = orientationGrips.indexOf(a.grips.slug);
        const orderB = orientationGrips.indexOf(b.grips.slug);
        return orderA - orderB;
      });
    },
  });
}

export function pickEquipmentGripName(row: EquipmentHandleGripRow, lang: 'en' | 'ro' = 'en') {
  // For now, format the slug into a readable name
  return row.grips?.slug?.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ') || 'Grip';
}