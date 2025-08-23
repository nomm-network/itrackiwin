import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DataQualityIssue {
  exercise_id: string;
  exercise_name: string;
  missing_primary_muscle: boolean;
  missing_movement_pattern: boolean;
  missing_equipment_constraints: boolean;
}

interface DataQualityReport {
  report_id: string;
  total_exercises: number;
  primary_muscle_coverage: number;
  movement_pattern_coverage: number;
  equipment_constraints_coverage: number;
  issues_count: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { method } = req;
    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'run_check';

    console.log(`Data Quality Check - Action: ${action}, Method: ${method}`);

    if (method === 'POST' || method === 'GET') {
      if (action === 'run_check') {
        // Run the data quality check function
        console.log('Running data quality check...');
        
        const { data: result, error: rpcError } = await supabase
          .rpc('run_data_quality_check');

        if (rpcError) {
          console.error('RPC Error:', rpcError);
          throw rpcError;
        }

        const report = result as DataQualityReport;
        
        console.log('Data quality check completed:', {
          reportId: report.report_id,
          totalExercises: report.total_exercises,
          issuesFound: report.issues_count
        });

        return new Response(
          JSON.stringify({
            success: true,
            report: {
              id: report.report_id,
              summary: {
                total_exercises: report.total_exercises,
                primary_muscle_coverage: report.primary_muscle_coverage,
                movement_pattern_coverage: report.movement_pattern_coverage,
                equipment_constraints_coverage: report.equipment_constraints_coverage,
                issues_count: report.issues_count
              }
            }
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      }

      if (action === 'get_latest_report') {
        // Get the most recent report
        const { data: latestReport, error: queryError } = await supabase
          .from('data_quality_reports')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (queryError && queryError.code !== 'PGRST116') {
          console.error('Query Error:', queryError);
          throw queryError;
        }

        return new Response(
          JSON.stringify({
            success: true,
            report: latestReport
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      }

      if (action === 'get_trend') {
        // Get trend data for the last 30 days
        const { data: trendData, error: trendError } = await supabase
          .from('data_quality_reports')
          .select('created_at, primary_muscle_coverage_pct, movement_pattern_coverage_pct, equipment_constraints_coverage_pct, total_exercises')
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: true });

        if (trendError) {
          console.error('Trend Query Error:', trendError);
          throw trendError;
        }

        return new Response(
          JSON.stringify({
            success: true,
            trend: trendData || []
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      }
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed or invalid action' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405,
      }
    );

  } catch (error) {
    console.error('Data Quality Check Error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});