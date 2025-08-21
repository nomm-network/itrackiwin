import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface GymCandidate {
  gym_id: string;
  name: string;
  distance_m: number;
  address: string;
  confidence: number;
}

interface GymDetectionResponse {
  candidates: GymCandidate[];
  suggested_gym_id: string | null;
  source: 'local' | 'external';
}

interface GymMembership {
  id: string;
  gym_id: string;
  is_default: boolean;
  membership_notes?: string;
  gym: {
    id: string;
    name: string;
    address?: string;
    equipment_profile: Record<string, any>;
  };
}

const getCurrentLocation = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Geolocation not available'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      resolve,
      reject,
      { 
        enableHighAccuracy: true, 
        timeout: 8000,
        maximumAge: 300000 // 5 minutes
      }
    );
  });
};

export const useGymDetection = () => {
  const detectGym = useMutation({
    mutationFn: async ({ lat, lng }: { lat?: number; lng?: number } = {}) => {
      let latitude = lat;
      let longitude = lng;

      // Get current location if not provided
      if (!latitude || !longitude) {
        const position = await getCurrentLocation();
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase.functions.invoke('detect-gym', {
        body: { 
          lat: latitude, 
          lng: longitude,
          user_id: user?.id
        },
      });

      if (error) throw error;
      return data as GymDetectionResponse;
    },
  });

  return {
    detectGym: detectGym.mutateAsync,
    isDetecting: detectGym.isPending,
    error: detectGym.error,
  };
};

export const useUserGymMemberships = () => {
  return useQuery({
    queryKey: ['user-gym-memberships'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_gym_memberships')
        .select(`
          id,
          gym_id,
          is_default,
          membership_notes,
          gym:gyms(
            id,
            name,
            address,
            equipment_profile
          )
        `)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as GymMembership[];
    },
  });
};

export const useDefaultGym = () => {
  return useQuery({
    queryKey: ['default-gym'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_gym_memberships')
        .select(`
          id,
          gym_id,
          is_default,
          membership_notes,
          gym:gyms(
            id,
            name,
            address,
            equipment_profile
          )
        `)
        .eq('is_default', true)
        .maybeSingle();

      if (error) throw error;
      return data as GymMembership | null;
    },
  });
};

export const useSetDefaultGym = () => {
  return useMutation({
    mutationFn: async (gymId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // First, unset any existing default
      await supabase
        .from('user_gym_memberships')
        .update({ is_default: false })
        .eq('user_id', user.id);

      // Then set the new default
      const { data, error } = await supabase
        .from('user_gym_memberships')
        .upsert({
          user_id: user.id,
          gym_id: gymId,
          is_default: true,
        }, {
          onConflict: 'user_id,gym_id'
        });

      if (error) throw error;
      return data;
    },
  });
};

export const useAddManualGym = () => {
  return useMutation({
    mutationFn: async ({ name, address }: { name: string; address?: string }) => {
      // Create manual gym entry
      const { data: gym, error: gymError } = await supabase
        .from('gyms')
        .insert({
          name,
          address,
          provider: 'manual',
          location: 'SRID=4326;POINT(0 0)', // Default location for manual entries
        })
        .select()
        .single();

      if (gymError) throw gymError;

      // Add as user's gym membership
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: membership, error: membershipError } = await supabase
        .from('user_gym_memberships')
        .insert({
          user_id: user.id,
          gym_id: gym.id,
          is_default: true,
        })
        .select()
        .single();

      if (membershipError) throw membershipError;

      return { gym, membership };
    },
  });
};