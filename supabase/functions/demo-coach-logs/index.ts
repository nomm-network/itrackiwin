import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const startTime = Date.now()
  const sessionId = crypto.randomUUID()

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, userId } = await req.json()

    // Log step 1: Recalibration trigger
    await logStep(supabaseClient, userId, 'recalibrate-trigger', 'trigger_initiated', {
      action,
      userId
    }, { status: 'starting_recalibration' }, sessionId)

    if (action === 'trigger_recalibration' && userId) {
      // Log step 2: User validation
      const profileStart = Date.now()
      const { data: userProfile, error: profileError } = await supabaseClient
        .from('user_profile_fitness')
        .select('experience_level, goal, training_goal, days_per_week')
        .eq('user_id', userId)
        .single()

      if (profileError || !userProfile) {
        await logStep(supabaseClient, userId, 'recalibrate-trigger', 'user_validation', 
          { userId }, 
          { error: 'User profile not found' }, 
          sessionId, false, profileError?.message
        )
        throw new Error('User profile not found')
      }

      await logStep(supabaseClient, userId, 'recalibrate-trigger', 'user_validation', 
        { userId }, 
        { 
          profile_found: true,
          validation_time_ms: Date.now() - profileStart,
          user_experience: userProfile.experience_level
        }, 
        sessionId
      )

      // Log step 3: Stagnation analysis
      const analysisStart = Date.now()
      const { data: recentWorkouts } = await supabaseClient
        .from('workouts')
        .select(`
          id, started_at,
          workout_exercises!inner(
            exercise_id,
            workout_sets!inner(weight, reps, completed_at)
          )
        `)
        .eq('user_id', userId)
        .not('ended_at', 'is', null)
        .gte('started_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('started_at', { ascending: false })
        .limit(10)

      const stagnationAnalysis = analyzeStagnation(recentWorkouts || [])
      
      await logStep(supabaseClient, userId, 'recalibrate-trigger', 'stagnation_analysis', 
        { 
          workout_count: recentWorkouts?.length || 0,
          analysis_period_days: 30
        }, 
        { 
          ...stagnationAnalysis,
          analysis_time_ms: Date.now() - analysisStart
        }, 
        sessionId
      )

      // Log step 4: Recalibration decision
      const shouldRecalibrate = stagnationAnalysis.stagnation_detected || 
                                stagnationAnalysis.performance_decline ||
                                (recentWorkouts?.length || 0) < 3

      await logStep(supabaseClient, userId, 'recalibrate-trigger', 'recalibration_decision', 
        { 
          stagnation_detected: stagnationAnalysis.stagnation_detected,
          performance_decline: stagnationAnalysis.performance_decline,
          workout_count: recentWorkouts?.length || 0
        }, 
        { 
          should_recalibrate: shouldRecalibrate,
          decision_reason: shouldRecalibrate ? 
            (stagnationAnalysis.stagnation_detected ? 'stagnation_detected' : 
             stagnationAnalysis.performance_decline ? 'performance_decline' : 'insufficient_data') :
            'no_recalibration_needed'
        }, 
        sessionId
      )

      if (shouldRecalibrate) {
        // Log step 5: Triggering recalibration
        const { error: recalError } = await supabaseClient.functions.invoke('recalibrate-user-plans', {
          body: { 
            userId,
            trigger_reason: stagnationAnalysis.stagnation_detected ? 'stagnation' : 'performance_decline',
            session_id: sessionId
          }
        })

        if (recalError) {
          await logStep(supabaseClient, userId, 'recalibrate-trigger', 'trigger_recalibration', 
            { userId, session_id: sessionId }, 
            { error: recalError.message }, 
            sessionId, false, recalError.message
          )
          throw recalError
        }

        await logStep(supabaseClient, userId, 'recalibrate-trigger', 'trigger_recalibration', 
          { userId, session_id: sessionId }, 
          { success: true, recalibration_triggered: true }, 
          sessionId
        )
      }

      // Log final completion
      const totalTime = Date.now() - startTime
      await logStep(supabaseClient, userId, 'recalibrate-trigger', 'completion', 
        { session_id: sessionId }, 
        { 
          total_execution_time_ms: totalTime,
          recalibration_triggered: shouldRecalibrate,
          analysis_summary: stagnationAnalysis
        }, 
        sessionId, true, null, totalTime
      )

      return new Response(
        JSON.stringify({ 
          success: true, 
          recalibration_triggered: shouldRecalibrate,
          analysis: stagnationAnalysis,
          execution_time_ms: totalTime,
          session_id: sessionId
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    throw new Error('Invalid action or missing userId')

  } catch (error) {
    console.error('Recalibration trigger error:', error)
    
    // Log error
    try {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )
      
      const requestData = await req.json().catch(() => ({}))
      await logStep(supabaseClient, requestData.userId || 'unknown', 'recalibrate-trigger', 'error', 
        { request_data: requestData }, 
        { error_message: error.message }, 
        sessionId, false, error.message, Date.now() - startTime
      )
    } catch (logError) {
      console.error('Failed to log error:', logError)
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        session_id: sessionId,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})

// Helper function to log coach decisions
async function logStep(
  supabase: any, 
  userId: string, 
  functionName: string, 
  step: string, 
  inputs: any, 
  outputs: any, 
  sessionId: string, 
  success: boolean = true, 
  errorMessage: string | null = null,
  executionTimeMs?: number
) {
  try {
    await supabase.rpc('log_coach_decision', {
      p_user_id: userId,
      p_function_name: functionName,
      p_step: step,
      p_inputs: inputs,
      p_outputs: outputs,
      p_metadata: { timestamp: new Date().toISOString() },
      p_execution_time_ms: executionTimeMs,
      p_success: success,
      p_error_message: errorMessage,
      p_session_id: sessionId
    })
  } catch (logError) {
    console.error('Failed to log coach decision:', logError)
  }
}

function analyzeStagnation(workouts: any[]) {
  const analysis = {
    stagnation_detected: false,
    performance_decline: false,
    workout_count: workouts.length,
    avg_weight_trend: 0,
    recommendations: [] as string[]
  }

  if (workouts.length < 3) {
    analysis.recommendations.push('Insufficient workout data for analysis')
    return analysis
  }

  // Analyze weight trends across exercises
  const exerciseWeights: Record<string, number[]> = {}
  
  workouts.forEach(workout => {
    workout.workout_exercises?.forEach((we: any) => {
      const exerciseId = we.exercise_id
      if (!exerciseWeights[exerciseId]) {
        exerciseWeights[exerciseId] = []
      }
      
      const maxWeight = Math.max(...(we.workout_sets?.map((s: any) => s.weight || 0) || [0]))
      if (maxWeight > 0) {
        exerciseWeights[exerciseId].push(maxWeight)
      }
    })
  })

  // Check for stagnation (same weights for 3+ sessions)
  let stagnantExercises = 0
  let decliningExercises = 0
  
  Object.values(exerciseWeights).forEach(weights => {
    if (weights.length >= 3) {
      const lastThree = weights.slice(-3)
      const allSame = lastThree.every(w => w === lastThree[0])
      const isDecline = weights[weights.length - 1] < weights[0]
      
      if (allSame) stagnantExercises++
      if (isDecline) decliningExercises++
    }
  })

  analysis.stagnation_detected = stagnantExercises >= 2
  analysis.performance_decline = decliningExercises >= 2

  if (analysis.stagnation_detected) {
    analysis.recommendations.push('Consider deload week or exercise variation')
  }
  if (analysis.performance_decline) {
    analysis.recommendations.push('Review recovery and nutrition protocols')
  }

  return analysis
}