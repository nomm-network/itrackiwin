import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface EquipmentGripDefault {
  equipment_id: string;
  grip_id: string;
  is_default: boolean;
  created_at: string;
  equipment?: {
    id: string;
    slug: string;
    equipment_type: string;
    translations?: Array<{
      name: string;
      description?: string;
      language_code: string;
    }>;
  };
  grip?: {
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

export const useEquipmentGripDefaults = () => {
  return useQuery({
    queryKey: ['equipment-grip-defaults'],
    queryFn: async (): Promise<EquipmentGripDefault[]> => {
      const { data, error } = await supabase
        .from('equipment_grip_defaults')
        .select(`
          equipment_id,
          grip_id,
          is_default,
          created_at,
          equipment:equipment!equipment_id(
            id,
            slug,
            equipment_type,
            translations:equipment_translations(
              name,
              description,
              language_code
            )
          ),
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
        .order('equipment_id');

      if (error) throw error;

      return (data || []) as any;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateEquipmentGripDefault = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ equipment_id, grip_id, is_default }: { 
      equipment_id: string; 
      grip_id: string; 
      is_default: boolean;
    }) => {
      const { data, error } = await supabase
        .from('equipment_grip_defaults')
        .insert({ equipment_id, grip_id, is_default })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment-grip-defaults'] });
      queryClient.invalidateQueries({ queryKey: ['equipment-grips'] });
      toast.success('Equipment grip compatibility created successfully');
    },
    onError: (error) => {
      console.error('Error creating equipment grip compatibility:', error);
      toast.error('Failed to create equipment grip compatibility');
    },
  });
};

export const useDeleteEquipmentGripDefault = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ equipment_id, grip_id }: { 
      equipment_id: string; 
      grip_id: string;
    }) => {
      const { error } = await supabase
        .from('equipment_grip_defaults')
        .delete()
        .eq('equipment_id', equipment_id)
        .eq('grip_id', grip_id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment-grip-defaults'] });
      queryClient.invalidateQueries({ queryKey: ['equipment-grips'] });
      toast.success('Equipment grip compatibility deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting equipment grip compatibility:', error);
      toast.error('Failed to delete equipment grip compatibility');
    },
  });
};

export const useToggleEquipmentGripDefault = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ equipment_id, grip_id, is_default }: { 
      equipment_id: string; 
      grip_id: string;
      is_default: boolean;
    }) => {
      const { error } = await supabase
        .from('equipment_grip_defaults')
        .update({ is_default })
        .eq('equipment_id', equipment_id)
        .eq('grip_id', grip_id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment-grip-defaults'] });
      queryClient.invalidateQueries({ queryKey: ['equipment-grips'] });
      toast.success('Default grip setting updated');
    },
    onError: (error) => {
      console.error('Error updating default grip setting:', error);
      toast.error('Failed to update default grip setting');
    },
  });
};