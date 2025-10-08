import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TrainingProgram {
  id: string;
  user_id: string;
  name: string;
  goal?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TrainingProgramBlock {
  id: string;
  program_id: string;
  workout_template_id: string;
  order_index: number;
  focus_tags?: string[];
  notes?: string;
  created_at: string;
}

export interface UserProgramState {
  user_id: string;
  program_id: string;
  last_completed_index: number;
  total_cycles_completed: number;
  updated_at: string;
}

export interface NextProgramBlock {
  program_id: string;
  next_block_id: string;
  workout_template_id: string;
  template_name: string;
  order_index: number;
  focus_tags?: string[];
  total_blocks: number;
  cycles_completed: number;
}

export const useTrainingPrograms = () => {
  return useQuery({
    queryKey: ['training-programs'],
    queryFn: async (): Promise<TrainingProgram[]> => {
      const { data, error } = await supabase
        .from('training_programs')
        .select('*')
        .eq('is_active', true)
        .or('ai_generated.is.null,ai_generated.eq.false')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });
};

export const useCreateTrainingProgram = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (program: Omit<TrainingProgram, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('training_programs')
        .insert([{
          ...program,
          user_id: user.user.id
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-programs'] });
    }
  });
};

export const useProgramBlocks = (programId: string) => {
  return useQuery({
    queryKey: ['program-blocks', programId],
    queryFn: async (): Promise<TrainingProgramBlock[]> => {
      const { data, error } = await supabase
        .from('training_program_blocks')
        .select('*')
        .eq('program_id', programId)
        .order('order_index');

      if (error) throw error;
      return data || [];
    },
    enabled: !!programId
  });
};

export const useAddProgramBlock = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (block: Omit<TrainingProgramBlock, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('training_program_blocks')
        .insert([block])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['program-blocks', variables.program_id] });
    }
  });
};

export const useNextProgramBlock = () => {
  return useQuery({
    queryKey: ['next-program-block'],
    queryFn: async (): Promise<NextProgramBlock | null> => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { data, error } = await supabase.rpc('get_next_program_block', {
        _user_id: user.user.id
      });

      if (error) throw error;
      return data?.[0] || null;
    }
  });
};

export const useAdvanceProgramState = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (completedBlockId: string) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { data, error } = await supabase.rpc('advance_program_state', {
        _user_id: user.user.id,
        _completed_block_id: completedBlockId
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['next-program-block'] });
    }
  });
};

export const useSetActiveProgram = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (programId: string) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      // Insert or update user program state
      const { data, error } = await supabase
        .from('user_program_state')
        .upsert({
          user_id: user.user.id,
          program_id: programId,
          last_completed_index: 0,
          total_cycles_completed: 0
        })
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['next-program-block'] });
    }
  });
};

export const useDeleteTrainingProgram = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (programId: string) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('training_programs')
        .delete()
        .eq('id', programId)
        .eq('user_id', user.user.id);

      if (error) throw error;
      return programId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-programs'] });
      queryClient.invalidateQueries({ queryKey: ['next-program-block'] });
    }
  });
};

export const useUpdateTrainingProgram = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ programId, updates }: { 
      programId: string; 
      updates: Partial<Pick<TrainingProgram, 'name' | 'goal'>> 
    }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('training_programs')
        .update(updates)
        .eq('id', programId)
        .eq('user_id', user.user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-programs'] });
    }
  });
};