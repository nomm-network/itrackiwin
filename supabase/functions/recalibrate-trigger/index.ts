import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { 
  RecalibrationTriggerSchema,
  ApiResponseSchema,
  type RecalibrationTrigger,
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
  console.log(`${req.method} /recalibrate-trigger`);

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

    // Check if user is admin
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const isAdmin = userRoles?.some(role => ['admin', 'superadmin'].includes(role.role));
    
    if (!isAdmin) {
      const response: ApiResponse = {
        success: false,
        error: 'Admin access required',
        timestamp: new Date().toISOString()
      };
      return new Response(JSON.stringify(response), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const requestBody = await req.json();
    const recalibrationRequest = RecalibrationTriggerSchema.parse(requestBody);

    console.log('Triggering recalibration:', recalibrationRequest);

    // Call the existing recalibrate-user-plans function
    const { data: recalibrationResult, error: recalibrationError } = await supabase.functions.invoke(
      'recalibrate-user-plans', 
      {
        body: {
          user_id: recalibrationRequest.user_id,
          force_recalibration: recalibrationRequest.force_recalibration,
          target_exercises: recalibrationRequest.target_exercises,
          recalibration_type: recalibrationRequest.recalibration_type
        }
      }
    );

    if (recalibrationError) {
      console.error('Recalibration error:', recalibrationError);
      const response: ApiResponse = {
        success: false,
        error: 'Failed to trigger recalibration',
        timestamp: new Date().toISOString()
      };
      return new Response(JSON.stringify(response), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Log the admin action
    await supabase
      .from('admin_audit_log')
      .insert({
        performed_by: user.id,
        action_type: 'recalibration_trigger',
        details: {
          target_user: recalibrationRequest.user_id,
          recalibration_type: recalibrationRequest.recalibration_type,
          force_recalibration: recalibrationRequest.force_recalibration,
          target_exercises: recalibrationRequest.target_exercises
        },
        ip_address: req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for'),
        user_agent: req.headers.get('user-agent')
      });

    const response: ApiResponse<any> = {
      success: true,
      data: {
        message: 'Recalibration triggered successfully',
        result: recalibrationResult,
        triggered_at: new Date().toISOString(),
        triggered_by: user.id
      },
      timestamp: new Date().toISOString()
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Recalibration trigger API error:', error);
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