import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type AttributeScope = 'global' | 'movement' | 'equipment';

export interface AttributeSchema {
  id: string;
  scope: AttributeScope;
  scope_ref_id: string | null;
  title: string;
  schema_json: any;
  is_active: boolean;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface Movement {
  id: string;
  name: string;
  created_at: string;
}

export interface Equipment {
  id: string;
  name: string;
  created_at: string;
}

export const useAttributeSchemas = () => {
  return useQuery({
    queryKey: ['attribute-schemas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('attribute_schemas')
        .select('*')
        .eq('is_active', true)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data as AttributeSchema[];
    },
  });
};

export const useMovements = () => {
  return useQuery({
    queryKey: ['movements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('movements')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as Movement[];
    },
  });
};

export const useEquipments = () => {
  return useQuery({
    queryKey: ['equipments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('equipments')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as Equipment[];
    },
  });
};

export const useEffectiveSchema = (movementId?: string, equipmentId?: string) => {
  return useQuery({
    queryKey: ['effective-schema', movementId, equipmentId],
    queryFn: async () => {
      if (!movementId || !equipmentId) return null;
      
      const { data, error } = await supabase.rpc('get_effective_attribute_schema', {
        p_movement_id: movementId,
        p_equipment_id: equipmentId
      });

      if (error) throw error;
      return data;
    },
    enabled: !!(movementId && equipmentId),
  });
};

export const useCreateAttributeSchema = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (schema: Omit<AttributeSchema, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('attribute_schemas')
        .insert(schema)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attribute-schemas'] });
      toast.success('Attribute schema created successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to create schema: ${error.message}`);
    },
  });
};

export const useUpdateAttributeSchema = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AttributeSchema> & { id: string }) => {
      const { data, error } = await supabase
        .from('attribute_schemas')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attribute-schemas'] });
      toast.success('Attribute schema updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to update schema: ${error.message}`);
    },
  });
};

export const useDeleteAttributeSchema = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('attribute_schemas')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attribute-schemas'] });
      toast.success('Attribute schema deleted successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to delete schema: ${error.message}`);
    },
  });
};