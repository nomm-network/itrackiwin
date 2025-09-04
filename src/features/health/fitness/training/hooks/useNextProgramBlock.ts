import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

type Block = { workout_template_id: string; title: string | null };

export const useNextProgramBlock = () => {
  // Temporarily stub since program_blocks_view doesn't exist yet
  return { data: undefined, isLoading: false } as any;
};