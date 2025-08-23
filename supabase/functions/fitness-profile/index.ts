import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { 
  FitnessProfileSchema, 
  UpdateFitnessProfileSchema, 
  ApiResponseSchema, 
  type FitnessProfile, 
  type UpdateFitnessProfile,
  type ApiResponse 
} from "../_shared/schemas.ts";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log(`${req.method} /fitness-profile`);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Authorization header required', timestamp: new Date().toISOString() }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user from auth token
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid authentication', timestamp: new Date().toISOString() }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const response: ApiResponse<FitnessProfile> = {
      success: false,
      timestamp: new Date().toISOString()
    };

    if (req.method === 'GET') {
      // Get fitness profile
      const { data: profile, error } = await supabase
        .from('user_profile_fitness')
        .select(`
          *,
          muscle_group_priorities:user_muscle_group_priorities(
            muscle_group_id,
            priority
          )
        `)
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found is ok
        console.error('Database error:', error);
        response.error = 'Failed to fetch fitness profile';
        return new Response(JSON.stringify(response), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (profile) {
        const validatedProfile = FitnessProfileSchema.parse({
          user_id: profile.user_id,
          experience_level: profile.experience_level,
          sex: profile.sex,
          age: profile.age,
          weight: profile.weight,
          height: profile.height,
          goals: profile.goals || [],
          muscle_group_priorities: profile.muscle_group_priorities || [],
          training_frequency: profile.training_frequency,
          session_duration_minutes: profile.session_duration_minutes,
          created_at: profile.created_at,
          updated_at: profile.updated_at,
        });

        response.success = true;
        response.data = validatedProfile;
      } else {
        response.success = true;
        response.data = null;
      }

    } else if (req.method === 'PUT') {
      // Update fitness profile
      const requestBody = await req.json();
      const updateData = UpdateFitnessProfileSchema.parse(requestBody);

      // Extract muscle group priorities for separate handling
      const { muscle_group_priorities, ...profileData } = updateData;

      // Update main profile
      const { data: updatedProfile, error: updateError } = await supabase
        .from('user_profile_fitness')
        .upsert({ 
          user_id: user.id, 
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (updateError) {
        console.error('Profile update error:', updateError);
        response.error = 'Failed to update fitness profile';
        return new Response(JSON.stringify(response), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Update muscle group priorities if provided
      if (muscle_group_priorities) {
        // Delete existing priorities
        await supabase
          .from('user_muscle_group_priorities')
          .delete()
          .eq('user_id', user.id);

        // Insert new priorities
        if (muscle_group_priorities.length > 0) {
          const { error: prioritiesError } = await supabase
            .from('user_muscle_group_priorities')
            .insert(
              muscle_group_priorities.map(priority => ({
                user_id: user.id,
                muscle_group_id: priority.muscle_group_id,
                priority: priority.priority
              }))
            );

          if (prioritiesError) {
            console.error('Priorities update error:', prioritiesError);
            response.error = 'Failed to update muscle group priorities';
            return new Response(JSON.stringify(response), {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }
        }
      }

      // Fetch complete updated profile
      const { data: completeProfile, error: fetchError } = await supabase
        .from('user_profile_fitness')
        .select(`
          *,
          muscle_group_priorities:user_muscle_group_priorities(
            muscle_group_id,
            priority
          )
        `)
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        console.error('Fetch updated profile error:', fetchError);
        response.error = 'Profile updated but failed to fetch updated data';
        return new Response(JSON.stringify(response), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const validatedProfile = FitnessProfileSchema.parse({
        user_id: completeProfile.user_id,
        experience_level: completeProfile.experience_level,
        sex: completeProfile.sex,
        age: completeProfile.age,
        weight: completeProfile.weight,
        height: completeProfile.height,
        goals: completeProfile.goals || [],
        muscle_group_priorities: completeProfile.muscle_group_priorities || [],
        training_frequency: completeProfile.training_frequency,
        session_duration_minutes: completeProfile.session_duration_minutes,
        created_at: completeProfile.created_at,
        updated_at: completeProfile.updated_at,
      });

      response.success = true;
      response.data = validatedProfile;

    } else {
      response.error = 'Method not allowed';
      return new Response(JSON.stringify(response), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Fitness profile API error:', error);
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };

    return new Response(JSON.stringify(response), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});