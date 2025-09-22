import { supabase } from "@/integrations/supabase/client";
import { useReadinessStore } from "@/stores/readinessStore";

export async function startFromTemplate(templateId: string) {
  // Call the existing start_workout RPC function with template
  const { data, error } = await supabase.rpc("start_workout", { 
    p_template_id: templateId 
  });

  if (error) throw error;
  
  // Update workout with current readiness score
  const readinessStore = useReadinessStore.getState();
  if (data && readinessStore.score !== null && readinessStore.score !== undefined) {
    await supabase
      .from('workouts')
      .update({ readiness_score: readinessStore.score })
      .eq('id', data);
  }
  
  return { workoutId: data };
}

export async function startFromProgram(programId: string) {
  // Get next template using new RPC
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('Not authenticated');

  // TODO: Re-implement when get_next_program_template function is available
  // const { data: nextTemplate, error: templateError } = await supabase.rpc('get_next_program_template', {
  //   p_program_id: programId,
  //   p_user_id: user.user.id
  // });

  // if (templateError) throw templateError;
  // if (!nextTemplate?.[0]) throw new Error('No program templates found');
  
  // Placeholder for now
  
  // TODO: Re-implement the rest when program template function is available
  /*
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
  
  // Update workout with current readiness score
  const readinessStore = useReadinessStore.getState();
  if (workoutId && readinessStore.score !== null && readinessStore.score !== undefined) {
    await supabase
      .from('workouts')
      .update({ readiness_score: readinessStore.score })
      .eq('id', workoutId);
  }
  
  return { workoutId: null };
  */
  
  // For now, return null since the function is not available
  return { workoutId: null };
}