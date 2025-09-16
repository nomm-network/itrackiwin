import { supabase } from "@/integrations/supabase/client";

// Types
export interface ProgramTemplate {
  template_id: string;
  order_position: number;
}

export interface ProgramProgress {
  user_id: string;
  program_id: string;
  last_position: number;
  last_workout_id?: string;
  updated_at: string;
}

// Get next program template for a user
export async function getNextProgramTemplate(programId: string): Promise<ProgramTemplate | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase.rpc('get_next_program_template', {
    p_program_id: programId,
    p_user_id: user.id
  });

  if (error) throw error;
  if (!data || data.length === 0) return null;

  return {
    template_id: data[0].template_id,
    order_position: data[0].order_position
  };
}

// Advance program progress
export async function advanceProgramProgress(
  programId: string, 
  position: number, 
  workoutId: string
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase.rpc('advance_program_progress', {
    p_program_id: programId,
    p_user_id: user.id,
    p_position: position,
    p_workout_id: workoutId
  });

  if (error) throw error;
}

// List program templates for editing/picker
export async function listProgramTemplates(programId: string) {
  const { data, error } = await supabase
    .from('training_program_blocks')
    .select(`
      id,
      order_index,
      workout_template_id,
      workout_templates:workout_template_id (
        id,
        name
      )
    `)
    .eq('program_id', programId)
    .order('order_index');

  if (error) throw error;
  return data;
}

// Get program info by ID
export async function getProgramInfo(programId: string) {
  const { data, error } = await supabase
    .from('training_programs')
    .select('id, name, goal')
    .eq('id', programId)
    .single();

  if (error) throw error;
  return data;
}