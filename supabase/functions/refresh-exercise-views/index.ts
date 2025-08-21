import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.54.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RefreshRequest {
  user_id: string;
  exercise_id: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request body
    const { user_id, exercise_id }: RefreshRequest = await req.json();

    console.log(`Refreshing materialized views for user: ${user_id}, exercise: ${exercise_id}`);

    // Call the refresh function
    const { error: refreshError } = await supabase.rpc('refresh_exercise_views', {
      p_user_id: user_id,
      p_exercise_id: exercise_id
    });

    if (refreshError) {
      console.error('Error refreshing views:', refreshError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to refresh views',
          details: refreshError.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Successfully refreshed materialized views');

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Materialized views refreshed successfully',
        user_id,
        exercise_id
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});