import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { fitnessKeys } from '@/shared/lib/queryKeys';

interface GymInventory {
  dumbbells: Array<{ id: string; weight: number; unit: string; quantity: number }>;
  plates: Array<{ id: string; weight: number; unit: string; quantity: number }>;
  bars: Array<{ id: string; bar_type_id: string; quantity: number }>;
  machines: Array<{ 
    id: string; 
    label: string; 
    stack_values: number[]; 
    aux_values: number[]; 
    unit: string;
    equipment_id?: string;
  }>;
  miniweights: Array<{ id: string; weight: number; unit: string; quantity: number }>;
}

interface Gym {
  id: string;
  name: string;
  is_default: boolean;
  created_at: string;
}

export const useMyGym = () => {
  const queryClient = useQueryClient();

  // Get default gym
  const { data: gym, isLoading: gymLoading } = useQuery({
    queryKey: fitnessKeys.gym.default(),
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_gyms')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as Gym;
    },
  });

  // Get gym inventory
  const { data: inventory, isLoading: inventoryLoading } = useQuery({
    queryKey: fitnessKeys.gym.inventory(gym?.id),
    queryFn: async () => {
      if (!gym?.id) return null;

      const [dumbbellsRes, platesRes, barsRes, machinesRes, miniweightsRes] = await Promise.all([
        supabase.from('user_gym_dumbbells').select('*').eq('user_gym_id', gym.id),
        supabase.from('user_gym_plates').select('*').eq('user_gym_id', gym.id),
        supabase.from('user_gym_bars').select('*').eq('user_gym_id', gym.id),
        supabase.from('user_gym_machines').select('*').eq('user_gym_id', gym.id),
        supabase.from('user_gym_miniweights').select('*').eq('user_gym_id', gym.id),
      ]);

      [dumbbellsRes, platesRes, barsRes, machinesRes, miniweightsRes].forEach(res => {
        if (res.error) throw res.error;
      });

      return {
        dumbbells: dumbbellsRes.data || [],
        plates: platesRes.data || [],
        bars: barsRes.data || [],
        machines: machinesRes.data || [],
        miniweights: miniweightsRes.data || [],
      } as GymInventory;
    },
    enabled: !!gym?.id,
  });

  // Mutations
  const addDumbbell = useMutation({
    mutationFn: async (dumbbell: { weight: number; quantity: number; unit: 'kg' | 'lb' }) => {
      if (!gym?.id) throw new Error('No gym selected');

      const { data, error } = await supabase
        .from('user_gym_dumbbells')
        .insert({
          user_gym_id: gym.id,
          ...dumbbell,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fitnessKeys.gym.inventory(gym?.id) });
    },
  });

  const addPlate = useMutation({
    mutationFn: async (plate: { weight: number; quantity: number; unit: 'kg' | 'lb' }) => {
      if (!gym?.id) throw new Error('No gym selected');

      const { data, error } = await supabase
        .from('user_gym_plates')
        .insert({
          user_gym_id: gym.id,
          ...plate,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fitnessKeys.gym.inventory(gym?.id) });
    },
  });

  const addMachine = useMutation({
    mutationFn: async (machine: { 
      label: string; 
      stackValues: number[]; 
      auxValues: number[]; 
      unit: 'kg' | 'lb';
      equipmentId?: string;
    }) => {
      if (!gym?.id) throw new Error('No gym selected');

      const { data, error } = await supabase
        .from('user_gym_machines')
        .insert({
          user_gym_id: gym.id,
          label: machine.label,
          stack_values: machine.stackValues,
          aux_values: machine.auxValues,
          unit: machine.unit,
          equipment_id: machine.equipmentId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fitnessKeys.gym.inventory(gym?.id) });
    },
  });

  const removeDumbbell = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('user_gym_dumbbells')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fitnessKeys.gym.inventory(gym?.id) });
    },
  });

  const removePlate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('user_gym_plates')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fitnessKeys.gym.inventory(gym?.id) });
    },
  });

  const removeMachine = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('user_gym_machines')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fitnessKeys.gym.inventory(gym?.id) });
    },
  });

  return {
    gym,
    inventory,
    isLoading: gymLoading || inventoryLoading,
    addDumbbell: addDumbbell.mutateAsync,
    addPlate: addPlate.mutateAsync,
    addMachine: addMachine.mutateAsync,
    removeDumbbell: removeDumbbell.mutateAsync,
    removePlate: removePlate.mutateAsync,
    removeMachine: removeMachine.mutateAsync,
  };
};