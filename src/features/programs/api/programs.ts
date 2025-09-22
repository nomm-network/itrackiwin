import { supabase } from "@/integrations/supabase/client";

export async function getNextProgramTemplate(programId: string) {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('Not authenticated');

  // TODO: Re-implement when get_next_program_template function is available
  // const { data, error } = await supabase.rpc('get_next_program_template', {
  //   p_program_id: programId,
  //   p_user_id: user.user.id
  // });

  // if (error) throw error;
  
  // Get the template details - placeholder implementation
  const data = null;
  const nextTemplate = data?.[0];
  if (!nextTemplate) return null;
  
  const { data: templateData, error: templateError } = await supabase
    .from('workout_templates')
    .select('name')
    .eq('id', nextTemplate.template_id)
    .single();
    
  if (templateError) throw templateError;
  
  return {
    ...nextTemplate,
    template_name: templateData.name
  };
}

export async function advanceProgramProgress(programId: string, position: number, workoutId: string) {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('Not authenticated');

  const { error } = await supabase.rpc('advance_program_progress', {
    p_program_id: programId,
    p_user_id: user.user.id,
    p_position: position,
    p_workout_id: workoutId
  });

  if (error) throw error;
}

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
    .order('order_index', { ascending: true });

  if (error) throw error;
  return data;
}