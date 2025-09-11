import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface EquipmentProfile {
  plate_profile_id?: string | null;
  stack_profile_id?: string | null;
}

// Fetch equipment profiles (global)
export function useEquipmentProfiles(equipmentId: string) {
  return useQuery({
    queryKey: ['equipment-profiles', equipmentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('equipment_profiles')
        .select('profile_type, profile_id')
        .eq('equipment_id', equipmentId);
      
      if (error) throw error;
      
      const result: EquipmentProfile = {};
      data?.forEach(item => {
        if (item.profile_type === 'plate') {
          result.plate_profile_id = item.profile_id;
        } else if (item.profile_type === 'stack') {
          result.stack_profile_id = item.profile_id;
        }
      });
      
      return result;
    }
  });
}

// Fetch gym-specific equipment profile overrides
export function useGymEquipmentProfiles(userGymId: string, equipmentId: string) {
  return useQuery({
    queryKey: ['gym-equipment-profiles', userGymId, equipmentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_gym_equipment_profiles')
        .select('plate_profile_id, stack_profile_id, notes')
        .eq('user_gym_id', userGymId)
        .eq('equipment_id', equipmentId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    }
  });
}

// Get effective profile (with gym override priority)
export function useEffectiveEquipmentProfile(equipmentId: string, userGymId?: string) {
  return useQuery({
    queryKey: ['effective-equipment-profile', equipmentId, userGymId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_equipment_profile', {
        p_equipment_id: equipmentId,
        p_user_gym_id: userGymId || null
      });
      
      if (error) throw error;
      return data?.[0] || { plate_profile_id: null, stack_profile_id: null };
    },
    enabled: !!equipmentId
  });
}

// Set global equipment profile (admin only)
export function useSetEquipmentProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      equipmentId, 
      plateProfileId, 
      stackProfileId 
    }: { 
      equipmentId: string; 
      plateProfileId?: string | null; 
      stackProfileId?: string | null; 
    }) => {
      // First, delete existing profiles for this equipment
      await supabase
        .from('equipment_profiles')
        .delete()
        .eq('equipment_id', equipmentId);
      
      // Insert new profiles
      const inserts = [];
      if (plateProfileId) {
        inserts.push({
          equipment_id: equipmentId,
          profile_type: 'plate',
          profile_id: plateProfileId
        });
      }
      if (stackProfileId) {
        inserts.push({
          equipment_id: equipmentId,
          profile_type: 'stack',
          profile_id: stackProfileId
        });
      }
      
      if (inserts.length > 0) {
        const { error } = await supabase
          .from('equipment_profiles')
          .insert(inserts);
        
        if (error) throw error;
      }
    },
    onSuccess: (_, { equipmentId }) => {
      queryClient.invalidateQueries({ queryKey: ['equipment-profiles', equipmentId] });
      queryClient.invalidateQueries({ queryKey: ['effective-equipment-profile'] });
      toast.success('Equipment profiles updated');
    },
    onError: (error) => {
      toast.error('Failed to update equipment profiles');
      console.error(error);
    }
  });
}

// Set gym equipment profile override
export function useSetGymEquipmentProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      userGymId, 
      equipmentId, 
      plateProfileId, 
      stackProfileId,
      notes
    }: { 
      userGymId: string;
      equipmentId: string; 
      plateProfileId?: string | null; 
      stackProfileId?: string | null; 
      notes?: string;
    }) => {
      const { error } = await supabase
        .from('user_gym_equipment_profiles')
        .upsert({
          user_gym_id: userGymId,
          equipment_id: equipmentId,
          plate_profile_id: plateProfileId,
          stack_profile_id: stackProfileId,
          notes
        }, {
          onConflict: 'user_gym_id,equipment_id'
        });
      
      if (error) throw error;
    },
    onSuccess: (_, { userGymId, equipmentId }) => {
      queryClient.invalidateQueries({ queryKey: ['gym-equipment-profiles', userGymId, equipmentId] });
      queryClient.invalidateQueries({ queryKey: ['effective-equipment-profile'] });
      toast.success('Gym equipment profile updated');
    },
    onError: (error) => {
      toast.error('Failed to update gym equipment profile');
      console.error(error);
    }
  });
}

// Fetch all plate profiles
export function usePlateProfiles() {
  return useQuery({
    queryKey: ['plate-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plate_profiles')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });
}

// Fetch all stack profiles
export function useStackProfiles() {
  return useQuery({
    queryKey: ['stack-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stack_profiles')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });
}