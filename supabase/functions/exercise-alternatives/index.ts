import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { 
  SuggestAlternativesRequestSchema,
  ExerciseAlternativeSchema,
  ApiResponseSchema,
  type SuggestAlternativesRequest,
  type ExerciseAlternative,
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
  console.log(`${req.method} /exercise-alternatives`);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    const response: ApiResponse = {
      success: false,
      error: 'Method not allowed',
      timestamp: new Date().toISOString()
    };
    return new Response(JSON.stringify(response), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
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

    const requestBody = await req.json();
    const alternativesRequest = SuggestAlternativesRequestSchema.parse({
      ...requestBody,
      user_id: user.id
    });

    console.log('Finding alternatives for exercise:', alternativesRequest.exercise_id);

    // Get the target exercise details
    const { data: targetExercise, error: exerciseError } = await supabase
      .from('exercises')
      .select(`
        *,
        primary_muscle:muscles!primary_muscle_id(id, slug),
        secondary_muscles:exercises(secondary_muscle_group_ids),
        equipment:equipment!equipment_id(id, slug)
      `)
      .eq('id', alternativesRequest.exercise_id)
      .single();

    if (exerciseError || !targetExercise) {
      console.error('Target exercise fetch error:', exerciseError);
      const response: ApiResponse = {
        success: false,
        error: 'Target exercise not found',
        timestamp: new Date().toISOString()
      };
      return new Response(JSON.stringify(response), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Build alternative search query
    let query = supabase
      .from('exercises')
      .select(`
        id,
        name,
        description,
        primary_muscle_id,
        equipment_id,
        equipment:equipment!equipment_id(slug),
        primary_muscle:muscles!primary_muscle_id(slug)
      `)
      .neq('id', alternativesRequest.exercise_id)
      .eq('is_public', true);

    // Filter by available equipment if specified
    if (alternativesRequest.available_equipment?.length) {
      query = query.in('equipment_id', alternativesRequest.available_equipment);
    }

    // Filter by primary muscle group (similar exercises)
    if (targetExercise.primary_muscle_id) {
      query = query.eq('primary_muscle_id', targetExercise.primary_muscle_id);
    }

    const { data: potentialAlternatives, error: alternativesError } = await query
      .limit(alternativesRequest.limit * 2); // Get more to allow for filtering

    if (alternativesError) {
      console.error('Alternatives search error:', alternativesError);
      const response: ApiResponse = {
        success: false,
        error: 'Failed to find exercise alternatives',
        timestamp: new Date().toISOString()
      };
      return new Response(JSON.stringify(response), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Calculate similarity scores and reasons
    const alternatives: ExerciseAlternative[] = potentialAlternatives
      .map((exercise: any) => {
        let similarityScore = 0.5; // Base score
        let reason = '';

        // Same primary muscle group
        if (exercise.primary_muscle_id === targetExercise.primary_muscle_id) {
          similarityScore += 0.3;
          reason = `Targets the same primary muscle group (${exercise.primary_muscle?.slug || 'muscle'})`;
        }

        // Equipment consideration
        if (alternativesRequest.reason === 'equipment_unavailable') {
          reason = `Alternative using ${exercise.equipment?.slug || 'equipment'} instead of ${targetExercise.equipment?.slug || 'original equipment'}`;
          similarityScore += 0.2;
        }

        // Injury concern
        if (alternativesRequest.reason === 'injury_concern') {
          reason = 'Potentially safer alternative with reduced stress on affected area';
          similarityScore += 0.1;
        }

        // Progression
        if (alternativesRequest.reason === 'progression') {
          reason = 'Progressive variation for continued development';
          similarityScore += 0.2;
        }

        // Default reason if none specified
        if (!reason) {
          reason = 'Similar movement pattern and muscle activation';
        }

        return ExerciseAlternativeSchema.parse({
          exercise_id: exercise.id,
          name: exercise.name,
          reason,
          similarity_score: Math.min(similarityScore, 1.0),
          equipment_required: exercise.equipment?.slug ? [exercise.equipment.slug] : []
        });
      })
      .sort((a, b) => b.similarity_score - a.similarity_score)
      .slice(0, alternativesRequest.limit);

    const response: ApiResponse<ExerciseAlternative[]> = {
      success: true,
      data: alternatives,
      timestamp: new Date().toISOString()
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Exercise alternatives API error:', error);
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