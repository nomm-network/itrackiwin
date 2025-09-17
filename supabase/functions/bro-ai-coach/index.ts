import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProgramGenerationRequest {
  goal: 'recomp' | 'fat_loss' | 'muscle_gain' | 'strength' | 'general_fitness';
  experience_level: 'new' | 'returning' | 'intermediate' | 'advanced' | 'very_experienced';
  training_days_per_week: number;
  location_type: 'home' | 'gym';
  available_equipment: string[];
  priority_muscle_groups: string[];
  time_per_session_min?: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get auth header and validate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authorization token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (req.method === 'POST') {
      const requestData: ProgramGenerationRequest = await req.json();
      
      console.log('Generating program for user:', user.id, 'with params:', requestData);

      // Validate required fields
      if (!requestData.goal || !requestData.experience_level || !requestData.training_days_per_week) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields: goal, experience_level, training_days_per_week' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Upsert fitness profile first
      const { error: profileError } = await supabase
        .from('fitness_profile')
        .upsert({
          user_id: user.id,
          experience_level: requestData.experience_level,
          training_days_per_week: requestData.training_days_per_week,
          location_type: requestData.location_type,
          available_equipment: requestData.available_equipment || [],
          priority_muscle_groups: requestData.priority_muscle_groups || [],
          time_per_session_min: requestData.time_per_session_min || 60
        }, {
          onConflict: 'user_id'
        });

      if (profileError) {
        console.error('Error creating fitness profile:', profileError);
        return new Response(
          JSON.stringify({ error: 'Failed to save fitness profile', details: profileError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Generate the program using the database function
      const { data: programId, error: generateError } = await supabase
        .rpc('generate_ai_program', {
          p_user_id: user.id,
          p_goal: requestData.goal,
          p_experience_level: requestData.experience_level,
          p_training_days: requestData.training_days_per_week,
          p_location_type: requestData.location_type,
          p_equipment: requestData.available_equipment || [],
          p_priority_muscles: requestData.priority_muscle_groups || [],
          p_session_duration: requestData.time_per_session_min || 60
        });

      if (generateError) {
        console.error('Error generating program:', generateError);
        return new Response(
          JSON.stringify({ error: 'Failed to generate program', details: generateError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Fetch the generated program with details
      const { data: program, error: fetchError } = await supabase
        .from('ai_programs')
        .select(`
          *,
          ai_program_weeks!inner(
            *,
            ai_program_workouts!inner(
              *,
              ai_program_workout_exercises!inner(
                *,
                ai_exercises:exercise_id(name, primary_muscle, movement_type)
              )
            )
          )
        `)
        .eq('id', programId)
        .single();

      if (fetchError) {
        console.error('Error fetching generated program:', fetchError);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch generated program', details: fetchError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          program_id: programId,
          program: program
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (req.method === 'GET') {
      // Get user's AI programs
      const { data: programs, error: fetchError } = await supabase
        .from('ai_programs')
        .select(`
          *,
          ai_program_weeks!inner(
            week_number,
            ai_program_workouts!inner(
              day_of_week,
              title,
              focus_tags
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching programs:', fetchError);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch programs', details: fetchError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ programs }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message,
        stack: error.stack,
        name: error.name
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});