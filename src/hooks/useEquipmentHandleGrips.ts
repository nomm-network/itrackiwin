import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface EquipmentHandleGrip {
  grip_id: string;
  is_default: boolean;
  grip: {
    id: string;
    slug: string;
    category: string;
    grips_translations: Array<{
      language_code: string;
      name: string;
      description?: string;
    }>;
  };
}

export function useEquipmentHandleGrips(
  equipmentId?: string, 
  handleId?: string, 
  lang: 'en' | 'ro' = 'en'
) {
  return useQuery({
    queryKey: ['equipment-handle-grips', equipmentId, handleId, lang],
    enabled: !!(equipmentId && handleId),
    queryFn: async (): Promise<EquipmentHandleGrip[]> => {
      // Get equipment handle grips first
      const { data: gripData, error } = await supabase
        .from('equipment_handle_grips')
        .select('grip_id, is_default')
        .eq('equipment_id', equipmentId)
        .eq('handle_id', handleId);

      if (error) throw error;

      if (!gripData || gripData.length === 0) {
        return [];
      }

      // Get grip details with translations
      const gripIds = gripData.map(g => g.grip_id);
      const { data: gripsWithTranslations, error: gripsError } = await supabase
        .from('grips')
        .select(`
          id,
          slug,
          category,
          grips_translations (
            language_code,
            name,
            description
          )
        `)
        .in('id', gripIds);

      if (gripsError) throw gripsError;

      // Combine the data
      const result = gripData.map(gripEntry => {
        const grip = gripsWithTranslations?.find(g => g.id === gripEntry.grip_id);
        return {
          grip_id: gripEntry.grip_id,
          is_default: gripEntry.is_default,
          grip: grip || {
            id: gripEntry.grip_id,
            slug: '',
            category: '',
            grips_translations: []
          }
        };
      }) as EquipmentHandleGrip[];

      // Sort by default first, then by name
      return result.sort((a, b) => {
        if (a.is_default === b.is_default) {
          const aName = a.grip?.grips_translations?.find(t => t.language_code === lang)?.name || a.grip?.slug || '';
          const bName = b.grip?.grips_translations?.find(t => t.language_code === lang)?.name || b.grip?.slug || '';
          return aName.localeCompare(bName);
        }
        return a.is_default ? -1 : 1;
      });
    },
  });
}

export function pickEquipmentGripName(row: EquipmentHandleGrip, lang: 'en' | 'ro' = 'en') {
  const t = row.grip?.grips_translations?.find(t => t.language_code === lang)
        || row.grip?.grips_translations?.[0];
  return t?.name || row.grip?.slug || 'Grip';
}