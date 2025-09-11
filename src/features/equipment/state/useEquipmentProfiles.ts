import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Query Keys
export const equipmentKeys = {
  all: ['equipment'] as const,
  profiles: () => [...equipmentKeys.all, 'profiles'] as const,
  profile: (id: string) => [...equipmentKeys.all, 'profile', id] as const,
  gym: (gymId: string) => [...equipmentKeys.all, 'gym', gymId] as const,
  gymEffective: (gymId: string) => [...equipmentKeys.all, 'gym', gymId, 'effective'] as const,
};

// Global Equipment Profiles
export function useGlobalProfiles() {
  return useQuery({
    queryKey: equipmentKeys.profiles(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plate_profiles')
        .select(`
          *,
          plate_profile_plates(*)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

export function useEquipmentProfile(profileId: string) {
  return useQuery({
    queryKey: equipmentKeys.profile(profileId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plate_profiles')
        .select(`
          *,
          plate_profile_plates(*)
        `)
        .eq('id', profileId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!profileId,
  });
}

// Gym Equipment
export function useGymEquipment(gymId: string) {
  return useQuery({
    queryKey: equipmentKeys.gym(gymId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gym_weight_configs')
        .select(`
          *,
          plate_profiles(*),
          dumbbell_sets(*),
          fixed_bars(*),
          stack_profiles(*)
        `)
        .eq('gym_id', gymId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!gymId,
  });
}

export function useGymEffectiveEquipment(gymId: string, unit: 'kg' | 'lb' = 'kg') {
  return useQuery({
    queryKey: [...equipmentKeys.gymEffective(gymId), unit],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_effective_plate_profile', {
        _gym_id: gymId,
        _unit: unit
      });

      if (error) throw error;
      return data;
    },
    enabled: !!gymId,
  });
}

// Mutations
export function useCreateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: {
      name: string;
      default_unit: 'kg' | 'lb';
      notes?: string;
      plates: { weight_kg: number; display_order: number }[];
    }) => {
      const { data: plateProfile, error: profileError } = await supabase
        .from('plate_profiles')
        .insert({
          name: profile.name,
          default_unit: profile.default_unit,
          notes: profile.notes || '',
        })
        .select()
        .single();

      if (profileError) throw profileError;

      if (profile.plates.length > 0) {
        const { error: platesError } = await supabase
          .from('plate_profile_plates')
          .insert(
            profile.plates.map(p => ({
              profile_id: plateProfile.id,
              weight_kg: p.weight_kg,
              display_order: p.display_order,
            }))
          );

        if (platesError) throw platesError;
      }

      return plateProfile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: equipmentKeys.profiles() });
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      profileId,
      updates,
      plates
    }: {
      profileId: string;
      updates: { name?: string; notes?: string };
      plates?: { weight_kg: number; display_order: number }[];
    }) => {
      // Update profile
      const { error: profileError } = await supabase
        .from('plate_profiles')
        .update(updates)
        .eq('id', profileId);

      if (profileError) throw profileError;

      // Update plates if provided
      if (plates) {
        // Delete existing plates
        await supabase
          .from('plate_profile_plates')
          .delete()
          .eq('profile_id', profileId);

        // Insert new plates
        if (plates.length > 0) {
          const { error: platesError } = await supabase
            .from('plate_profile_plates')
            .insert(
              plates.map(p => ({
                profile_id: profileId,
                weight_kg: p.weight_kg,
                display_order: p.display_order,
              }))
            );

          if (platesError) throw platesError;
        }
      }

      return { profileId };
    },
    onSuccess: ({ profileId }) => {
      queryClient.invalidateQueries({ queryKey: equipmentKeys.profiles() });
      queryClient.invalidateQueries({ queryKey: equipmentKeys.profile(profileId) });
    },
  });
}

export function useCloneProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ profileId, newName }: { profileId: string; newName: string }) => {
      // Get original profile
      const { data: original, error: fetchError } = await supabase
        .from('plate_profiles')
        .select(`
          *,
          plate_profile_plates(*)
        `)
        .eq('id', profileId)
        .single();

      if (fetchError) throw fetchError;

      // Create new profile
      const { data: newProfile, error: createError } = await supabase
        .from('plate_profiles')
        .insert({
          name: newName,
          default_unit: original.default_unit,
          notes: `Cloned from ${original.name}`,
        })
        .select()
        .single();

      if (createError) throw createError;

      // Copy plates
      if (original.plate_profile_plates?.length > 0) {
        const { error: platesError } = await supabase
          .from('plate_profile_plates')
          .insert(
            original.plate_profile_plates.map((p: any) => ({
              profile_id: newProfile.id,
              weight_kg: p.weight_kg,
              display_order: p.display_order,
            }))
          );

        if (platesError) throw platesError;
      }

      return newProfile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: equipmentKeys.profiles() });
    },
  });
}

export function useDeleteProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profileId: string) => {
      // Check if profile is linked to any gyms
      const { data: linkedGyms, error: checkError } = await supabase
        .from('gym_weight_configs')
        .select('id')
        .eq('plate_profile_id', profileId)
        .limit(1);

      if (checkError) throw checkError;

      if (linkedGyms && linkedGyms.length > 0) {
        throw new Error('Cannot delete profile that is currently adopted by gyms');
      }

      // Delete plates first (cascade should handle this, but being explicit)
      await supabase
        .from('plate_profile_plates')
        .delete()
        .eq('profile_id', profileId);

      // Delete profile
      const { error } = await supabase
        .from('plate_profiles')
        .delete()
        .eq('id', profileId);

      if (error) throw error;

      return { profileId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: equipmentKeys.profiles() });
    },
  });
}

export function useAdoptProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ gymId, profileId }: { gymId: string; profileId: string }) => {
      const { error } = await supabase
        .from('gym_weight_configs')
        .upsert({
          gym_id: gymId,
          plate_profile_id: profileId,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      return { gymId, profileId };
    },
    onSuccess: ({ gymId }) => {
      queryClient.invalidateQueries({ queryKey: equipmentKeys.gym(gymId) });
      queryClient.invalidateQueries({ queryKey: equipmentKeys.gymEffective(gymId) });
    },
  });
}

export function useUpsertGymOverrides() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      gymId,
      overrideType,
      data
    }: {
      gymId: string;
      overrideType: 'plates' | 'dumbbells' | 'stacks';
      data: any;
    }) => {
      if (overrideType === 'plates') {
        await supabase.rpc('upsert_gym_plate_profile', {
          _gym_id: gymId,
          _unit: data.unit,
          _bar: data.bar,
          _ez: data.ez,
          _fixed: data.fixed,
          _sides: data.sides,
          _micro: data.micro
        });
      } else if (overrideType === 'dumbbells') {
        await supabase.rpc('upsert_gym_dumbbell_sets', {
          _gym_id: gymId,
          _unit: data.unit,
          _pairs: data.pairs
        });
      } else if (overrideType === 'stacks') {
        await supabase.rpc('upsert_gym_stack_steps', {
          _gym_id: gymId,
          _machine_id: data.machineId || null,
          _unit: data.unit,
          _steps: data.steps,
          _aux: data.aux
        });
      }

      return { gymId, overrideType };
    },
    onSuccess: ({ gymId }) => {
      queryClient.invalidateQueries({ queryKey: equipmentKeys.gym(gymId) });
      queryClient.invalidateQueries({ queryKey: equipmentKeys.gymEffective(gymId) });
    },
  });
}