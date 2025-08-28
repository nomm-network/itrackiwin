import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface HandleWithEquipment {
  id: string;
  slug: string;
  name: string;
  description?: string;
  equipment_types: string[];
  equipment_kinds: string[];
  load_types: string[];
  load_mediums: string[];
}

export const useHandlesByEquipment = (exerciseId?: string) => {
  return useQuery({
    queryKey: ['handles-by-equipment', exerciseId],
    queryFn: async (): Promise<HandleWithEquipment[]> => {
      // Get all handles
      const { data: handlesData, error: handlesError } = await supabase
        .from('handles')
        .select(`
          id,
          slug,
          translations:handle_translations(
            name,
            description,
            language_code
          )
        `);

      if (handlesError) throw handlesError;

      // Get handle equipment rules
      const { data: rulesData, error: rulesError } = await supabase
        .from('handle_equipment_rules')
        .select(`
          handle_id,
          equipment_type,
          kind,
          load_type,
          load_medium
        `);

      if (rulesError) throw rulesError;

      // Get direct handle-equipment mappings
      const { data: directData, error: directError } = await supabase
        .from('handle_equipment')
        .select(`
          handle_id,
          equipment!inner(
            equipment_type,
            kind,
            load_type,
            load_medium
          )
        `);

      if (directError) throw directError;

      // Process handles with their equipment compatibility
      const handleMap = new Map<string, HandleWithEquipment>();
      
      // Initialize handles
      handlesData?.forEach(handle => {
        handleMap.set(handle.id, {
          id: handle.id,
          slug: handle.slug,
          name: handle.translations?.[0]?.name || 
                handle.slug.split('-').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' '),
          description: handle.translations?.[0]?.description,
          equipment_types: [],
          equipment_kinds: [],
          load_types: [],
          load_mediums: []
        });
      });

      // Add equipment info from rules
      rulesData?.forEach(rule => {
        const handle = handleMap.get(rule.handle_id);
        if (handle) {
          if (rule.equipment_type && !handle.equipment_types.includes(rule.equipment_type)) {
            handle.equipment_types.push(rule.equipment_type);
          }
          if (rule.kind && !handle.equipment_kinds.includes(rule.kind)) {
            handle.equipment_kinds.push(rule.kind);
          }
          if (rule.load_type && !handle.load_types.includes(rule.load_type)) {
            handle.load_types.push(rule.load_type);
          }
          if (rule.load_medium && !handle.load_mediums.includes(rule.load_medium)) {
            handle.load_mediums.push(rule.load_medium);
          }
        }
      });

      // Add equipment info from direct mappings
      directData?.forEach(mapping => {
        const handle = handleMap.get(mapping.handle_id);
        const equipment = mapping.equipment as any;
        if (handle && equipment) {
          if (equipment.equipment_type && !handle.equipment_types.includes(equipment.equipment_type)) {
            handle.equipment_types.push(equipment.equipment_type);
          }
          if (equipment.kind && !handle.equipment_kinds.includes(equipment.kind)) {
            handle.equipment_kinds.push(equipment.kind);
          }
          if (equipment.load_type && !handle.load_types.includes(equipment.load_type)) {
            handle.load_types.push(equipment.load_type);
          }
          if (equipment.load_medium && !handle.load_mediums.includes(equipment.load_medium)) {
            handle.load_mediums.push(equipment.load_medium);
          }
        }
      });

      return Array.from(handleMap.values()).sort((a, b) => a.name.localeCompare(b.name));
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to get compatible equipment for a handle
export const useEquipmentByHandle = (handleId?: string) => {
  return useQuery({
    queryKey: ['equipment-by-handle', handleId],
    queryFn: async () => {
      if (!handleId) return [];

      // Get direct mappings
      const { data: directData, error: directError } = await supabase
        .from('handle_equipment')
        .select(`
          equipment_id,
          equipment!inner(
            id,
            slug,
            equipment_type,
            kind,
            load_type,
            load_medium,
            translations:equipment_translations(
              name,
              description,
              language_code
            )
          )
        `)
        .eq('handle_id', handleId);

      if (directError) throw directError;

      // Get rule-based mappings
      const { data: rulesData, error: rulesError } = await supabase
        .from('handle_equipment_rules')
        .select('equipment_type, kind, load_type, load_medium')
        .eq('handle_id', handleId);

      if (rulesError) throw rulesError;

      // Get equipment that matches rules
      let ruleBasedEquipment: any[] = [];
      if (rulesData && rulesData.length > 0) {
        const { data: equipmentData, error: equipmentError } = await supabase
          .from('equipment')
          .select(`
            id,
            slug,
            equipment_type,
            kind,
            load_type,
            load_medium,
            translations:equipment_translations(
              name,
              description,
              language_code
            )
          `);

        if (equipmentError) throw equipmentError;

        // Filter equipment that matches rules
        ruleBasedEquipment = equipmentData?.filter(equipment => {
          return rulesData.some(rule => {
            return (
              (!rule.equipment_type || equipment.equipment_type === rule.equipment_type) &&
              (!rule.kind || equipment.kind === rule.kind) &&
              (!rule.load_type || equipment.load_type === rule.load_type) &&
              (!rule.load_medium || equipment.load_medium === rule.load_medium)
            );
          });
        }) || [];
      }

      // Combine direct and rule-based results
      const directEquipment = directData?.map(item => item.equipment) || [];
      const allEquipment = [...directEquipment, ...ruleBasedEquipment];

      // Remove duplicates and format
      const uniqueEquipment = allEquipment.reduce((acc, equipment) => {
        if (!acc.find(e => e.id === equipment.id)) {
          acc.push({
            ...equipment,
            name: equipment.translations?.[0]?.name || 
                  equipment.slug?.split('-').map((word: string) => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ') || 'Unknown Equipment'
          });
        }
        return acc;
      }, [] as any[]);

      return uniqueEquipment;
    },
    enabled: !!handleId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Helper to group handles by their primary equipment type
export const groupHandlesByEquipmentType = (handles: HandleWithEquipment[]) => {
  const groups: Record<string, HandleWithEquipment[]> = {};
  
  handles.forEach(handle => {
    // Use the first equipment type as primary categorization
    const primaryType = handle.equipment_types[0] || 'other';
    
    if (!groups[primaryType]) {
      groups[primaryType] = [];
    }
    groups[primaryType].push(handle);
  });
  
  return groups;
};