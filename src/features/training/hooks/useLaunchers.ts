import { supabase } from "@/integrations/supabase/client";
import { useReadinessStore } from "@/stores/readinessStore";

export async function startFromTemplate(templateId: string) {
  console.log('[useLaunchers] Starting workout from template:', templateId);
  
  // Call the existing start_workout RPC function with template
  const { data, error } = await supabase.rpc("start_workout", { 
    p_template_id: templateId 
  });

  console.log('[useLaunchers] start_workout response:', { data, error });

  if (error) {
    console.error('[useLaunchers] start_workout ERROR:', error);
    throw error;
  }
  
  // Update workout with current readiness score
  const readinessStore = useReadinessStore.getState();
  if (data && readinessStore.score !== null && readinessStore.score !== undefined) {
    console.log('[useLaunchers] Updating workout with readiness score:', readinessStore.score);
    const { error: updateError } = await supabase
      .from('workouts')
      .update({ readiness_score: readinessStore.score })
      .eq('id', data);
    
    if (updateError) {
      console.error('[useLaunchers] Failed to update readiness score:', updateError);
    }
  }
  
  console.log('[useLaunchers] Workout started successfully:', data);
  return { workoutId: data };
}

export async function startFromProgram(programId: string) {
  // Get next template using RPC
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('Not authenticated');

  const { data: nextTemplate, error: templateError } = await (supabase.rpc as any)('get_next_program_template', {
    p_program_id: programId,
    p_user_id: user.user.id
  });

  if (templateError) throw templateError;
  if (!nextTemplate?.[0]) throw new Error('No program templates found');
  
  // Start workout with BOTH template_id and program_id
  // This tells start_workout to use program rep ranges instead of template defaults
  const { data: workoutId, error: workoutError } = await supabase.rpc("start_workout", { 
    p_template_id: nextTemplate[0].template_id,
    p_program_id: programId
  } as any);

  if (workoutError) throw workoutError;

  // Update the workout with program position tracking
  await supabase
    .from('workouts')
    .update({
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
  
  // Advance program progress
  await (supabase.rpc as any)('advance_program_progress', {
    p_program_id: programId,
    p_user_id: user.user.id,
    p_position: nextTemplate[0].order_position,
    p_workout_id: workoutId
  });
  
  return { workoutId };
}