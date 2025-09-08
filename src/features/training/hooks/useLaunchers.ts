import { supabase } from "@/integrations/supabase/client";

export async function startFromTemplate(templateId: string) {
  // Call the existing start_workout RPC function with template
  const { data, error } = await supabase.rpc("start_workout", { 
    p_template_id: templateId 
  });

  if (error) throw error;
  
  return { workoutId: data };
}

export async function startFromProgram(programId: string) {
  // For programs, we need to get the next block and start from its template
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('Not authenticated');

  // First set this as the active program
  const { error: stateError } = await supabase
    .from('user_program_state')
    .upsert({
      user_id: user.user.id,
      program_id: programId,
      last_completed_index: -1, // Start from beginning
      total_cycles_completed: 0
    });

  if (stateError) throw stateError;

  // Get the next program block (should be the first one now)
  const { data: nextBlock, error: blockError } = await supabase.rpc('get_next_program_block', {
    _user_id: user.user.id
  });

  if (blockError) throw blockError;
  if (!nextBlock?.[0]) throw new Error('No program blocks found');

  // Start workout from the program's template
  const { data: workoutId, error: workoutError } = await supabase.rpc("start_workout", { 
    p_template_id: nextBlock[0].workout_template_id 
  });

  if (workoutError) throw workoutError;
  
  return { workoutId };
}