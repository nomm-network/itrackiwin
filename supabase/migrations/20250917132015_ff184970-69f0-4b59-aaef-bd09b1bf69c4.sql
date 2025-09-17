-- Update the generate_ai_program function to accept user_id parameter
create or replace function public.generate_ai_program(
  goal text,
  experience_level text,
  training_days_per_week int,
  location_type text,
  available_equipment text[],
  priority_muscle_groups text[],
  time_per_session_min int,
  user_id uuid
) returns jsonb
language plpgsql
security definer
as $$
declare
  v_program_id uuid;
  v_week_id uuid;
  v_workout_id uuid;
begin
  -- Insert the program
  insert into public.ai_programs (
    user_id,
    goal,
    experience_level,
    training_days_per_week,
    location_type,
    available_equipment,
    priority_muscle_groups,
    time_per_session_min,
    program_data
  ) values (
    user_id,
    goal::fitness_goal,
    experience_level::experience_level,
    training_days_per_week,
    location_type::location_type,
    available_equipment,
    priority_muscle_groups,
    time_per_session_min,
    jsonb_build_object(
      'created_at', now(),
      'goal', goal,
      'experience_level', experience_level,
      'summary', 'AI Generated Program'
    )
  ) returning id into v_program_id;

  -- Create a sample week
  insert into public.ai_program_weeks (
    program_id,
    week_number,
    week_data
  ) values (
    v_program_id,
    1,
    jsonb_build_object(
      'week_number', 1,
      'focus', 'Foundation Building'
    )
  ) returning id into v_week_id;

  -- Create sample workouts for the week
  for i in 1..training_days_per_week loop
    insert into public.ai_program_workouts (
      week_id,
      day_number,
      workout_data
    ) values (
      v_week_id,
      i,
      jsonb_build_object(
        'day_number', i,
        'workout_name', 'Day ' || i || ' Workout',
        'exercises', '[]'::jsonb
      )
    ) returning id into v_workout_id;
  end loop;

  return jsonb_build_object(
    'program_id', v_program_id,
    'message', 'Program generated successfully',
    'weeks_created', 1,
    'workouts_created', training_days_per_week
  );

exception
  when others then
    raise exception 'generate_ai_program failed: %', SQLERRM using hint = 'Check inputs and policies';
end;
$$;