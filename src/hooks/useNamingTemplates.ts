import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Re-export from attribute schemas hook
export { useMovements, useEquipments } from './useAttributeSchemas';

export interface NamingTemplate {
  id: string;
  scope: 'global' | 'movement' | 'equipment';
  scope_ref_id: string | null;
  locale: string;
  template: string;
  sep: string;
  is_active: boolean;
  version: number;
  created_at: string;
  updated_at: string;
}

export const useNamingTemplates = () => {
  return useQuery({
    queryKey: ['naming-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('naming_templates')
        .select('*')
        .eq('is_active', true)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data as NamingTemplate[];
    },
  });
};

export const useCreateNamingTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (template: Omit<NamingTemplate, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('naming_templates')
        .insert(template)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['naming-templates'] });
      toast.success('Naming template created successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to create template: ${error.message}`);
    },
  });
};

export const useUpdateNamingTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<NamingTemplate> & { id: string }) => {
      const { data, error } = await supabase
        .from('naming_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['naming-templates'] });
      toast.success('Naming template updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to update template: ${error.message}`);
    },
  });
};

export const useDeleteNamingTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('naming_templates')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['naming-templates'] });
      toast.success('Naming template deleted successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to delete template: ${error.message}`);
    },
  });
};

// Client-side exercise name builder for live preview
export const buildExerciseName = ({
  template,
  primaryMuscle = '',
  movement = '',
  equipment = '',
  attrs = {},
  handle = '',
  grip = '',
  separator = ' – ',
}: {
  template: string;
  primaryMuscle?: string;
  movement?: string;
  equipment?: string;
  attrs?: Record<string, any>;
  handle?: string;
  grip?: string;
  separator?: string;
}): string => {
  let res = template;

  // Replace core placeholders
  const core = {
    PrimaryMuscle: primaryMuscle,
    Movement: movement,
    Equipment: equipment,
    Handle: handle,
    Grip: grip,
  };

  Object.entries(core).forEach(([key, value]) => {
    res = res.replace(new RegExp(`\\{${key}\\}`, 'g'), value || '');
  });

  // Replace attribute placeholders (convert snake_case to PascalCase)
  Object.entries(attrs || {}).forEach(([key, val]) => {
    const pascalKey = key
      .split('_')
      .map(s => s.charAt(0).toUpperCase() + s.slice(1))
      .join('');
    const valueStr = val == null ? '' : val.toString();
    res = res.replace(new RegExp(`\\{${pascalKey}\\}`, 'g'), valueStr);
  });

  // Remove optional chunks {...?} when empty
  res = res.replace(/\{[^}]+\?\}/g, '');

  // Cleanup duplicate separators and trim
  res = res.replace(new RegExp(`(\\s*${separator.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\s*){2,}`, 'g'), separator);
  res = res.replace(new RegExp(`(^${separator.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\s*|\\s*${separator.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$)`, 'g'), '');
  
  return res.trim();
};