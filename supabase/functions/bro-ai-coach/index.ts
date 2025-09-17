// supabase/functions/bro-ai-coach/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...cors },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors })

  try {
    const url = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!url || !serviceRoleKey) {
      console.error('Missing env vars', { hasUrl: !!url, hasKey: !!serviceRoleKey })
      return json({ error: 'Server not configured (env missing).' }, 500)
    }

    // Get user token from auth header
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Missing or invalid auth header')
      return json({ error: 'Authentication required' }, 401)
    }

    const userToken = authHeader.replace('Bearer ', '')
    
    // Create supabase client with user's token for RLS
    const supabase = createClient(url, userToken)

    // Detailed logging for debugging
    console.log('=== BRO AI COACH DEBUG START ===')
    console.log('Request method:', req.method)
    console.log('Request URL:', req.url)
    console.log('Content-Type:', req.headers.get('content-type'))
    console.log('Auth header present:', !!authHeader)
    console.log('User token length:', userToken.length)
    console.log('Request headers:', Object.fromEntries(req.headers.entries()))

    let payload: any
    let rawBody: string = ''
    
    try {
      // Get raw text first for debugging
      rawBody = await req.text()
      console.log('Raw request body:', rawBody)
      console.log('Raw body length:', rawBody.length)
      
      if (!rawBody || rawBody.length === 0) {
        console.log('Empty request body - proceeding with fitness profile lookup')
        payload = {} // Accept empty body
      } else {
        // Try to parse JSON
        payload = JSON.parse(rawBody)
        console.log('Successfully parsed JSON payload:', payload)
      }
    } catch (e) {
      console.error('JSON parsing failed:', e)
      console.error('Raw body that failed to parse:', rawBody)
      return json({ 
        error: 'Invalid JSON body. Could not parse request data.', 
        details: e.message,
        receivedBody: rawBody 
      }, 400)
    }

    // Get user's fitness profile from database instead of requiring payload
    console.log('Getting user fitness profile from database...')
    
    // Get current user from Supabase auth (token already set in client)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      console.error('Failed to get authenticated user:', authError)
      return json({ error: 'Authentication failed' }, 401)
    }
    
    console.log('Authenticated user:', user.id)
    
    const { data: fitnessProfile, error: profileError } = await supabase
      .from('user_profile_fitness')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (profileError) {
      console.error('Failed to get fitness profile:', profileError)
      return json({ 
        error: 'No fitness profile found. Please complete your fitness configuration first.',
        details: profileError.message 
      }, 400)
    }

    if (!fitnessProfile) {
      return json({ 
        error: 'No fitness profile found. Please complete your fitness configuration first.' 
      }, 400)
    }

    console.log('Retrieved fitness profile:', fitnessProfile)

    // Use data from saved fitness profile
    const programData = {
      goal: fitnessProfile.goal,
      experience_level: fitnessProfile.experience_level,
      training_days_per_week: fitnessProfile.training_days_per_week,
      location_type: fitnessProfile.location_type,
      available_equipment: fitnessProfile.available_equipment || [],
      priority_muscle_groups: fitnessProfile.priority_muscle_groups || [],
      time_per_session_min: fitnessProfile.time_per_session_min || 60,
    }

    console.log('Program data from fitness profile:', programData)

    // Call the Postgres function via RPC (user_id comes from auth.uid() in RLS)
    console.log('Calling generate_ai_program RPC with data:', programData)
    const { data, error } = await supabase.rpc('generate_ai_program', programData)

    if (error) {
      console.error('RPC error', error)
      return json({ error: 'Program generation failed at DB layer.', details: error }, 500)
    }

    console.log('RPC success', data)
    return json({ ok: true, data }, 200)
  } catch (e) {
    // Catch absolutely everything and make sure a status code is returned
    console.error('Fatal exception', e)
    return json(
      {
        error: 'Edge Function crashed.',
        // Avoid leaking stack in production if you prefer:
        details: String(e?.message ?? e),
      },
      500
    )
  }
})