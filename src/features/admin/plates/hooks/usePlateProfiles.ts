import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PlateProfilePlate {
  id?: string;
  weight_kg: number;
  count_per_side: number;
  display_order: number;
}

export interface PlateProfile {
  id?: string;
  name: string;
  default_unit: 'kg' | 'lb';
  notes?: string;
  is_active: boolean;
  plate_profile_plates?: PlateProfilePlate[];
}

// List all plate profiles
export function usePlateProfiles() {
  return useQuery({
    queryKey: ['admin-plate-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plate_profiles')
        .select(`
          id,
          name,
          default_unit,
          is_active,
          plate_profile_plates(weight_kg, count_per_side)
        `)
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });
}

// Get single plate profile with plates
export function usePlateProfile(id: string) {
  return useQuery({
    queryKey: ['admin-plate-profile', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plate_profiles')
        .select(`
          id,
          name,
          default_unit,
          notes,
          is_active,
          plate_profile_plates(
            id,
            weight_kg,
            count_per_side,
            display_order
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });
}

// Create or update plate profile
export function useUpsertPlateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (profile: PlateProfile) => {
      const { plate_profile_plates, ...profileData } = profile;
      
      // Upsert profile
      const { data: savedProfile, error: profileError } = await supabase
        .from('plate_profiles')
        .upsert(profileData)
        .select('id')
        .single();
      
      if (profileError) throw profileError;
      
      // Delete existing plates
      await supabase
        .from('plate_profile_plates')
        .delete()
        .eq('profile_id', savedProfile.id);
      
      // Insert new plates
      if (plate_profile_plates && plate_profile_plates.length > 0) {
        const platesData = plate_profile_plates.map(plate => ({
          profile_id: savedProfile.id,
          weight_kg: plate.weight_kg,
          count_per_side: plate.count_per_side,
          display_order: plate.display_order
        }));
        
        const { error: platesError } = await supabase
          .from('plate_profile_plates')
          .insert(platesData);
        
        if (platesError) throw platesError;
      }
      
      return savedProfile.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-plate-profiles'] });
      toast.success('Plate profile saved successfully');
    },
    onError: (error) => {
      toast.error('Failed to save plate profile');
      console.error(error);
    }
  });
}

// Duplicate plate profile
export function useDuplicatePlateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (profileId: string) => {
      // Get original profile
      const { data: original, error: fetchError } = await supabase
        .from('plate_profiles')
        .select(`
          name,
          default_unit,
          notes,
          plate_profile_plates(weight_kg, count_per_side, display_order)
        `)
        .eq('id', profileId)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Create copy
      const copyProfile: PlateProfile = {
        name: `${original.name} (Copy)`,
        default_unit: original.default_unit,
        notes: original.notes,
        is_active: true,
        plate_profile_plates: original.plate_profile_plates || []
      };
      
      // Use upsert mutation
      const { data: newProfile, error: createError } = await supabase
        .from('plate_profiles')
        .insert({
          name: copyProfile.name,
          default_unit: copyProfile.default_unit,
          notes: copyProfile.notes,
          is_active: copyProfile.is_active
        })
        .select('id')
        .single();
      
      if (createError) throw createError;
      
      // Copy plates
      if (copyProfile.plate_profile_plates && copyProfile.plate_profile_plates.length > 0) {
        const platesData = copyProfile.plate_profile_plates.map(plate => ({
          profile_id: newProfile.id,
          weight_kg: plate.weight_kg,
          count_per_side: plate.count_per_side,
          display_order: plate.display_order
        }));
        
        const { error: platesError } = await supabase
          .from('plate_profile_plates')
          .insert(platesData);
        
        if (platesError) throw platesError;
      }
      
      return newProfile.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-plate-profiles'] });
      toast.success('Plate profile duplicated successfully');
    },
    onError: (error) => {
      toast.error('Failed to duplicate plate profile');
      console.error(error);
    }
  });
}

// Archive/unarchive plate profile
export function useArchivePlateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('plate_profiles')
        .update({ is_active })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: (_, { is_active }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-plate-profiles'] });
      toast.success(`Plate profile ${is_active ? 'activated' : 'archived'} successfully`);
    },
    onError: (error) => {
      toast.error('Failed to update plate profile');
      console.error(error);
    }
  });
}

// Delete plate profile
export function useDeletePlateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      // First delete associated plates
      await supabase
        .from('plate_profile_plates')
        .delete()
        .eq('profile_id', id);
      
      // Then delete profile
      const { error } = await supabase
        .from('plate_profiles')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-plate-profiles'] });
      toast.success('Plate profile deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete plate profile');
      console.error(error);
    }
  });
}