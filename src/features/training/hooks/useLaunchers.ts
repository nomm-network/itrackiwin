// workout-flow-v1.0.0 (SOT) – DO NOT DUPLICATE
import { supabase } from '@/integrations/supabase/client';

export async function startFromTemplate(templateId: string) {
  const { data: workoutId, error } = await supabase.rpc('start_workout', {
    p_template_id: templateId,
  });
  if (error) throw error;
  return workoutId as string;
}

export async function startFromProgram(programId: string) {
  // Get next template using new RPC
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('Not authenticated');

  const { data: nextTemplate, error: templateError } = await supabase.rpc('get_next_program_template', {
    p_program_id: programId,
    p_user_id: user.user.id
  });

  if (templateError) throw templateError;
  if (!nextTemplate?.[0]) throw new Error('No program templates found');

  // Start workout from the program's template with program tracking
  const { data: workoutId, error: workoutError } = await supabase.rpc("start_workout", { 
    p_template_id: nextTemplate[0].template_id 
  });

  if (workoutError) throw workoutError;

  // Update the workout with program info
  await supabase
    .from('workouts')
    .update({
      program_id: programId,
      program_position: nextTemplate[0].order_position,
      program_template_id: nextTemplate[0].template_id
    })
    .eq('id', workoutId);
  
  return workoutId as string;
}