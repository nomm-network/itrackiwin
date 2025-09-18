import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { 
  WorkoutTemplateSchema, 
  GenerateTemplateRequestSchema,
  PaginatedResponseSchema,
  ApiResponseSchema,
  type WorkoutTemplate, 
  type GenerateTemplateRequest,
  type ApiResponse,
  type PaginatedResponse
} from "../_shared/schemas.ts";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log(`${req.method} /workout-templates`);

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

    const url = new URL(req.url);
    const templateId = url.pathname.split('/').pop();

    if (req.method === 'GET') {
      if (templateId && templateId !== 'workout-templates') {
        // Get single template
        const { data: template, error } = await supabase
          .from('workout_templates')
          .select(`
            *,
            exercises:template_exercises(
              exercise_id,
              order_index,
              default_sets,
              target_reps,
              target_weight,
              rest_seconds,
              exercise:exercises(name, description)
            )
          `)
          .eq('id', templateId)
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Template fetch error:', error);
          const response: ApiResponse = {
            success: false,
            error: 'Template not found',
            timestamp: new Date().toISOString()
          };
          return new Response(JSON.stringify(response), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const validatedTemplate = WorkoutTemplateSchema.parse({
          id: template.id,
          user_id: template.user_id,
          name: template.name,
          description: template.description,
          exercises: template.exercises.map((ex: any) => ({
            exercise_id: ex.exercise_id,
            order_index: ex.order_index,
            default_sets: ex.default_sets,
            target_reps: ex.target_reps,
            target_weight: ex.target_weight,
            rest_seconds: ex.rest_seconds,
          })),
          estimated_duration: template.estimated_duration,
          difficulty_level: template.difficulty_level,
          created_at: template.created_at,
          updated_at: template.updated_at,
        });

        const response: ApiResponse<WorkoutTemplate> = {
          success: true,
          data: validatedTemplate,
          timestamp: new Date().toISOString()
        };

        return new Response(JSON.stringify(response), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      } else {
        // List templates with pagination
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = Math.min(parseInt(url.searchParams.get('limit') || '10'), 50);
        const offset = (page - 1) * limit;

        const { data: templates, error, count } = await supabase
          .from('workout_templates')
          .select(`
            *,
            exercises:template_exercises(
              exercise_id,
              order_index,
              default_sets,
              target_reps,
              target_weight,
              rest_seconds
            )
          `, { count: 'exact' })
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (error) {
          console.error('Templates list error:', error);
          const response: ApiResponse = {
            success: false,
            error: 'Failed to fetch templates',
            timestamp: new Date().toISOString()
          };
          return new Response(JSON.stringify(response), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const validatedTemplates = templates.map(template => 
          WorkoutTemplateSchema.parse({
            id: template.id,
            user_id: template.user_id,
            name: template.name,
            description: template.description,
            exercises: template.exercises.map((ex: any) => ({
              exercise_id: ex.exercise_id,
              order_index: ex.order_index,
              default_sets: ex.default_sets,
              target_reps: ex.target_reps,
              target_weight: ex.target_weight,
              rest_seconds: ex.rest_seconds,
            })),
            estimated_duration: template.estimated_duration,
            difficulty_level: template.difficulty_level,
            created_at: template.created_at,
            updated_at: template.updated_at,
          })
        );

        const response: PaginatedResponse<WorkoutTemplate> = {
          data: validatedTemplates,
          pagination: {
            page,
            limit,
            total: count || 0,
            has_more: (count || 0) > offset + limit
          }
        };

        return new Response(JSON.stringify(response), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

    } else if (req.method === 'POST') {
      // Generate or create template
      const requestBody = await req.json();
      
      if (requestBody.generate) {
        // Generate template using AI
        const generateRequest = GenerateTemplateRequestSchema.parse(requestBody);
        
        // Call existing generate-workout function
        const { data: generatedTemplate, error: generateError } = await supabase.functions.invoke('generate-workout', {
          body: generateRequest
        });

        if (generateError) {
          console.error('Template generation error:', generateError);
          const response: ApiResponse = {
            success: false,
            error: 'Failed to generate template',
            timestamp: new Date().toISOString()
          };
          return new Response(JSON.stringify(response), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const response: ApiResponse<WorkoutTemplate> = {
          success: true,
          data: generatedTemplate,
          timestamp: new Date().toISOString()
        };

        return new Response(JSON.stringify(response), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      } else {
        // Create custom template
        const templateData = WorkoutTemplateSchema.omit({ id: true }).parse({
          ...requestBody,
          user_id: user.id
        });

        // Create template
        const { data: newTemplate, error: createError } = await supabase
          .from('workout_templates')
          .insert({
            user_id: templateData.user_id,
            name: templateData.name,
            description: templateData.description,
            estimated_duration: templateData.estimated_duration,
            difficulty_level: templateData.difficulty_level,
          })
          .select()
          .single();

        if (createError) {
          console.error('Template creation error:', createError);
          const response: ApiResponse = {
            success: false,
            error: 'Failed to create template',
            timestamp: new Date().toISOString()
          };
          return new Response(JSON.stringify(response), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Add exercises
        if (templateData.exercises.length > 0) {
          const { error: exercisesError } = await supabase
            .from('template_exercises')
            .insert(
              templateData.exercises.map(exercise => ({
                template_id: newTemplate.id,
                exercise_id: exercise.exercise_id,
                order_index: exercise.order_index,
                default_sets: exercise.default_sets,
                target_reps: exercise.target_reps,
                target_weight: exercise.target_weight,
                rest_seconds: exercise.rest_seconds,
                weight_unit: 'kg',
                attribute_values_json: {},
              }))
            );

          if (exercisesError) {
            console.error('Template exercises error:', exercisesError);
            // Clean up template
            await supabase.from('workout_templates').delete().eq('id', newTemplate.id);
            
            const response: ApiResponse = {
              success: false,
              error: 'Failed to add exercises to template',
              timestamp: new Date().toISOString()
            };
            return new Response(JSON.stringify(response), {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }
        }

        const completeTemplate = WorkoutTemplateSchema.parse({
          id: newTemplate.id,
          user_id: newTemplate.user_id,
          name: newTemplate.name,
          description: newTemplate.description,
          exercises: templateData.exercises,
          estimated_duration: newTemplate.estimated_duration,
          difficulty_level: newTemplate.difficulty_level,
          created_at: newTemplate.created_at,
          updated_at: newTemplate.updated_at,
        });

        const response: ApiResponse<WorkoutTemplate> = {
          success: true,
          data: completeTemplate,
          timestamp: new Date().toISOString()
        };

        return new Response(JSON.stringify(response), {
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

    } else {
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

  } catch (error) {
    console.error('Workout templates API error:', error);
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