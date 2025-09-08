import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AmbassadorProfile {
  id: string;
  user_id: string;
  bio: string;
  status: 'eligible' | 'active' | 'suspended' | 'terminated';
  created_at: string;
}

export interface AmbassadorSummary {
  ambassador_id: string;
  user_id: string;
  user_email?: string;
  user_name?: string;
  status?: string;
  bio?: string;
  created_at?: string;
  verified_deals_total?: number;
  gyms_signed?: number;
  total_gym_visits?: number;
  visits_mtd?: number;
  last_visit_at?: string;
  assigned_gyms?: Array<{
    gym_id: string;
    gym_name: string;
  }>;
}

export interface AmbassadorWithUserInfo extends AmbassadorProfile {
  user_email?: string;
  user_name?: string;
  verified_deals_total?: number;
  total_gym_visits?: number;
  last_visit_at?: string;
  assigned_gyms?: Array<{
    gym_id: string;
    gym_name: string;
  }>;
}

export const useAdminAmbassadors = () => {
  return useQuery({
    queryKey: ['admin-ambassadors'],
    queryFn: async () => {
      console.log('🔍 [useAdminAmbassadors] Fetching ambassador data...');
      const { data, error } = await supabase.from('v_ambassador_summary').select('*');
      if (error) {
        console.error('❌ [useAdminAmbassadors] Error:', error);
        throw error;
      }
      console.log('✅ [useAdminAmbassadors] Success:', data);
      return data as AmbassadorSummary[];
    }
  });
};

export const useCreateAmbassador = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { user_id: string; bio?: string; status?: string }) => {
      const { error } = await supabase
        .from('ambassador_profiles')
        .insert({
          user_id: data.user_id,
          bio: data.bio || '',
          status: data.status || 'eligible'
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-ambassadors'] });
      toast.success('Ambassador profile created successfully!');
    },
    onError: (error) => {
      console.error('Error creating ambassador:', error);
      toast.error('Failed to create ambassador profile');
    },
  });
};

export const useUpdateAmbassador = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      ambassadorId, 
      updates 
    }: { 
      ambassadorId: string; 
      updates: Partial<AmbassadorProfile> 
    }) => {
      const { error } = await supabase
        .from('ambassador_profiles')
        .update(updates)
        .eq('id', ambassadorId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-ambassadors'] });
      toast.success('Ambassador updated successfully!');
    },
    onError: (error) => {
      console.error('Error updating ambassador:', error);
      toast.error('Failed to update ambassador');
    },
  });
};

export const useAssignAmbassadorToGym = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      ambassadorId, 
      gymId,
      battleId 
    }: { 
      ambassadorId: string; 
      gymId: string;
      battleId: string;
    }) => {
      // This would typically create an assignment record
      // For now, we'll use the commission agreements table as a proxy
      const { error } = await supabase
        .from('ambassador_commission_agreements')
        .insert({
          ambassador_id: ambassadorId,
          gym_id: gymId,
          battle_id: battleId,
          tier: 'standard',
          percent: 10, // Default commission rate
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-ambassadors'] });
      toast.success('Ambassador assigned to gym successfully!');
    },
    onError: (error) => {
      console.error('Error assigning ambassador to gym:', error);
      toast.error('Failed to assign ambassador to gym');
    },
  });
};

export const useAmbassadorCommissionRates = (ambassadorId?: string) => {
  return useQuery({
    queryKey: ['ambassador-commission-rates', ambassadorId],
    queryFn: async () => {
      if (!ambassadorId) return [];
      
      const { data, error } = await supabase
        .from('ambassador_commission_agreements')
        .select('*')
        .eq('ambassador_id', ambassadorId);
      
      if (error) throw error;
      return data;
    },
    enabled: !!ambassadorId,
  });
};

export const useUpdateCommissionRate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      agreementId, 
      percent 
    }: { 
      agreementId: string; 
      percent: number;
    }) => {
      const { error } = await supabase
        .from('ambassador_commission_agreements')
        .update({ percent })
        .eq('id', agreementId);
      
      if (error) throw error;
    },
    onSuccess: (_, { agreementId }) => {
      queryClient.invalidateQueries({ queryKey: ['ambassador-commission-rates'] });
      toast.success('Commission rate updated successfully!');
    },
    onError: (error) => {
      console.error('Error updating commission rate:', error);
      toast.error('Failed to update commission rate');
    },
  });
};