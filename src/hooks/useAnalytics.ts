import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Types for analytics data
export interface GymActivity {
  gym_id: string;
  name: string;
  active_members: number;
  active_coaches: number;
  workouts_7d: number;
  workouts_30d: number;
}

export interface GymTopExercise {
  gym_id: string;
  exercise_id: string;
  exercise_name: string;
  usages_30d: number;
}

export interface GymEquipmentCompleteness {
  gym_id: string;
  overrides_count: number;
  defaults_available: number;
  overrides_coverage_pct: number;
}

export interface GymPosterFreshness {
  gym_id: string;
  last_poster_proof_at: string | null;
}

export interface AmbassadorSummary {
  ambassador_id: string;
  user_id: string;
  verified_deals_total: number;
  visits_mtd: number;
  last_visit_at: string | null;
}

export interface AmbassadorCommissionSummary {
  ambassador_id: string;
  commission_mtd: number;
  commission_last_month: number;
}

export interface GymNeedingPosterCheck {
  gym_id: string;
  name: string;
  last_poster_proof_at: string;
  age: string;
}

// Hooks for analytics data
export const useGymActivity = (gymId?: string) => {
  return useQuery({
    queryKey: ['gym-activity', gymId],
    queryFn: async () => {
      let query = supabase.from('v_gym_activity').select('*');
      
      if (gymId) {
        query = query.eq('gym_id', gymId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as GymActivity[];
    },
    staleTime: 300000, // 5 minutes
  });
};

export const useGymTopExercises = (gymId: string) => {
  return useQuery({
    queryKey: ['gym-top-exercises', gymId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_gym_top_exercises')
        .select('*')
        .eq('gym_id', gymId)
        .order('usages_30d', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data as GymTopExercise[];
    },
    enabled: !!gymId,
    staleTime: 300000,
  });
};

export const useGymEquipmentCompleteness = (gymId: string) => {
  return useQuery({
    queryKey: ['gym-equipment-completeness', gymId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_gym_equipment_completeness')
        .select('*')
        .eq('gym_id', gymId)
        .single();
      
      if (error) throw error;
      return data as GymEquipmentCompleteness;
    },
    enabled: !!gymId,
    staleTime: 300000,
  });
};

export const useGymPosterFreshness = (gymId: string) => {
  return useQuery({
    queryKey: ['gym-poster-freshness', gymId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_gym_poster_freshness')
        .select('*')
        .eq('gym_id', gymId)
        .single();
      
      if (error) throw error;
      return data as GymPosterFreshness;
    },
    enabled: !!gymId,
    staleTime: 300000,
  });
};

export const useAmbassadorSummary = (userId?: string) => {
  return useQuery({
    queryKey: ['ambassador-summary', userId],
    queryFn: async () => {
      let query = supabase.from('v_ambassador_summary').select('*');
      
      if (userId) {
        query = query.eq('user_id', userId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as AmbassadorSummary[];
    },
    staleTime: 300000,
  });
};

export const useAmbassadorCommissionSummary = (ambassadorId: string) => {
  return useQuery({
    queryKey: ['ambassador-commission-summary', ambassadorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_ambassador_commission_summary')
        .select('*')
        .eq('ambassador_id', ambassadorId)
        .single();
      
      if (error) throw error;
      return data as AmbassadorCommissionSummary;
    },
    enabled: !!ambassadorId,
    staleTime: 300000,
  });
};

export const useGymsNeedingPosterCheck = () => {
  return useQuery({
    queryKey: ['gyms-needing-poster-check'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_gyms_needing_poster_check')
        .select('*')
        .order('age', { ascending: false });
      
      if (error) throw error;
      return data as GymNeedingPosterCheck[];
    },
    staleTime: 300000,
  });
};

// Function to run commission accruals
export const runCommissionAccruals = async (year: number, month: number) => {
  const { error } = await supabase.rpc('run_commission_accruals', {
    p_year: year,
    p_month: month,
  });
  
  if (error) throw error;
};